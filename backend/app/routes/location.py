"""Location and serviceability endpoints for quick-commerce regional access."""

from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.providers import get_provider, ServiceabilityStatus

router = APIRouter(prefix="/location", tags=["location"])


class ServiceabilityResponse(BaseModel):
    locality: Optional[str] = None
    status: str
    source_mode: str
    retailer: str
    message: str


@router.get("/serviceability", response_model=ServiceabilityResponse)
def get_serviceability(locality: Optional[str] = Query(None, description="Pincode or locality name")):
    provider = get_provider()
    status = provider.check_serviceability(locality=locality)

    if status == ServiceabilityStatus.NOT_CONFIGURED:
        message = "No location selected. Showing verified reference catalog."
    elif status == ServiceabilityStatus.UNSERVICEABLE:
        message = f"Instant grocery delivery currently unavailable for {locality}. Reference catalog available."
    elif status == ServiceabilityStatus.AVAILABLE:
        message = f"Instant grocery delivery serviceable for {locality}."
    else:
        message = "Service status unavailable. Using fallback catalog."

    return ServiceabilityResponse(
        locality=locality,
        status=status.value,
        source_mode=provider.mode.value,
        retailer="Swiggy Instamart" if provider.mode.value == "live" else "NutriKart Reference",
        message=message,
    )
