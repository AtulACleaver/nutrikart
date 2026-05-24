"""Static offer provider sourcing offers from verified catalogue reference prices."""

from datetime import datetime, timezone
from typing import List, Optional

from app.database import SessionLocal
from app.models import Product
from app.services.providers.base import (
    BaseProvider,
    ProviderMode,
    RetailerOffer,
    ServiceabilityStatus,
)


class StaticProvider(BaseProvider):
    """Provides stable, reproducible reference offers from verified local database."""

    def __init__(self):
        super().__init__(mode=ProviderMode.STATIC)

    def search_offers(
        self, query: str, locality: Optional[str] = None, limit: int = 20
    ) -> List[RetailerOffer]:
        db = SessionLocal()
        try:
            q = db.query(Product)
            if query.strip():
                search_term = f"%{query.strip().lower()}%"
                q = q.filter(Product.name.ilike(search_term))
            products = q.limit(limit).all()

            offers = []
            for p in products:
                offers.append(
                    RetailerOffer(
                        sku_id=f"static_{p.id}",
                        retailer_name="Verified Reference",
                        title=p.name,
                        price=float(p.price_per_unit or 0.0),
                        currency="INR",
                        in_stock=True,
                        unit=p.pack_unit or "pack",
                        quantity=float(p.pack_quantity or 1.0),
                        pack_size_desc=f"{p.serving_size or 100}{p.serving_unit or 'g'}",
                        image_url=p.image_url,
                        observation_time=datetime.now(timezone.utc),
                        source_mode=ProviderMode.STATIC,
                        serviceability=ServiceabilityStatus.AVAILABLE,
                        raw_metadata={"internal_product_id": p.id, "category_id": p.category_id},
                    )
                )
            return offers
        finally:
            db.close()

    def get_offer_by_id(self, sku_id: str) -> Optional[RetailerOffer]:
        if not sku_id.startswith("static_"):
            return None
        try:
            prod_id = int(sku_id.replace("static_", ""))
        except ValueError:
            return None

        db = SessionLocal()
        try:
            p = db.query(Product).filter(Product.id == prod_id).first()
            if not p:
                return None
            return RetailerOffer(
                sku_id=f"static_{p.id}",
                retailer_name="Verified Reference",
                title=p.name,
                price=float(p.price_per_unit or 0.0),
                currency="INR",
                in_stock=True,
                unit=p.pack_unit or "pack",
                quantity=float(p.pack_quantity or 1.0),
                pack_size_desc=f"{p.serving_size or 100}{p.serving_unit or 'g'}",
                image_url=p.image_url,
                observation_time=datetime.now(timezone.utc),
                source_mode=ProviderMode.STATIC,
                serviceability=ServiceabilityStatus.AVAILABLE,
                raw_metadata={"internal_product_id": p.id, "category_id": p.category_id},
            )
        finally:
            db.close()

    def check_serviceability(self, locality: Optional[str] = None) -> ServiceabilityStatus:
        # Static baseline is universally available without live network dependency
        return ServiceabilityStatus.AVAILABLE
