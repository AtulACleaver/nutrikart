import pytest
from types import SimpleNamespace
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.recommendation import (
    generate_selection_reason,
    explain_product_exclusion,
    get_recommendation,
)

client = TestClient(app)

def test_generate_selection_reason_deterministic_numbers():
    p = SimpleNamespace(
        id=1,
        name="Organic Almonds",
        calories=160,
        protein=6.0,
        sugar=1.0,
        fiber=3.5,
        sodium=1.0,
        saturated_fat=1.0,
    )
    # Diabetic
    reason_diab = generate_selection_reason(p, "diabetic", 15.2)
    assert "1.0g sugar" in reason_diab
    assert "5.0g limit" in reason_diab
    assert "6.0g protein" in reason_diab
    assert "score: +15.2" in reason_diab

    # Hypertension
    reason_hyp = generate_selection_reason(p, "hypertension", 12.0)
    assert "1.0mg sodium" in reason_hyp
    assert "140.0mg limit" in reason_hyp
    assert "1.0g sat-fat" in reason_hyp

    # Weight loss
    reason_wl = generate_selection_reason(p, "weight_loss", 8.5)
    assert "160.0 kcal" in reason_wl
    assert "200.0 kcal limit" in reason_wl


def test_explain_product_exclusion_deterministic_numbers():
    # Product with excess sugar for diabetic
    high_sugar_prod = SimpleNamespace(
        id=2,
        name="Sweet Soda",
        sugar=12.0,
        measurement_basis="per_serving",
        serving_size=100,
        verification_status="verified",
    )
    reason = explain_product_exclusion(high_sugar_prod, "diabetic")
    assert "sugar (12.0g/serving) exceeds diabetic limit of 5.0g" in reason

    # Unverified product
    unverified_prod = SimpleNamespace(
        id=3,
        name="Mystery Snack",
        verification_status="unverified_unknown",
    )
    unverified_reason = explain_product_exclusion(unverified_prod, "diabetic")
    assert "unverified nutritional profile" in unverified_reason


def test_recommendation_includes_explanations_and_exclusions():
    response = client.post("/recommend", json={
        "budget": 500,
        "health_condition": "diabetic",
        "household_size": 1,
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0
    for rec in data["recommendations"]:
        assert rec["selection_reason"] is not None
        assert "Selected:" in rec["selection_reason"]
        assert "score:" in rec["selection_reason"]

    assert "exclusions" in data
    assert isinstance(data["exclusions"], list)
    assert len(data["exclusions"]) > 0
    for exc in data["exclusions"]:
        assert "id" in exc
        assert "name" in exc
        assert "reason" in exc
        assert "Excluded:" in exc["reason"]
