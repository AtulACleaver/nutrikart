"""Unit tests for hardened service boundaries, healthcheck, and mutation protection."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_healthcheck_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["database"] == "connected"
    assert "provider_mode" in data
    assert data["version"] == "2.0.0"


def test_public_product_creation_forbidden_without_auth():
    payload = {
        "name": "Malicious Unauthenticated Product",
        "category_id": 1,
        "price_per_unit": 99.0,
    }
    response = client.post("/products/", json=payload)
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]


def test_public_product_deletion_forbidden_without_auth():
    response = client.delete("/products/1")
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]


def test_authorized_admin_mutation(monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET_KEY", "super_secret_admin_key_999")
    headers = {"X-Admin-Token": "super_secret_admin_key_999"}
    payload = {
        "name": "Admin Added Product",
        "category_id": 1,
        "price_per_unit": 120.0,
    }
    response = client.post("/products/", json=payload, headers=headers)
    assert response.status_code == 201
    created_id = response.json()["id"]

    # Delete with admin header
    del_res = client.delete(f"/products/{created_id}", headers=headers)
    assert del_res.status_code == 204
