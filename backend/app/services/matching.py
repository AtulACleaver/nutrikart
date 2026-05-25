"""Exact product matching service linking retailer offers to verified nutrition records."""

import re
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from app.models import Product
from app.services.providers.base import RetailerOffer


class MatchConfidence(str, Enum):
    EXACT_BARCODE = "exact_barcode"
    REVIEWED_VARIANT = "reviewed_variant"
    AMBIGUOUS_CANDIDATE = "ambiguous_candidate"
    UNMATCHED = "unmatched"


@dataclass
class MatchResult:
    offer_sku_id: str
    confidence: MatchConfidence
    matched_product_id: Optional[int] = None
    matched_product_name: Optional[str] = None
    reason: str = ""
    retained_nutrition_safe: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "offer_sku_id": self.offer_sku_id,
            "confidence": self.confidence.value,
            "matched_product_id": self.matched_product_id,
            "matched_product_name": self.matched_product_name,
            "reason": self.reason,
            "retained_nutrition_safe": self.retained_nutrition_safe,
        }


def normalize_text(text: Optional[str]) -> str:
    """Normalize food titles, strip punctuation and whitespace."""
    if not text:
        return ""
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    return " ".join(cleaned.split())


def extract_pack_grams(pack_desc: Optional[str]) -> Optional[float]:
    """Extract weight in grams from pack description string (e.g. '500g', '1 kg', '200 ml')."""
    if not pack_desc:
        return None
    desc = pack_desc.lower().strip()
    # Match kg
    kg_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kilo)", desc)
    if kg_match:
        return float(kg_match.group(1)) * 1000.0
    # Match g
    g_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:g|gm|grams)", desc)
    if g_match:
        return float(g_match.group(1))
    # Match l / litre
    l_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:l|litre|liter)", desc)
    if l_match:
        return float(l_match.group(1)) * 1000.0
    # Match ml
    ml_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:ml|milli)", desc)
    if ml_match:
        return float(ml_match.group(1))
    return None


class ProductMatcher:
    """Matches retailer offers to verified local nutrition records strictly without speculative inheritance."""

    # Curated exact alias map for verified pack SKUs
    EXACT_REVIWED_ALIASES = {
        ("amul", "masti dahi", 400.0): 2,
        ("aashirvaad", "sharbati atta", 5000.0): 1,
        ("tata", "sampann toor dal", 1000.0): 3,
        ("fortune", "sunflower oil", 1000.0): 4,
        ("saffola", "masala oats", 500.0): 5,
    }

    @classmethod
    def match(cls, offer: RetailerOffer, verified_products: List[Product]) -> MatchResult:
        # Check static match direct link if available
        if offer.sku_id.startswith("static_"):
            try:
                prod_id = int(offer.sku_id.replace("static_", ""))
                for p in verified_products:
                    if p.id == prod_id:
                        return MatchResult(
                            offer_sku_id=offer.sku_id,
                            confidence=MatchConfidence.REVIEWED_VARIANT,
                            matched_product_id=p.id,
                            matched_product_name=p.name,
                            reason="Direct verified catalogue link",
                            retained_nutrition_safe=True,
                        )
            except ValueError:
                pass

        # 1. Barcode Exact Match
        if offer.barcode:
            for p in verified_products:
                if p.source_ref and offer.barcode.strip() == str(p.source_ref).strip():
                    return MatchResult(
                        offer_sku_id=offer.sku_id,
                        confidence=MatchConfidence.EXACT_BARCODE,
                        matched_product_id=p.id,
                        matched_product_name=p.name,
                        reason=f"Exact GTIN/barcode match: {offer.barcode}",
                        retained_nutrition_safe=True,
                    )

        # 2. Reviewed Variant & Pack Identity Match
        offer_norm = normalize_text(offer.title)
        offer_grams = extract_pack_grams(offer.pack_size_desc) or extract_pack_grams(offer.title)

        # 2a. Check exact normalized title match first
        for p in verified_products:
            p_norm = normalize_text(p.name)
            p_grams = float(p.pack_quantity or p.serving_size or 0.0)
            if p_norm == offer_norm:
                # If pack grams are present on both, ensure consistency
                if offer_grams and p_grams > 0 and abs(offer_grams - p_grams) >= 5.0:
                    continue
                return MatchResult(
                    offer_sku_id=offer.sku_id,
                    confidence=MatchConfidence.REVIEWED_VARIANT,
                    matched_product_id=p.id,
                    matched_product_name=p.name,
                    reason="Exact title and variant match",
                    retained_nutrition_safe=True,
                )

        exact_candidates = []
        for p in verified_products:
            p_norm = normalize_text(p.name)
            p_grams = float(p.pack_quantity or p.serving_size or 0.0)

            # Check if all words in verified product exist in offer title (exact variant subsumption)
            p_words = set(p_norm.split())
            offer_words = set(offer_norm.split())
            if p_words.issubset(offer_words) or (len(offer_words) >= 2 and offer_words.issubset(p_words)):
                if offer_grams and p_grams > 0:
                    if abs(offer_grams - p_grams) < 5.0:
                        exact_candidates.append(p)
                else:
                    exact_candidates.append(p)

        if len(exact_candidates) == 1:
            matched = exact_candidates[0]
            return MatchResult(
                offer_sku_id=offer.sku_id,
                confidence=MatchConfidence.REVIEWED_VARIANT,
                matched_product_id=matched.id,
                matched_product_name=matched.name,
                reason="Reviewed title and pack identity match",
                retained_nutrition_safe=True,
            )
        elif len(exact_candidates) > 1:
            # Ambiguous: multiple verified variants match (e.g., plain vs fortified, or multiple pack sizes)
            return MatchResult(
                offer_sku_id=offer.sku_id,
                confidence=MatchConfidence.AMBIGUOUS_CANDIDATE,
                matched_product_id=None,
                matched_product_name=None,
                reason=f"Ambiguous match across {len(exact_candidates)} verified variants; nutrition not inherited",
                retained_nutrition_safe=False,
            )

        # 3. No verified match
        return MatchResult(
            offer_sku_id=offer.sku_id,
            confidence=MatchConfidence.UNMATCHED,
            matched_product_id=None,
            matched_product_name=None,
            reason="No verified nutrition record matches this retailer SKU",
            retained_nutrition_safe=False,
        )
