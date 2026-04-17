"""
Packaging label OCR extraction service for NutriKart Upgrade 2.

Parses text extracted from food packaging labels into structured candidates.
Enforces quality controls: decimal normalization, sugar vs added sugar,
sodium vs salt conversions, and routing to review queues.
Guardrail: Extractor cannot self-verify records; always marks status='pending_review'.
"""

import re
from typing import Dict, Any, Optional, Tuple

class LabelExtractionService:
    def __init__(self):
        # Patterns for standard Indian / FSSAI nutrition tables
        self.patterns = {
            "calories": re.compile(r"(?:energy|calories|kcal)\s*[:\-]?\s*(\d+(?:\.\d+)?)", re.I),
            "protein": re.compile(r"protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "fat": re.compile(r"(?:total\s+fat|fat)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "saturated_fat": re.compile(r"(?:saturated\s+fat|sat\s+fat)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "sugar": re.compile(r"(?:total\s+sugars?|sugar)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "added_sugar": re.compile(r"added\s+sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "fiber": re.compile(r"(?:dietary\s+fiber|fiber|fibre)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "sodium": re.compile(r"sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg", re.I),
            "salt": re.compile(r"salt\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g", re.I),
            "serving": re.compile(r"serving\s+size\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(g|ml)", re.I),
        }

    def extract_from_ocr_text(self, raw_text: str, image_ref: str) -> Tuple[bool, Dict[str, Any], Optional[str]]:
        """
        Parses OCR string.
        Returns: (success, candidate_record, error_or_warning)
        """
        if not raw_text or len(raw_text.strip()) < 10:
            return False, {}, "Unreadable image: insufficient text extracted from label"

        extracted: Dict[str, Any] = {
            "source_type": "label_ocr",
            "source_ref": image_ref,
            "verification_status": "pending_review",
            "measurement_basis": "per_serving",  # Default candidate assumption
            "serving_size": None,
            "serving_unit": "g",
            "calories": None,
            "protein": None,
            "fat": None,
            "saturated_fat": None,
            "sugar": None,
            "added_sugar": None,
            "fiber": None,
            "sodium": None,
        }

        # Detect Basis
        if re.search(r"per\s+100\s*g", raw_text, re.I):
            extracted["measurement_basis"] = "per_100g"
        elif re.search(r"per\s+100\s*ml", raw_text, re.I):
            extracted["measurement_basis"] = "per_100ml"
            extracted["serving_unit"] = "ml"

        # Parse Serving Size
        serving_match = self.patterns["serving"].search(raw_text)
        if serving_match:
            extracted["serving_size"] = float(serving_match.group(1))
            extracted["serving_unit"] = serving_match.group(2).lower()

        # Parse Numeric Macros
        for key in ["calories", "protein", "fat", "saturated_fat", "sugar", "added_sugar", "fiber"]:
            match = self.patterns[key].search(raw_text)
            if match:
                extracted[key] = float(match.group(1))

        # Parse Sodium vs Salt
        sod_match = self.patterns["sodium"].search(raw_text)
        if sod_match:
            extracted["sodium"] = float(sod_match.group(1))
        else:
            salt_match = self.patterns["salt"].search(raw_text)
            if salt_match:
                # Convert Salt (g) -> Sodium (mg): (salt / 2.5) * 1000
                salt_g = float(salt_match.group(1))
                extracted["sodium"] = round((salt_g / 2.5) * 1000.0, 1)
                extracted["sodium_converted_from_salt"] = True

        # Check completeness of vital macros
        missing = [m for m in ["calories", "protein", "fat", "sugar", "sodium"] if extracted[m] is None]
        if len(missing) == 5:
            return False, {}, "Unreadable label: failed to extract any recognized macronutrients"
        elif missing:
            return True, extracted, f"Partial extraction: missing {', '.join(missing)}; routed to review queue"

        return True, extracted, None
