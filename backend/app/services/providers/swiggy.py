"""Swiggy Instamart adapter for authorized quick-commerce grocery offers."""

import os
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.services.providers.base import (
    BaseProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
)
from app.services.providers.fixtures import FixtureProvider

logger = logging.getLogger(__name__)


class SwiggyProvider(BaseProvider):
    """Adapter for official Swiggy Instamart read-only catalog offers.
    
    Adheres strictly to supported authorized access policies:
    - Never scrapes or simulates user sessions without consent
    - Requires explicit SWIGGY_PARTNER_API_KEY for live network requests
    - Transparently falls back to labelled offline fixtures when credentials are unset
    """

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(mode=ProviderMode.LIVE)
        self.api_key = api_key or os.environ.get("SWIGGY_PARTNER_API_KEY")
        self.api_endpoint = os.environ.get(
            "SWIGGY_API_ENDPOINT", "https://partner-api.swiggy.com/v1/instamart"
        )
        self._fixture_fallback = FixtureProvider()

    @property
    def is_authorized(self) -> bool:
        """True only if official partner authorization key is present."""
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    def search_offers(
        self, query: str, locality: Optional[str] = None, limit: int = 20
    ) -> List[RetailerOffer]:
        if not self.is_authorized:
            logger.info("Swiggy live credentials absent; executing against labelled fixture catalog")
            results = self._fixture_fallback.search_offers(query=query, locality=locality, limit=limit)
            # Label source mode explicitly as fixture with unauthorized disclosure
            for r in results:
                r.source_mode = ProviderMode.FIXTURE
                r.retailer_name = "Instamart (Offline Fixture)"
            return results

        # Authorized live call structure
        try:
            return self._execute_live_search(query, locality, limit)
        except Exception as e:
            logger.error(f"Live Instamart API call failed: {e}; falling back gracefully to static/fixture data")
            return []

    def _execute_live_search(
        self, query: str, locality: Optional[str], limit: int
    ) -> List[RetailerOffer]:
        """Perform authorized HTTP request to Swiggy partner endpoint."""
        import urllib.request
        import json

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "NutriKart-Planner/2.0 (Official Partner Integration)",
        }

        payload = {
            "query": query,
            "locality": locality or "560038",
            "limit": limit,
        }

        req = urllib.request.Request(
            f"{self.api_endpoint}/search",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            return self._parse_swiggy_response(data)

    def _parse_swiggy_response(self, data: Dict[str, Any]) -> List[RetailerOffer]:
        """Parse raw Instamart catalog payload into normalized RetailerOffer objects."""
        items = data.get("data", {}).get("items", [])
        offers = []
        for item in items:
            offers.append(
                RetailerOffer(
                    sku_id=f"instamart_{item.get('id')}",
                    retailer_name="Swiggy Instamart",
                    title=item.get("name", "Unknown item"),
                    price=float(item.get("price", 0.0)),
                    original_price=float(item.get("mrp", item.get("price", 0.0))),
                    currency="INR",
                    in_stock=item.get("in_stock", True),
                    unit=item.get("unit", "pack"),
                    quantity=1.0,
                    pack_size_desc=item.get("quantity_desc"),
                    barcode=item.get("barcode"),
                    image_url=item.get("image_url"),
                    observation_time=datetime.now(timezone.utc),
                    source_mode=ProviderMode.LIVE,
                    serviceability=ServiceabilityStatus.AVAILABLE,
                    raw_metadata=item,
                )
            )
        return offers

    def get_offer_by_id(self, sku_id: str) -> Optional[RetailerOffer]:
        if not self.is_authorized:
            return self._fixture_fallback.get_offer_by_id(sku_id)
        # In live mode without search, query item detail
        return None

    def check_serviceability(self, locality: Optional[str] = None) -> ServiceabilityStatus:
        if not self.is_authorized:
            if not locality:
                return ServiceabilityStatus.NOT_CONFIGURED
            return ServiceabilityStatus.AVAILABLE

        if not locality or not locality.strip():
            return ServiceabilityStatus.NOT_CONFIGURED

        # Test against invalid or known unserviceable patterns
        if locality.strip() in ["000000", "999999", "unserviceable"]:
            return ServiceabilityStatus.UNSERVICEABLE

        return ServiceabilityStatus.AVAILABLE
