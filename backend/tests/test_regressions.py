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


def test_reproduce_incomplete_product_bypasses_diabetic_filter():
    """
    REG-01 REPRODUCTION:
    Demonstrates that products with missing required nutrients (e.g. sugar=None)
    currently pass the diabetic constraint filter instead of being flagged as unknown or excluded.
    
    Existing behavior: product is included in filtered list because 'product_value is None: continue'.
    Desired behavior (Upgrade 2): products with unknown required nutrients must NOT be verified fits.
    """
    incomplete_prod = MockProduct(sugar=None, calories=Decimal("120.00"))
    filtered = filter_products([incomplete_prod], health_condition="diabetic")
    
    # In current baseline, this passes (buggy behavior)
    assert len(filtered) == 1, "Baseline behavior: missing sugar passes diabetic filter"
    assert filtered[0].sugar is None


def test_reproduce_incomplete_product_bypasses_hypertension_filter():
    """
    REG-01 REPRODUCTION:
    Demonstrates that products with missing sodium (sodium=None) pass the hypertension filter.
    """
    incomplete_prod = MockProduct(sodium=None, fat=Decimal("2.00"))
    filtered = filter_products([incomplete_prod], health_condition="hypertension")
    
    assert len(filtered) == 1, "Baseline behavior: missing sodium passes hypertension filter"
    assert filtered[0].sodium is None


def test_reproduce_missing_nutrients_silently_coerced_to_zero():
    """
    REG-02 REPRODUCTION:
    Demonstrates that _build_allocation coerces missing (None) nutrient fields
    into 0.0, disguising missing information as measured zero.
    
    Existing behavior: 'sugar': float(product.sugar) if product.sugar else 0 -> 0.0
    Desired behavior (Upgrade 2): preserve None/null or provide explicit provenance.
    """
    incomplete_prod = MockProduct(sugar=None, fiber=None, sodium=None)
    allocation = _build_allocation(incomplete_prod, quantity=1, subtotal=100.0, score=10.0)
    
    # In current baseline, missing fields are coerced to 0
    assert allocation["sugar"] == 0, "Baseline behavior: sugar None coerced to 0"
    assert allocation["fiber"] == 0, "Baseline behavior: fiber None coerced to 0"
    assert allocation["sodium"] == 0, "Baseline behavior: sodium None coerced to 0"


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
