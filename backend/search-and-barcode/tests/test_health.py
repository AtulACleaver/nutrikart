import json
from fastapi.testclient import TestClient
import pytest
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from queary import app
import queary

client = TestClient(app)

class DummyResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code

    def json(self):
        return self._json

    def raise_for_status(self):
        if not (200 <= self.status_code < 300):
            raise Exception(f"HTTP {self.status_code}")


def test_search_monkeypatch(monkeypatch):
    sample = {
        "products": [
            {"code": "111", "product_name": "Apple", "brands": "BrandA", "image_small_url": None},
            {"code": "222", "product_name": "Banana", "brands": "BrandB", "image_small_url": None},
            {"code": "333", "product_name": "Carrot", "brands": "BrandC", "image_small_url": None},
            {"code": "444", "product_name": "Dates", "brands": "BrandD", "image_small_url": None},
            {"code": "555", "product_name": "Egg", "brands": "BrandE", "image_small_url": None},
        ]
    }

    def fake_get(url, params=None, timeout=None):
        return DummyResponse(sample, 200)

    monkeypatch.setattr(queary.requests, "get", fake_get)

    r = client.get("/search", params={"query": "fruit", "limit": 5})
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 5
    assert data["products"][0]["product_name"] == "Apple"


def test_product_monkeypatch(monkeypatch):
    product_json = {"status": 1, "product": {"code": "111", "product_name": "Apple", "brands": "BrandA", "nutriments": {"sugars_100g": 10}, "nutriscore_grade": "b"}}

    def fake_get(url, timeout=None):
        return DummyResponse(product_json, 200)

    monkeypatch.setattr(queary.requests, "get", fake_get)

    r = client.get("/product/111")
    assert r.status_code == 200
    data = r.json()
    assert data["nutri_score"] == "b"
    assert data["nutriments"]["sugars_100g"] == 10
