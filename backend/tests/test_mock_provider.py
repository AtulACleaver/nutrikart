import pytest
import time
from app.services.providers.mock import MockProvider
from app.services.providers.base import ServiceabilityStatus, ProviderMode


class TestMockProvider:
    """Verifies that MockProvider simulates realistic network dynamics and failures."""

    def test_mock_provider_fetches_fixture_offers(self):
        provider = MockProvider(simulated_delay_ms=0.0)
        offers = provider.search_offers(query="")
        assert len(offers) > 0
        assert provider.mode == ProviderMode.FIXTURE

    def test_mock_provider_query_filtering(self):
        provider = MockProvider(simulated_delay_ms=0.0)
        oats_offers = provider.search_offers(query="oats")
        for o in oats_offers:
            assert "oats" in o.title.lower()

    def test_mock_provider_simulates_latency(self):
        provider = MockProvider(simulated_delay_ms=40.0)
        t0 = time.perf_counter()
        provider.search_offers(query="")
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        assert elapsed_ms >= 35.0

    def test_mock_provider_simulates_failure_rate(self):
        provider = MockProvider(failure_rate=1.0)
        with pytest.raises(ConnectionError, match="Simulated upstream"):
            provider.search_offers(query="")

    def test_mock_provider_serviceability_boundary(self):
        provider = MockProvider()
        assert provider.check_serviceability("Koramangala, Bangalore") == ServiceabilityStatus.AVAILABLE
        assert provider.check_serviceability("unserviceable_zone") == ServiceabilityStatus.UNSERVICEABLE
