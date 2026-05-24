"""Base interface and data models for grocery retailer offer providers."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class ProviderMode(str, Enum):
    STATIC = "static"
    FIXTURE = "fixture"
    LIVE = "live"


class ServiceabilityStatus(str, Enum):
    AVAILABLE = "available"
    UNSERVICEABLE = "unserviceable"
    NOT_CONFIGURED = "not_configured"
    RATE_LIMITED = "rate_limited"
    ERROR = "error"


@dataclass
class RetailerOffer:
    sku_id: str
    retailer_name: str
    title: str
    price: float
    currency: str = "INR"
    original_price: Optional[float] = None
    in_stock: bool = True
    unit: str = "unit"
    quantity: float = 1.0
    pack_size_desc: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    observation_time: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    source_mode: ProviderMode = ProviderMode.STATIC
    serviceability: ServiceabilityStatus = ServiceabilityStatus.AVAILABLE
    raw_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sku_id": self.sku_id,
            "retailer_name": self.retailer_name,
            "title": self.title,
            "price": self.price,
            "currency": self.currency,
            "original_price": self.original_price,
            "in_stock": self.in_stock,
            "unit": self.unit,
            "quantity": self.quantity,
            "pack_size_desc": self.pack_size_desc,
            "barcode": self.barcode,
            "image_url": self.image_url,
            "observation_time": self.observation_time.isoformat(),
            "source_mode": self.source_mode.value,
            "serviceability": self.serviceability.value,
        }


class BaseProvider(ABC):
    """Abstract base class for all retailer data providers."""

    def __init__(self, mode: ProviderMode = ProviderMode.STATIC):
        self.mode = mode

    @abstractmethod
    def search_offers(
        self, query: str, locality: Optional[str] = None, limit: int = 20
    ) -> List[RetailerOffer]:
        """Search available offers for a food query."""
        pass

    @abstractmethod
    def get_offer_by_id(self, sku_id: str) -> Optional[RetailerOffer]:
        """Retrieve a specific offer by retailer SKU id."""
        pass

    @abstractmethod
    def check_serviceability(self, locality: Optional[str] = None) -> ServiceabilityStatus:
        """Check if delivery service is available at given locality."""
        pass
