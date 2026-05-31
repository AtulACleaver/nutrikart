"""Staging smoke tests verifying provider isolation and source mode disclosures."""

from app.services.matching import ProductMatcher
from app.services.providers import FixtureProvider, StaticProvider, get_provider
from app.services.providers.base import ProviderMode, ServiceabilityStatus


def test_staging_smoke_static_mode():
    provider = StaticProvider()
    offers = provider.search_offers("oats")
    assert len(offers) > 0
    for offer in offers:
        assert offer.source_mode == ProviderMode.STATIC
        assert offer.sku_id.startswith("static_")
        assert offer.price > 0


def test_staging_smoke_fixture_simulation():
    provider = FixtureProvider()
    offers = provider.search_offers("Atta")
    assert len(offers) > 0
    first = offers[0]
    assert first.source_mode == ProviderMode.FIXTURE
    assert first.barcode == "8901030382894"


def test_staging_smoke_isolation_guarantee(monkeypatch):
    # Live mode without credentials must safely fallback without throwing
    monkeypatch.setenv("NUTRIKART_PROVIDER_MODE", "live")
    monkeypatch.delenv("SWIGGY_PARTNER_API_KEY", raising=False)

    provider = get_provider()
    offers = provider.search_offers("milk")
    assert isinstance(offers, list)
    # Status check remains coherent
    status = provider.check_serviceability("560038")
    assert status in (ServiceabilityStatus.AVAILABLE, ServiceabilityStatus.NOT_CONFIGURED)
