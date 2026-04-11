"""
Offline test fixtures for NutriKart nutrition services.
Provides exact, partial, and conflicting test cases without requiring network access.
"""

# 1. Exact, fully verified product
EXACT_VERIFIED_OATS = {
    "brand": "Saffola",
    "variant": "Classic Masala Instant Oats",
    "pack_quantity": 225.0,
    "pack_unit": "g",
    "serving_size": 38.0,
    "serving_unit": "g",
    "measurement_basis": "per_serving",
    "calories": 150.0,
    "protein": 4.0,
    "fat": 3.5,
    "saturated_fat": 1.0,
    "sugar": 1.5,
    "fiber": 4.0,
    "sodium": 450.0,
    "source_type": "label_ocr",
    "source_ref": "marico-packaging-label-225g",
}

# 2. Incomplete product (missing required nutrients)
MISSING_REQUIRED_NUTRIENTS_WHEY = {
    "brand": "Generic Brand",
    "variant": "Whey Protein Powder",
    "pack_quantity": 1000.0,
    "pack_unit": "g",
    "serving_size": None,
    "serving_unit": None,
    "measurement_basis": "per_serving",
    "calories": 120.0,
    "protein": None,
    "fat": None,
    "saturated_fat": None,
    "sugar": None,
    "fiber": None,
    "sodium": None,
    "source_type": "seed",
    "source_ref": "legacy-seed-1",
}

# 3. Conflicting data (saturated fat exceeds total fat — chemically impossible)
CONFLICTING_FAT_DATA = {
    "brand": "Defective Brand",
    "variant": "Corrupted Spread",
    "pack_quantity": 200.0,
    "pack_unit": "g",
    "serving_size": 20.0,
    "serving_unit": "g",
    "measurement_basis": "per_serving",
    "calories": 150.0,
    "protein": 2.0,
    "fat": 5.0,
    "saturated_fat": 12.0,  # Invalid: sat_fat > total fat
    "sugar": 1.0,
    "fiber": 0.0,
    "sodium": 50.0,
    "source_type": "label_ocr",
    "source_ref": "ocr-scan-corrupt-01",
}

# 4. Liquid beverage with per_100ml basis
VERIFIED_LIQUID_MILK = {
    "brand": "Amul",
    "variant": "Taaza Homogenised Toned Milk",
    "pack_quantity": 1000.0,
    "pack_unit": "ml",
    "serving_size": 200.0,
    "serving_unit": "ml",
    "measurement_basis": "per_100ml",
    "calories": 58.0,
    "protein": 3.1,
    "fat": 3.0,
    "saturated_fat": 1.9,
    "sugar": 4.7,
    "fiber": 0.0,
    "sodium": 50.0,
    "source_type": "structured_db",
    "source_ref": "off:8901262010053",
}
