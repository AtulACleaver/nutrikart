"""Unit tests for retailer offer provider boundary, static and fixture modes."""

import pytest
from app.services.providers import (
    FixtureProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
    StaticProvider,
    get_provider,
)


def test_fixture_provider_search():
    provider = FixtureProvider()
    offers = provider.search_offers("Atta")
    assert len(offers) >= 1
    assert "Atta" in offers[0].title
    assert offers[0].source_mode == ProviderMode.FIXTURE
    assert offers[0].price == 310.0


def test_fixture_provider_get_by_id():
    provider = FixtureProvider()
    offer = provider.get_offer_by_id("instamart_1001")
    assert offer is not None
    assert offer.sku_id == "instamart_1001"
    assert offer.barcode == "8901030382894"

    non_existent = provider.get_offer_by_id("missing_id")
    assert non_existent is None


def test_fixture_provider_serviceability():
    provider = FixtureProvider()
    assert provider.check_serviceability("560038") == ServiceabilityStatus.AVAILABLE
    assert provider.check_serviceability("") == ServiceabilityStatus.NOT_CONFIGURED
    assert provider.check_serviceability(None) == ServiceabilityStatus.NOT_CONFIGURED
    assert (
        provider.check_serviceability("unserviceable_pincode")
        == ServiceabilityStatus.UNSERVICEABLE
    )


def test_static_provider_search():
    provider = StaticProvider()
    offers = provider.search_offers("")
    assert len(offers) > 0
    assert offers[0].source_mode == ProviderMode.STATIC
    assert offers[0].sku_id.startswith("static_")
    assert provider.check_serviceability() == ServiceabilityStatus.AVAILABLE


def test_provider_factory(monkeypatch):
    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "fixture")
    p = get_provider()
    assert isinstance(p, FixtureProvider)
    assert p.mode == ProviderMode.FIXTURE

    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "static")
    p2 = get_provider()
    assert isinstance(p2, StaticProvider)
    assert p2.mode == ProviderMode.STATIC


def test_retailer_offer_serialization():
    offer = RetailerOffer(
        sku_id="test_sku",
        retailer_name="QuickMart",
        title="Rolled Oats 500g",
        price=120.0,
        original_price=150.0,
        in_stock=True,
    )
    d = offer.to_dict()
    assert d["sku_id"] == "test_sku"
    assert d["retailer_name"] == "QuickMart"
    assert d["price"] == 120.0
    assert d["source_mode"] == "static"
    assert d["serviceability"] == "available"
