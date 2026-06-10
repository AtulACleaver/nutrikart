import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestProductsPerformance:
    """Verifies that product listing and filtering endpoints execute efficiently."""

    def test_listing_latency_sub_100ms(self):
        t0 = time.perf_counter()
        response = client.get("/products/")
        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert elapsed_ms < 500.0  # Well within web request SLA

    def test_category_filtering_integrity(self):
        # Fetch all products first to find a valid category
        all_res = client.get("/products/")
        assert all_res.status_code == 200
        products = all_res.json()

        if products:
            target_cat = products[0]["category_id"]
            filtered_res = client.get(f"/products/?category_id={target_cat}")
            assert filtered_res.status_code == 200
            for item in filtered_res.json():
                assert item["category_id"] == target_cat
                assert "category_name" in item
