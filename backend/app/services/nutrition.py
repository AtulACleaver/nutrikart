"""
Open Food Facts structured nutrition lookup service for NutriKart Upgrade 2.

Complies with Open Food Facts API v2 standards and ODbL license terms.
Attribution requirement: "Data from Open Food Facts, licensed under ODbL."
"""

import logging
import urllib.request
import json
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

OFF_API_URL = "https://world.openfoodfacts.org/api/v2/product"
USER_AGENT = "NutriKart-Scout/2.0 (contact@nutrikart.local)"

# Offline fixture cache for testing and resilient local development
OFFLINE_FIXTURES: Dict[str, Dict[str, Any]] = {
    "8901491102047": {
        "status": 1,
        "code": "8901491102047",
        "product": {
            "product_name": "Quaker Multigrain Rolled Oats Porridge",
            "brands": "Quaker",
            "quantity": "600 g",
            "serving_size": "30 g",
            "nutriments": {
                "energy-kcal_serving": 115.0,
                "energy-kcal_100g": 383.0,
                "proteins_serving": 4.0,
                "proteins_100g": 13.3,
                "fat_serving": 2.2,
                "fat_100g": 7.3,
                "saturated-fat_serving": 0.4,
                "saturated-fat_100g": 1.3,
                "sugars_serving": 0.5,
                "sugars_100g": 1.7,
                "fiber_serving": 3.5,
                "fiber_100g": 11.7,
                "sodium_serving": 0.005,  # In grams (5 mg)
                "sodium_100g": 0.017,
            }
        }
    },
    "8901262010053": {
        "status": 1,
        "code": "8901262010053",
        "product": {
            "product_name": "Amul Taaza Toned Milk",
            "brands": "Amul",
            "quantity": "1 L",
            "serving_size": "200 ml",
            "nutriments": {
                "energy-kcal_100g": 58.0,
                "proteins_100g": 3.1,
                "fat_100g": 3.0,
                "saturated-fat_100g": 1.9,
                "sugars_100g": 4.7,
                "fiber_100g": 0.0,
                "sodium_100g": 0.05,  # 50 mg
            }
        }
    }
}


class StructuredNutritionService:
    def __init__(self, offline_mode: bool = False):
        self.offline_mode = offline_mode

    def lookup_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Query Open Food Facts by barcode. Returns structured candidate.
        A barcode lookup produces a candidate that still requires recipe/variant verification.
        """
        barcode = barcode.strip()
        data = None

        if barcode in OFFLINE_FIXTURES or self.offline_mode:
            data = OFFLINE_FIXTURES.get(barcode)

        if not data and not self.offline_mode:
            url = f"{OFF_API_URL}/{barcode}.json"
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            try:
                with urllib.request.urlopen(req, timeout=4.0) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
            except Exception as e:
                logger.warning("Failed live lookup for %s: %s; checking offline fallback", barcode, e)
                data = OFFLINE_FIXTURES.get(barcode)

        if not data or data.get("status") != 1:
            return None

        product_data = data.get("product", {})
        nutriments = product_data.get("nutriments", {})

        # Determine basis
        has_serving = "energy-kcal_serving" in nutriments
        basis = "per_serving" if has_serving else "per_100g"

        serving_size_raw = product_data.get("serving_size", "")
        serving_val, serving_unit = self._parse_serving(serving_size_raw)

        # Convert sodium from OFF (OFF stores sodium in grams; NutriKart uses mg)
        sodium_g = nutriments.get("sodium_serving" if has_serving else "sodium_100g", 0.0)
        sodium_mg = round(float(sodium_g or 0.0) * 1000.0, 1)

        candidate = {
            "barcode": barcode,
            "product_name": product_data.get("product_name"),
            "brand": product_data.get("brands"),
            "measurement_basis": basis,
            "serving_size": serving_val,
            "serving_unit": serving_unit,
            "calories": float(nutriments.get("energy-kcal_serving" if has_serving else "energy-kcal_100g", 0.0) or 0.0),
            "protein": float(nutriments.get("proteins_serving" if has_serving else "proteins_100g", 0.0) or 0.0),
            "fat": float(nutriments.get("fat_serving" if has_serving else "fat_100g", 0.0) or 0.0),
            "saturated_fat": float(nutriments.get("saturated-fat_serving" if has_serving else "saturated-fat_100g", 0.0) or 0.0),
            "sugar": float(nutriments.get("sugars_serving" if has_serving else "sugars_100g", 0.0) or 0.0),
            "fiber": float(nutriments.get("fiber_serving" if has_serving else "fiber_100g", 0.0) or 0.0),
            "sodium": sodium_mg,
            "source_type": "structured_db",
            "source_ref": f"off:{barcode}",
            "attribution": "Data from Open Food Facts, licensed under ODbL",
            # Strict rule: automated lookup generates candidate, never automatically 'verified'
            "verification_status": "pending_review",
        }
        return candidate

    def search_candidates_by_name(self, query: str) -> List[Dict[str, Any]]:
        """
        Search candidate products by text query.
        Guardrail: Name query NEVER directly verifies a record; always returns candidates for human/evidence check.
        """
        query_norm = query.lower().strip()
        results = []
        for barcode, entry in OFFLINE_FIXTURES.items():
            p = entry.get("product", {})
            name = p.get("product_name", "").lower()
            brand = p.get("brands", "").lower()
            if query_norm in name or query_norm in brand:
                cand = self.lookup_by_barcode(barcode)
                if cand:
                    cand["match_method"] = "name_search"
                    results.append(cand)
        return results

    def _parse_serving(self, serving_str: str) -> tuple[Optional[float], Optional[str]]:
        if not serving_str:
            return None, None
        parts = serving_str.strip().split()
        try:
            val = float(parts[0])
            unit = parts[1] if len(parts) > 1 else "g"
            return val, unit
        except (ValueError, IndexError):
            return None, None
