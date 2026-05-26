"""Unit tests for the official Swiggy Instamart provider adapter."""

import pytest
from app.services.providers.base import ProviderMode, ServiceabilityStatus
from app.services.providers.swiggy import SwiggyProvider


def test_swiggy_provider_unauthorized_fallback():
    # Without API key, provider must gracefully indicate unauthorized and fall back to fixtures
    provider = SwiggyProvider(api_key=None)
    assert not provider.is_authorized

    offers = provider.search_offers("Oats")
    assert len(offers) >= 0
    # In unauthorized mode, results are labelled as offline fixture
    for o in offers:
        assert o.source_mode == ProviderMode.FIXTURE
        assert "Fixture" in o.retailer_name


def test_swiggy_provider_serviceability_check():
    provider = SwiggyProvider(api_key=None)
    assert provider.check_serviceability(None) == ServiceabilityStatus.NOT_CONFIGURED
    assert provider.check_serviceability("") == ServiceabilityStatus.NOT_CONFIGURED
    assert provider.check_serviceability("560038") == ServiceabilityStatus.AVAILABLE


def test_swiggy_response_parsing():
    provider = SwiggyProvider(api_key="valid_test_secret_key_12345")
    assert provider.is_authorized

    raw_payload = {
        "data": {
            "items": [
                {
                    "id": "item_991",
                    "name": "Tata Tea Gold Leaf",
                    "price": 240.0,
                    "mrp": 270.0,
                    "in_stock": True,
                    "unit": "pack",
                    "quantity_desc": "500g",
                    "barcode": "8901030999999",
                    "image_url": "https://img.swiggy.example/tea.jpg",
                }
            ]
        }
    }

    offers = provider._parse_swiggy_response(raw_payload)
    assert len(offers) == 1
    offer = offers[0]
    assert offer.sku_id == "instamart_item_991"
    assert offer.retailer_name == "Swiggy Instamart"
    assert offer.price == 240.0
    assert offer.original_price == 270.0
    assert offer.barcode == "8901030999999"
    assert offer.source_mode == ProviderMode.LIVE
