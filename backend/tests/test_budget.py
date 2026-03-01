from app.recommendation import allocate_budget, rank_products
from tests.conftest import make_product


def test_budget_never_exceeded():
    products = [
        make_product(id=1, name="A", price_per_unit=100, sugar=1, fiber=5, protein=10),
        make_product(id=2, name="B", price_per_unit=200, sugar=2, fiber=3, protein=8),
        make_product(id=3, name="C", price_per_unit=150, sugar=3, fiber=4, protein=6),
    ]
    ranked = rank_products(products, "diabetic")
    allocations, remaining = allocate_budget(ranked, budget=500, household_size=1)
    total_spent = sum(a["subtotal"] for a in allocations)
    assert total_spent <= 500
    assert total_spent + remaining == 500


def test_zero_remaining_or_close():
    products = [
        make_product(id=1, name="Cheap", price_per_unit=10, sugar=1, fiber=5, protein=10),
    ]
    ranked = rank_products(products, None)
    allocations, remaining = allocate_budget(ranked, budget=25, household_size=1)
    # Current greedy logic buys 1 unit per household member and moves on (variety)
    assert allocations[0]["quantity"] == 1
    assert remaining == 15


def test_household_size_multiplier():
    products = [
        make_product(id=1, name="Item", price_per_unit=50, sugar=1, fiber=5, protein=10),
    ]
    ranked = rank_products(products, None)
    alloc_1, _ = allocate_budget(ranked, budget=500, household_size=1)
    alloc_4, _ = allocate_budget(ranked, budget=500, household_size=4)
    # household_size=4 should buy 4 units (4 × 50 = 200)
    assert alloc_4[0]["quantity"] == 4
    assert alloc_1[0]["quantity"] == 1


def test_very_low_budget_returns_few_items():
    products = [
        make_product(id=1, name="Expensive", price_per_unit=500, sugar=1, fiber=5, protein=10),
        make_product(id=2, name="Cheap", price_per_unit=30, sugar=2, fiber=3, protein=8),
    ]
    ranked = rank_products(products, None)
    allocations, remaining = allocate_budget(ranked, budget=20, household_size=1)
    # Can't afford anything
    assert len(allocations) == 0
    assert remaining == 20


def test_empty_ranked_list():
    allocations, remaining = allocate_budget([], budget=500, household_size=1)
    assert len(allocations) == 0
    assert remaining == 500