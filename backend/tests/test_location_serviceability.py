"""Unit tests for location serviceability endpoint."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_serviceability_not_configured_when_no_locality(monkeypatch):
    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "fixture")
    response = client.get("/location/serviceability")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_configured"
    assert data["locality"] is None
    assert "No location selected" in data["message"]


def test_serviceability_available_for_valid_locality(monkeypatch):
    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "fixture")
    response = client.get("/location/serviceability?locality=560038")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "available"
    assert data["locality"] == "560038"
    assert "serviceable" in data["message"]


def test_serviceability_unserviceable_locality(monkeypatch):
    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "fixture")
    response = client.get("/location/serviceability?locality=unserviceable_pincode")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unserviceable"
    assert "unavailable" in data["message"]
