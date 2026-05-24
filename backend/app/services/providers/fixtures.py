"""Fixture offer provider for offline unit testing and staging simulations."""

from datetime import datetime, timezone
from typing import List, Optional

from app.services.providers.base import (
    BaseProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
)

SAMPLE_FIXTURE_OFFERS = [
    {
        "sku_id": "instamart_1001",
        "retailer_name": "Instamart Local",
        "title": "Aashirvaad Superior MP Sharbati Whole Wheat Atta",
        "price": 310.0,
        "original_price": 345.0,
        "in_stock": True,
        "unit": "pack",
        "quantity": 1.0,
        "pack_size_desc": "5 kg",
        "barcode": "8901030382894",
        "image_url": "https://www.instamart.example/images/atta_5kg.jpg",
    },
    {
        "sku_id": "instamart_1002",
        "retailer_name": "Instamart Local",
        "title": "Fortune Sunlite Refined Sunflower Oil",
        "price": 140.0,
        "original_price": 165.0,
        "in_stock": True,
        "unit": "pouch",
        "quantity": 1.0,
        "pack_size_desc": "1 L",
        "barcode": "8906007280145",
        "image_url": "https://www.instamart.example/images/oil_1l.jpg",
    },
    {
        "sku_id": "instamart_1003",
        "retailer_name": "Instamart Local",
        "title": "Tata Sampann Unpolished Toor Dal",
        "price": 175.0,
        "original_price": 190.0,
        "in_stock": False,
        "unit": "pack",
        "quantity": 1.0,
        "pack_size_desc": "1 kg",
        "barcode": "8904043901234",
        "image_url": "https://www.instamart.example/images/toor_1kg.jpg",
    },
]


class FixtureProvider(BaseProvider):
    """Provides labelled offline test fixtures for reproducible testing."""

    def __init__(self, offers: Optional[List[dict]] = None):
        super().__init__(mode=ProviderMode.FIXTURE)
        raw_offers = offers if offers is not None else SAMPLE_FIXTURE_OFFERS
        self._offers = [
            RetailerOffer(
                sku_id=o["sku_id"],
                retailer_name=o.get("retailer_name", "Mock Retailer"),
                title=o["title"],
                price=float(o["price"]),
                currency=o.get("currency", "INR"),
                original_price=o.get("original_price"),
                in_stock=o.get("in_stock", True),
                unit=o.get("unit", "pack"),
                quantity=float(o.get("quantity", 1.0)),
                pack_size_desc=o.get("pack_size_desc"),
                barcode=o.get("barcode"),
                image_url=o.get("image_url"),
                observation_time=datetime.now(timezone.utc),
                source_mode=ProviderMode.FIXTURE,
                serviceability=ServiceabilityStatus.AVAILABLE,
            )
            for o in raw_offers
        ]

    def search_offers(
        self, query: str, locality: Optional[str] = None, limit: int = 20
    ) -> List[RetailerOffer]:
        if not query.strip():
            return self._offers[:limit]
        q = query.strip().lower()
        matched = [o for o in self._offers if q in o.title.lower()]
        return matched[:limit]

    def get_offer_by_id(self, sku_id: str) -> Optional[RetailerOffer]:
        for o in self._offers:
            if o.sku_id == sku_id:
                return o
        return None

    def check_serviceability(self, locality: Optional[str] = None) -> ServiceabilityStatus:
        if locality == "unserviceable_pincode":
            return ServiceabilityStatus.UNSERVICEABLE
        if locality is None or locality.strip() == "":
            return ServiceabilityStatus.NOT_CONFIGURED
        return ServiceabilityStatus.AVAILABLE
