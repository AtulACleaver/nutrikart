from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import logging
from ..database import get_db
from ..models import Product, Category
from ..schemas import ProductBase, ProductResponse

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/products", tags=["products"])

# In-memory cached fallback catalog to guarantee zero-downtime serving
_fallback_cache = None


def get_fallback_catalog():
    global _fallback_cache
    if _fallback_cache is not None:
        return _fallback_cache

    import csv
    import json
    from pathlib import Path

    candidates = [
        Path(__file__).resolve().parent.parent.parent / "data",
        Path(__file__).resolve().parent.parent.parent.parent / "data",
        Path("data").resolve(),
    ]
    data_dir = None
    for c in candidates:
        if (c / "products.csv").exists():
            data_dir = c
            break

    if not data_dir:
        return []

    verified_by_id = {}
    manifest_p = data_dir / "verified_manifest.json"
    if manifest_p.exists():
        try:
            with open(manifest_p, "r", encoding="utf-8") as f:
                manifest_data = json.load(f)
                verified_by_id = {c["id"]: c for c in manifest_data.get("candidates", [])}
        except Exception:
            pass

    cat_map = {
        1: "Cereals & Breakfast",
        2: "Dairy & Cheese",
        3: "Chips & Crisps",
        4: "Biscuits & Cookies",
        5: "Beverages",
        6: "Protein & Nutrition Bars",
        7: "Grains & Staples",
        8: "Spreads & Jams",
        9: "Frozen & Ready-to-Eat",
    }

    products = []
    csv_p = data_dir / "products.csv"
    if csv_p.exists():
        with open(csv_p, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pid = int(row["id"])
                v = verified_by_id.get(pid, {})
                cid = int(row["category_id"])
                p_dict = {
                    "id": pid,
                    "name": row["name"],
                    "category_id": cid,
                    "category_name": cat_map.get(cid),
                    "price_per_unit": float(row["price_per_unit"]) if row["price_per_unit"] else None,
                    "serving_size": float(row["serving_size"]) if row["serving_size"] else None,
                    "calories": float(row["calories"]) if row["calories"] else None,
                    "sugar": float(row["sugar"]) if row["sugar"] else None,
                    "sodium": float(row["sodium"]) if row["sodium"] else None,
                    "protein": float(row["protein"]) if row["protein"] else None,
                    "fat": float(row["fat"]) if row["fat"] else None,
                    "saturated_fat": float(row["saturated_fat"]) if row["saturated_fat"] else None,
                    "sat_fat": float(row["saturated_fat"]) if row["saturated_fat"] else None,
                    "fiber": float(row["fiber"]) if row["fiber"] else None,
                    "image_url": row["image_url"] or None,
                    "brand": v.get("brand"),
                    "variant": v.get("variant"),
                    "pack_quantity": v.get("pack_quantity"),
                    "pack_unit": v.get("pack_unit", "g"),
                    "serving_unit": v.get("serving_unit", "g"),
                    "measurement_basis": v.get("measurement_basis", "per_serving"),
                    "verification_status": v.get("verification_status", "verified"),
                    "source_type": v.get("source_type", "seed"),
                    "source_ref": v.get("source_ref"),
                    "version": v.get("version", 1),
                }
                products.append(ProductResponse(**p_dict))

    _fallback_cache = products
    return products


def require_admin(x_admin_token: Optional[str] = Header(None)):
    admin_token = os.environ.get("ADMIN_SECRET_KEY", "nutrikart_admin_secret_key_default")
    if not x_admin_token or x_admin_token != admin_token:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Public catalogue writes are disabled without administrative authorization.",
        )


@router.get("/", response_model=List[ProductResponse])
def get_products(
    category_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Get products, optionally filtered by category_id, with category names."""
    try:
        categories = db.query(Category).all()
        cat_map = {c.id: c.name for c in categories}

        query = db.query(Product)
        if category_id:
            query = query.filter(Product.category_id == category_id)

        products = query.order_by(Product.name.asc()).all()

        for p in products:
            p.category_name = cat_map.get(p.category_id)
            p.sat_fat = p.saturated_fat

        return products
    except Exception as e:
        logger.error(f"Failed to query products from database, serving verified fallback catalogue: {e}")
        catalog = get_fallback_catalog()
        if category_id:
            return [p for p in catalog if p.category_id == category_id]
        return catalog


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID with category name"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            category = db.query(Category).filter(Category.id == product.category_id).first()
            product.category_name = category.name if category else None
            product.sat_fat = product.saturated_fat
            return product
    except Exception as e:
        logger.error(f"Failed to query product {product_id} from database: {e}")

    catalog = get_fallback_catalog()
    for p in catalog:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("/", response_model=ProductResponse, status_code=201, dependencies=[Depends(require_admin)])
def create_product(product: ProductBase, db: Session = Depends(get_db)):
    """Create a new product"""
    new_product = Product(
        name=product.name,
        category_id=product.category_id,
        price_per_unit=product.price_per_unit,
        serving_size=product.serving_size,
        calories=product.calories,
        sugar=product.sugar,
        sodium=product.sodium,
        protein=product.protein,
        fat=product.fat,
        saturated_fat=product.saturated_fat,
        fiber=product.fiber,
        image_url=product.image_url,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None
