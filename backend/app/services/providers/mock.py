"""Mock quick-commerce provider for testing upstream latency, jitter, and error recovery."""

import time
import random
from typing import List, Optional
from .base import BaseProvider, ProviderMode, RetailerOffer, ServiceabilityStatus
from .fixtures import FixtureProvider, SAMPLE_FIXTURE_OFFERS


class MockProvider(BaseProvider):
    """Configurable mock provider supporting simulated network delay and failure injection."""

    def __init__(
        self,
        simulated_delay_ms: float = 0.0,
        failure_rate: float = 0.0,
        provider_mode: ProviderMode = ProviderMode.FIXTURE,
    ):
        super().__init__(mode=provider_mode)
        self.simulated_delay_ms = simulated_delay_ms
        self.failure_rate = failure_rate
        fixture_provider = FixtureProvider(SAMPLE_FIXTURE_OFFERS)
        self._offers: List[RetailerOffer] = fixture_provider.search_offers(query="")

    def _simulate_network(self):
        if self.simulated_delay_ms > 0:
            time.sleep(self.simulated_delay_ms / 1000.0)

        if self.failure_rate > 0 and random.random() < self.failure_rate:
            raise ConnectionError("Simulated upstream provider connection timeout")

    def check_serviceability(self, locality: Optional[str] = None) -> ServiceabilityStatus:
        self._simulate_network()
        if locality and "unserviceable" in locality.lower():
            return ServiceabilityStatus.UNSERVICEABLE
        return ServiceabilityStatus.AVAILABLE

    def search_offers(
        self, query: str, locality: Optional[str] = None, limit: int = 20
    ) -> List[RetailerOffer]:
        self._simulate_network()

        results = self._offers
        if query:
            q_lower = query.lower()
            results = [o for o in results if q_lower in o.title.lower()]
        return results[:limit]

    def get_offer_by_id(self, sku_id: str) -> Optional[RetailerOffer]:
        self._simulate_network()
        for offer in self._offers:
            if offer.sku_id == sku_id:
                return offer
        return None
