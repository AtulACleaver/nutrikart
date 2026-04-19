import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.models import Product
from app.recommendation import filter_products, _build_allocation, HEALTH_CONSTRAINTS

client = TestClient(app)

class MockProduct:
    """Mock product fixture representing an incomplete product like Whey Protein (ID 1)."""
    def __init__(self, **kwargs):
        self.id = kwargs.get("id", 1)
        self.name = kwargs.get("name", "Incomplete Product")
        self.category_id = kwargs.get("category_id", 1)
        self.price_per_unit = kwargs.get("price_per_unit", Decimal("100.00"))
        self.serving_size = kwargs.get("serving_size", None)
        self.calories = kwargs.get("calories", Decimal("120.00"))
        self.sugar = kwargs.get("sugar", None)
        self.sodium = kwargs.get("sodium", None)
        self.protein = kwargs.get("protein", None)
        self.fat = kwargs.get("fat", None)
        self.saturated_fat = kwargs.get("saturated_fat", None)
        self.fiber = kwargs.get("fiber", None)
        self.image_url = kwargs.get("image_url", "https://example.com/test.jpg")


def test_incomplete_product_rejected_by_diabetic_filter():
    """
    REG-01 FIX VERIFICATION:
    Verifies that products with missing required nutrients (sugar=None)
    are strictly excluded from the diabetic constraint filter.
    """
    incomplete_prod = MockProduct(sugar=None, calories=Decimal("120.00"))
    filtered = filter_products([incomplete_prod], health_condition="diabetic")
    assert len(filtered) == 0, "Missing sugar must be rejected from diabetic filter"


def test_incomplete_product_rejected_by_hypertension_filter():
    """
    REG-01 FIX VERIFICATION:
    Verifies that products with missing sodium are excluded from hypertension filter.
    """
    incomplete_prod = MockProduct(sodium=None, fat=Decimal("2.00"))
    filtered = filter_products([incomplete_prod], health_condition="hypertension")
    assert len(filtered) == 0, "Missing sodium must be rejected from hypertension filter"


def test_missing_nutrients_preserved_as_none():
    """
    REG-02 FIX VERIFICATION:
    Verifies that _build_allocation preserves None/null values rather than coercing to 0.0.
    """
    incomplete_prod = MockProduct(sugar=None, fiber=None, sodium=None)
    allocation = _build_allocation(incomplete_prod, quantity=1, subtotal=100.0, score=10.0)
    
    assert allocation["sugar"] is None, "Missing sugar preserved as None"
    assert allocation["fiber"] is None, "Missing fiber preserved as None"
    assert allocation["sodium"] is None, "Missing sodium preserved as None"


def test_reproduce_empty_recommendation_raises_http_404():
    """
    REG-04 REPRODUCTION:
    Demonstrates that /recommend raises an HTTP 404 error when budget is too low
    or no products match, causing frontend to display a network/server failure.
    
    Existing behavior: raises HTTPException(status_code=404)
    Desired behavior (Upgrade 2): return HTTP 200 with empty recommendations list and diagnostic summary.
    """
    # Extremely low budget ensures no product can be allocated
    response = client.post(
        "/recommend",
        json={"budget": 1.0, "health_condition": "diabetic", "household_size": 1}
    )
    
    # In current baseline, HTTP 404 is returned
    assert response.status_code == 404
    assert "No products match your criteria" in response.json()["detail"]
