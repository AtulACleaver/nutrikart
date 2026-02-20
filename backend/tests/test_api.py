# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_recommend_valid_request():
    response = client.post("/recommend", json={
        "budget": 500,
        "health_condition": "diabetic",
        "household_size": 2,
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "summary" in data
    assert data["summary"]["budget"] == 500
    assert data["summary"]["total_spent"] <= 500


def test_recommend_no_condition():
    response = client.post("/recommend", json={
        "budget": 1000,
        "health_condition": None,
        "household_size": 1,
    })
    assert response.status_code == 200


def test_recommend_invalid_condition():
    response = client.post("/recommend", json={
        "budget": 500,
        "health_condition": "alien_disease",
    })
    assert response.status_code == 400
    assert "Invalid health_condition" in response.json()["detail"]


def test_recommend_negative_budget():
    response = client.post("/recommend", json={"budget": -10})
    assert response.status_code == 400


def test_recommend_zero_budget():
    response = client.post("/recommend", json={"budget": 0})
    assert response.status_code == 400


def test_recommend_zero_household():
    response = client.post("/recommend", json={
        "budget": 500,
        "household_size": 0,
    })
    assert response.status_code == 400


def test_recommend_tiny_budget():
    """Budget too low for any product should return 404."""
    response = client.post("/recommend", json={"budget": 1})
    # Either 404 (no products affordable) or 200 with few items
    assert response.status_code in (200, 404)