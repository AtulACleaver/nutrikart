import pytest
from app.lp_optimizer import allocate_budget_lp
from app.recommendation import rank_products
from tests.conftest import make_product

class TestLPBasics:
    """Core LP allocation behavior."""

    def test_budget_never_exceeded(self):
        products = [
            make_product(id=1, name="A", price_per_unit=100, sugar=1, fiber=5, protein=10),
            make_product(id=2, name="B", price_per_unit=200, sugar=2, fiber=3, protein=8),
            make_product(id=3, name="C", price_per_unit=150, sugar=3, fiber=4, protein=6),
        ]
        ranked = rank_products(products, "diabetic")
        allocations, remaining = allocate_budget_lp(ranked, budget=500, household_size=1)
        total_spent = sum(a["subtotal"] for a in allocations)
        assert total_spent <= 500
        assert abs(total_spent + remaining - 500) < 0.01

    def test_maximizes_score_over_greedy(self):
        """LP should find equal or better total score than greedy."""
        products = [
            make_product(id=1, name="Expensive Good", price_per_unit=200,
                         sugar=1, fiber=8, protein=15, calories=100,
                         sodium=30, fat=1, saturated_fat=0.5),
            make_product(id=2, name="Cheap Decent", price_per_unit=60,
                         sugar=2, fiber=5, protein=10, calories=120,
                         sodium=50, fat=2, saturated_fat=1),
            make_product(id=3, name="Cheap Good", price_per_unit=50,
                         sugar=1, fiber=6, protein=12, calories=90,
                         sodium=40, fat=1.5, saturated_fat=0.5),
        ]
        ranked = rank_products(products, "diabetic")

        from app.recommendation import allocate_budget
        g_alloc, _ = allocate_budget(ranked, budget=300, household_size=1)
        lp_alloc, _ = allocate_budget_lp(ranked, budget=300, household_size=1)

        # In greedy, score is in 'score_raw'
        g_score = sum(a["score_raw"] * a["quantity"] for a in g_alloc)
        lp_score = sum(a["score_raw"] * a["quantity"] for a in lp_alloc)
        assert lp_score >= g_score

    def test_empty_products(self):
        allocations, remaining = allocate_budget_lp([], budget=500, household_size=1)
        assert len(allocations) == 0
        assert remaining == 500

    def test_zero_budget(self):
        products = [make_product(id=1, name="A", price_per_unit=100)]
        ranked = rank_products(products, None)
        allocations, remaining = allocate_budget_lp(ranked, budget=0)
        assert len(allocations) == 0

    def test_household_size_affects_quantity(self):
        products = [
            make_product(id=1, name="Item", price_per_unit=10,
                         sugar=1, fiber=5, protein=10),
        ]
        ranked = rank_products(products, None)
        # household_size=1 -> max_qty=3
        alloc_1, _ = allocate_budget_lp(ranked, budget=500, household_size=1)
        # household_size=4 -> max_qty=12
        alloc_4, _ = allocate_budget_lp(ranked, budget=500, household_size=4)
        
        if alloc_1 and alloc_4:
            assert alloc_4[0]["quantity"] > alloc_1[0]["quantity"]

    def test_quantities_are_integers(self):
        products = [
            make_product(id=1, name="A", price_per_unit=33.3,
                         sugar=1, fiber=5, protein=10),
        ]
        ranked = rank_products(products, None)
        allocations, _ = allocate_budget_lp(ranked, budget=100, household_size=3)
        for a in allocations:
            assert isinstance(a["quantity"], int)

class TestLPDiversity:
    """Category diversity constraints."""

    def test_min_categories_enforced(self):
        products = [
            make_product(id=1, name="Cat1 Item1", category_id=1,
                         price_per_unit=50, sugar=1, fiber=8, protein=15),
            make_product(id=2, name="Cat2 Item1", category_id=2,
                         price_per_unit=80, sugar=2, fiber=5, protein=10),
            make_product(id=3, name="Cat3 Item1", category_id=3,
                         price_per_unit=70, sugar=3, fiber=4, protein=8),
        ]
        ranked = rank_products(products, "diabetic")
        # Budget=500, household=1 (max_qty=3). 
        # Without diversity, it might buy 3 of Cat1 Item1.
        # With min_categories=3, it must buy at least one from each.
        allocations, _ = allocate_budget_lp(
            ranked, budget=500, household_size=1, min_categories=3
        )
        categories_in_result = set(a["category_id"] for a in allocations)
        assert len(categories_in_result) >= 3

    def test_infeasible_diversity_falls_back(self):
        """If min_categories=5 but only 2 categories exist, should fall back to basic LP."""
        products = [
            make_product(id=1, name="A", category_id=1, price_per_unit=50,
                         sugar=1, fiber=5, protein=10),
            make_product(id=2, name="B", category_id=2, price_per_unit=60,
                         sugar=2, fiber=3, protein=8),
        ]
        ranked = rank_products(products, None)
        allocations, remaining = allocate_budget_lp(
            ranked, budget=500, household_size=1, min_categories=5
        )
        # Should still return something (fallback to no diversity)
        assert len(allocations) > 0
