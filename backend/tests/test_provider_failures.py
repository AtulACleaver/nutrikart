"""Unit tests for provider failure handling, retries, and static fallback."""

import pytest
from app.services.providers.base import ProviderMode, RetailerOffer
from app.services.providers.fixtures import FixtureProvider
from app.services.providers.resilience import (
    ProviderFailureException,
    ProviderResilienceHandler,
)


def test_successful_execution_without_failure():
    handler = ProviderResilienceHandler()
    offers = [
        RetailerOffer(
            sku_id="item_1",
            retailer_name="QuickMart",
            title="Whole Oats 1kg",
            price=150.0,
            in_stock=True,
        )
    ]
    result = handler.execute_with_fallback(lambda: offers, query="Oats")
    assert len(result) == 1
    assert result[0].sku_id == "item_1"


def test_out_of_stock_filtering():
    handler = ProviderResilienceHandler()
    offers = [
        RetailerOffer(
            sku_id="in_stock",
            retailer_name="QuickMart",
            title="Available Milk",
            price=30.0,
            in_stock=True,
        ),
        RetailerOffer(
            sku_id="out_stock",
            retailer_name="QuickMart",
            title="Sold Out Paneer",
            price=90.0,
            in_stock=False,
        ),
    ]
    result = handler.execute_with_fallback(lambda: offers)
    assert len(result) == 1
    assert result[0].sku_id == "in_stock"


def test_401_immediate_static_fallback():
    fixture_provider = FixtureProvider()
    handler = ProviderResilienceHandler(fallback_provider=fixture_provider, max_retries=2)

    def failing_call():
        raise ProviderFailureException("Invalid API token", status_code=401)

    result = handler.execute_with_fallback(failing_call, query="Atta")
    # Must immediately fall back without extra retries
    assert len(result) > 0
    assert result[0].source_mode == ProviderMode.STATIC
    assert "Invalid API token" in result[0].raw_metadata.get("fallback_from_error", "")


def test_429_rate_limit_retry_then_fallback():
    fixture_provider = FixtureProvider()
    handler = ProviderResilienceHandler(fallback_provider=fixture_provider, max_retries=1, backoff_seconds=0.01)

    calls = {"count": 0}

    def rate_limited_call():
        calls["count"] += 1
        raise ProviderFailureException("Too Many Requests", status_code=429, retry_after=1)

    result = handler.execute_with_fallback(rate_limited_call, query="")
    assert calls["count"] == 2  # Initial + 1 retry
    assert len(result) > 0
    assert result[0].source_mode == ProviderMode.STATIC


def test_network_timeout_fallback():
    fixture_provider = FixtureProvider()
    handler = ProviderResilienceHandler(fallback_provider=fixture_provider, max_retries=1, backoff_seconds=0.01)

    def timeout_call():
        raise TimeoutError("Connection to retailer gateway timed out")

    result = handler.execute_with_fallback(timeout_call, query="Dal")
    assert len(result) > 0
    assert result[0].source_mode == ProviderMode.STATIC
    assert "timed out" in result[0].raw_metadata.get("fallback_from_error", "")
