import pytest
from decimal import Decimal
from app.recommendation import get_recommendation, rank_products, filter_products
from app.models import Product

def create_catalog():
    return [
        Product(
            id=101,
            name="High Fiber Rolled Oats",
            category_id=1,
            price_per_unit=Decimal("120.00"),
            serving_size=Decimal("40.00"),
            calories=Decimal("140.00"),
            sugar=Decimal("0.50"),
            sodium=Decimal("5.00"),
            protein=Decimal("6.00"),
            fat=Decimal("2.50"),
            saturated_fat=Decimal("0.50"),
            fiber=Decimal("5.00"),
            measurement_basis="per_serving",
            verification_status="verified",
        ),
        Product(
            id=102,
            name="Sweet Breakfast Cereal",
            category_id=1,
            price_per_unit=Decimal("95.00"),
            serving_size=Decimal("30.00"),
            calories=Decimal("180.00"),
            sugar=Decimal("14.00"),  # Violates diabetic limit (max 5.0g)
            sodium=Decimal("120.00"),
            protein=Decimal("2.00"),
            fat=Decimal("1.50"),
            saturated_fat=Decimal("0.40"),
            fiber=Decimal("1.00"),
            measurement_basis="per_serving",
            verification_status="verified",
        ),
        Product(
            id=103,
            name="Salty Potato Crisps",
            category_id=3,
            price_per_unit=Decimal("30.00"),
            serving_size=Decimal("30.00"),
            calories=Decimal("160.00"),
            sugar=Decimal("0.50"),
            sodium=Decimal("350.00"),  # Violates hypertension limit (max 200mg)
            protein=Decimal("1.50"),
            fat=Decimal("9.00"),       # Violates hypertension fat limit (max 5.0g)
            saturated_fat=Decimal("3.50"),
            fiber=Decimal("1.00"),
            measurement_basis="per_serving",
            verification_status="verified",
        ),
        Product(
            id=104,
            name="Toned Fresh Dahi Curd",
            category_id=2,
            price_per_unit=Decimal("35.00"),
            serving_size=Decimal("100.00"),
            calories=Decimal("62.00"),
            sugar=Decimal("4.50"),
            sodium=Decimal("40.00"),
            protein=Decimal("4.00"),
            fat=Decimal("3.00"),
            saturated_fat=Decimal("1.80"),
            fiber=Decimal("0.00"),
            measurement_basis="per_serving",
            verification_status="verified",
        ),
    ]

def test_allocation_diabetic_profile_excludes_high_sugar():
    catalog = create_catalog()
    result = get_recommendation(catalog, health_condition="diabetic", budget=500.0, household_size=2)
    recs = result["recommendations"]
    
    # Assert high sugar cereal (id 102) was excluded
    rec_ids = [r["id"] for r in recs]
    assert 102 not in rec_ids
    assert 101 in rec_ids
    assert result["summary"]["total_spent"] <= 500.0
    assert result["summary"]["is_fallback"] is True

def test_allocation_hypertension_profile_excludes_high_sodium():
    catalog = create_catalog()
    result = get_recommendation(catalog, health_condition="hypertension", budget=300.0, household_size=1)
    recs = result["recommendations"]
    
    # Assert salty crisps (id 103) was excluded
    rec_ids = [r["id"] for r in recs]
    assert 103 not in rec_ids
    assert result["summary"]["total_spent"] <= 300.0

def test_allocation_greedy_vs_lp_consistency():
    catalog = create_catalog()
    result_lp = get_recommendation(catalog, health_condition=None, budget=300.0, household_size=2, use_lp=True)
    result_greedy = get_recommendation(catalog, health_condition=None, budget=300.0, household_size=2, use_lp=False)
    
    assert result_lp["summary"]["total_spent"] <= 300.0
    assert result_greedy["summary"]["total_spent"] <= 300.0
    assert result_lp["summary"]["allocation_method"] == "lp"
    assert result_greedy["summary"]["allocation_method"] == "greedy"
