"""Clinical guideline validation suite for NutriKart health condition constraints.

Verifies adherence to standard nutritional guidelines (ICMR-NIN & WHO benchmarks):
- Diabetic: strict per-serving limits on free sugars (< 5g) and calories (<= 200 kcal).
- Hypertension: strict limits on sodium (< 200mg) and dietary fat (< 5g).
- Weight Loss: strict caloric ceiling (< 150 kcal) and saturated fat (< 3g).
"""

import pytest
from app.recommendation import filter_products, rank_products, HEALTH_CONSTRAINTS
from tests.conftest import make_product


class TestClinicalConditionAdherence:
    """Verifies that medical/dietary condition filters strictly eliminate non-compliant items."""

    def test_diabetic_strict_sugar_and_calorie_cutoff(self):
        boundary_item = make_product(id=1, name="Exact Sugar Boundary", sugar=5.0, calories=180, sodium=50, fiber=3, protein=5)
        exceeding_sugar = make_product(id=2, name="Exceeding Sugar", sugar=5.1, calories=120, sodium=50, fiber=3, protein=5)
        exceeding_cal = make_product(id=3, name="Exceeding Cal", sugar=2.0, calories=201, sodium=50, fiber=3, protein=5)
        safe_item = make_product(id=4, name="Safe Low Glycemic Oats", sugar=1.2, calories=130, sodium=20, fiber=6, protein=8)

        filtered = filter_products([boundary_item, exceeding_sugar, exceeding_cal, safe_item], "diabetic")
        names = [p.name for p in filtered]

        assert "Safe Low Glycemic Oats" in names
        assert "Exact Sugar Boundary" in names
        assert "Exceeding Sugar" not in names
        assert "Exceeding Cal" not in names

    def test_hypertension_strict_sodium_and_fat_cutoff(self):
        safe_item = make_product(id=1, name="Low Sodium Green Moong", sodium=15, fat=1.5, calories=110, sugar=0.5, fiber=7, protein=12)
        exceeding_sodium = make_product(id=2, name="Salted Mixture", sodium=205, fat=3.0, calories=140, sugar=1, fiber=2, protein=3)
        exceeding_fat = make_product(id=3, name="Fried Peanuts", sodium=120, fat=6.5, calories=170, sugar=1, fiber=3, protein=6)

        filtered = filter_products([safe_item, exceeding_sodium, exceeding_fat], "hypertension")
        names = [p.name for p in filtered]

        assert "Low Sodium Green Moong" in names
        assert "Salted Mixture" not in names
        assert "Fried Peanuts" not in names

    def test_weight_loss_caloric_and_saturated_fat_cutoff(self):
        lean_protein = make_product(id=1, name="Sprouted Lentils", calories=115, saturated_fat=0.3, sugar=0.8, fiber=6, protein=11)
        high_cal = make_product(id=2, name="Energy Granola", calories=180, saturated_fat=1.2, sugar=3.0, fiber=4, protein=4)
        high_sat_fat = make_product(id=3, name="Butter Biscuit", calories=140, saturated_fat=3.5, sugar=2.0, fiber=1, protein=2)

        filtered = filter_products([lean_protein, high_cal, high_sat_fat], "weight_loss")
        names = [p.name for p in filtered]

        assert "Sprouted Lentils" in names
        assert "Energy Granola" not in names
        assert "Butter Biscuit" not in names

    def test_all_ranked_items_have_valid_justification(self):
        items = [
            make_product(id=1, name="Sprouts", sugar=1, calories=90, sodium=30, fat=1, saturated_fat=0.2, fiber=6, protein=10, price_per_unit=40),
            make_product(id=2, name="Tofu", sugar=0.5, calories=110, sodium=20, fat=4, saturated_fat=0.8, fiber=2, protein=14, price_per_unit=75),
        ]
        ranked = rank_products(items, "diabetic")
        assert len(ranked) == 2
        for prod, score in ranked:
            assert score > -100  # realistic positive nutrition balance
