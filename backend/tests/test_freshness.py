"""Unit tests for offer freshness and retention policy evaluation."""

from datetime import datetime, timedelta, timezone
from app.services.freshness import FreshnessPolicy, FreshnessStatus
from app.services.providers.base import ProviderMode, RetailerOffer


def test_fresh_live_offer():
    now = datetime.now(timezone.utc)
    offer = RetailerOffer(
        sku_id="instamart_1",
        retailer_name="Swiggy Instamart",
        title="Amul Taaza Milk 500ml",
        price=27.0,
        observation_time=now - timedelta(minutes=2),
        source_mode=ProviderMode.LIVE,
    )

    evaluation = FreshnessPolicy.evaluate(offer, current_time=now)
    assert evaluation["is_fresh"] is True
    assert evaluation["status"] == FreshnessStatus.FRESH.value
    assert evaluation["fallback_required"] is False
    assert evaluation["freshness_label"] == "Fresh price"


def test_expired_live_offer_triggers_fallback():
    now = datetime.now(timezone.utc)
    # Live offer observed 45 mins ago exceeds 30 min TTL
    offer = RetailerOffer(
        sku_id="instamart_1",
        retailer_name="Swiggy Instamart",
        title="Amul Taaza Milk 500ml",
        price=27.0,
        observation_time=now - timedelta(minutes=45),
        source_mode=ProviderMode.LIVE,
    )

    evaluation = FreshnessPolicy.evaluate(offer, current_time=now)
    assert evaluation["is_fresh"] is False
    assert evaluation["status"] == FreshnessStatus.STALE_EXPIRED.value
    assert evaluation["fallback_required"] is True
    assert "Stale" in evaluation["freshness_label"]


def test_static_baseline_offer_retention():
    now = datetime.now(timezone.utc)
    # Static reference from 5 days ago is still within 30-day baseline TTL
    offer = RetailerOffer(
        sku_id="static_1",
        retailer_name="Verified Reference",
        title="Whole Wheat Flour 5kg",
        price=310.0,
        observation_time=now - timedelta(days=5),
        source_mode=ProviderMode.STATIC,
    )

    evaluation = FreshnessPolicy.evaluate(offer, current_time=now)
    assert evaluation["is_fresh"] is True
    assert evaluation["fallback_required"] is False
