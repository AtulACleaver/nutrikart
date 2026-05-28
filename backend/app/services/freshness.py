"""Freshness and permitted retention cache policy for retailer offers."""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Dict, Any, Optional

from app.services.providers.base import ProviderMode, RetailerOffer


class FreshnessStatus(str, Enum):
    FRESH = "fresh"
    EXPIRING_SOON = "expiring_soon"
    STALE_EXPIRED = "stale_expired"


# Permitted retention rules adhering to provider data use restrictions
RETENTION_TTL_MINUTES = {
    ProviderMode.LIVE: 30,       # 30-minute max retention for live quick-commerce offers
    ProviderMode.FIXTURE: 1440,  # 24 hours for testing fixtures
    ProviderMode.STATIC: 43200,  # 30 days for curated reference baseline
}


class FreshnessPolicy:
    """Evaluates and annotates freshness and expiration for grocery pricing offers."""

    @classmethod
    def get_ttl_minutes(cls, source_mode: ProviderMode) -> int:
        return RETENTION_TTL_MINUTES.get(source_mode, 30)

    @classmethod
    def evaluate(
        cls, offer: RetailerOffer, current_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        now = current_time or datetime.now(timezone.utc)
        obs_time = offer.observation_time
        if obs_time.tzinfo is None:
            obs_time = obs_time.replace(tzinfo=timezone.utc)

        age = now - obs_time
        age_seconds = max(0, int(age.total_seconds()))
        age_minutes = age_seconds // 60

        ttl_minutes = cls.get_ttl_minutes(offer.source_mode)
        expires_at = obs_time + timedelta(minutes=ttl_minutes)
        is_expired = now > expires_at

        if is_expired:
            status = FreshnessStatus.STALE_EXPIRED
            label = "Stale offer (needs refresh)"
        elif age_minutes > (ttl_minutes * 0.75):
            status = FreshnessStatus.EXPIRING_SOON
            label = f"Observed {age_minutes}m ago (expiring soon)"
        else:
            status = FreshnessStatus.FRESH
            label = "Fresh price" if age_minutes < 5 else f"Observed {age_minutes}m ago"

        return {
            "sku_id": offer.sku_id,
            "status": status.value,
            "is_fresh": not is_expired,
            "age_minutes": age_minutes,
            "ttl_minutes": ttl_minutes,
            "observed_at": obs_time.isoformat(),
            "expires_at": expires_at.isoformat(),
            "freshness_label": label,
            "fallback_required": is_expired,
        }
