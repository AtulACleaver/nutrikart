"""Provider factory and registry."""

import os
from typing import Optional

from app.services.providers.base import (
    BaseProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
)
from app.services.providers.fixtures import FixtureProvider
from app.services.providers.static import StaticProvider

_DEFAULT_PROVIDER: Optional[BaseProvider] = None


def get_provider(mode: Optional[ProviderMode] = None) -> BaseProvider:
    """Factory to retrieve current active provider based on environment or explicit mode."""
    target_mode = mode
    if target_mode is None:
        env_mode = os.environ.get("NUTRIKART_PROVIDER_MODE", "static").lower()
        if env_mode == "fixture":
            target_mode = ProviderMode.FIXTURE
        elif env_mode == "live":
            target_mode = ProviderMode.LIVE
        else:
            target_mode = ProviderMode.STATIC

    if target_mode == ProviderMode.FIXTURE:
        return FixtureProvider()
    elif target_mode == ProviderMode.LIVE:
        # Import lazily when live adapter is enabled
        try:
            from app.services.providers.swiggy import SwiggyProvider

            return SwiggyProvider()
        except ImportError:
            # Fallback securely to StaticProvider if live dependencies/adapter not ready
            return StaticProvider()
    else:
        return StaticProvider()


__all__ = [
    "BaseProvider",
    "ProviderMode",
    "RetailerOffer",
    "ServiceabilityStatus",
    "StaticProvider",
    "FixtureProvider",
    "get_provider",
]
