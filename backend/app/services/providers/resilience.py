"""Provider failure handling, bounded retries, and graceful fallback execution."""

import logging
import time
from typing import Callable, List, Optional, TypeVar

from app.services.providers.base import (
    BaseProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
)
from app.services.providers.static import StaticProvider

logger = logging.getLogger(__name__)

T = TypeVar("T")


class ProviderFailureException(Exception):
    def __init__(self, message: str, status_code: int = 500, retry_after: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


class ProviderResilienceHandler:
    """Manages failure recovery, timeout bounds, and graceful static fallback for provider calls."""

    def __init__(
        self,
        fallback_provider: Optional[BaseProvider] = None,
        max_retries: int = 2,
        backoff_seconds: float = 0.5,
    ):
        self.fallback_provider = fallback_provider or StaticProvider()
        self.max_retries = max_retries
        self.backoff_seconds = backoff_seconds

    def execute_with_fallback(
        self,
        primary_callable: Callable[[], List[RetailerOffer]],
        query: str = "",
        locality: Optional[str] = None,
    ) -> List[RetailerOffer]:
        """Execute primary provider call with bounded retry; on terminal failure fallback to static."""
        attempts = 0
        last_error = None

        while attempts <= self.max_retries:
            try:
                offers = primary_callable()
                # Filter out-of-stock or malformed offers cleanly
                valid_offers = [o for o in offers if o.in_stock and o.price > 0]
                return valid_offers
            except ProviderFailureException as pfe:
                last_error = pfe
                # 401 Unauthorized: Do not retry, immediate static fallback
                if pfe.status_code == 401:
                    logger.warning(f"Provider unauthorized (401): {pfe}. Immediately activating static fallback.")
                    break
                # 429 Rate limited: Wait retry_after if within bounds
                if pfe.status_code == 429:
                    sleep_time = min(pfe.retry_after or self.backoff_seconds, 2.0)
                    logger.warning(f"Provider rate-limited (429). Retrying after {sleep_time}s...")
                    time.sleep(sleep_time)
                else:
                    time.sleep(self.backoff_seconds * (attempts + 1))
            except Exception as e:
                last_error = e
                logger.warning(f"Provider call failed on attempt {attempts + 1}: {e}")
                time.sleep(self.backoff_seconds * (attempts + 1))

            attempts += 1

        # Terminal failure: Fallback cleanly to static verified catalog
        logger.info(f"Primary provider unserviceable after {attempts} attempts ({last_error}). Serving static verified catalog.")
        static_offers = self.fallback_provider.search_offers(query=query, locality=locality)
        for o in static_offers:
            o.source_mode = ProviderMode.STATIC
            o.raw_metadata["fallback_from_error"] = str(last_error) if last_error else "unknown"
        return static_offers
