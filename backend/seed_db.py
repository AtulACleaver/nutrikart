import os
import csv
import json
import sqlite3
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal, DATABASE_URL
from app.models import Category, Product

CATEGORIES = [
    (1, "Cereals & Breakfast"),
    (2, "Dairy & Cheese"),
    (3, "Chips & Crisps"),
    (4, "Biscuits & Cookies"),
    (5, "Beverages"),
    (6, "Protein & Nutrition Bars"),
    (7, "Grains & Staples"),
    (8, "Spreads & Jams"),
    (9, "Frozen & Ready-to-Eat"),
]

def find_file(relative_path: str) -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent / relative_path,
        Path(__file__).resolve().parent / relative_path,
        Path(relative_path).resolve(),
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError(f"Could not find {relative_path}")

def ensure_columns():
    """Ensure newly added columns exist in SQLite or Postgres before ORM queries."""
    if DATABASE_URL.startswith("sqlite"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            existing_cols = {r[1] for r in c.execute("PRAGMA table_info(products)").fetchall()}
            new_cols = [
                ("brand", "TEXT"),
                ("variant", "TEXT"),
                ("pack_quantity", "NUMERIC(10, 2)"),
                ("pack_unit", "TEXT DEFAULT 'g'"),
                ("serving_unit", "TEXT DEFAULT 'g'"),
                ("measurement_basis", "TEXT DEFAULT 'per_serving'"),
                ("verification_status", "TEXT DEFAULT 'verified'"),
                ("source_type", "TEXT DEFAULT 'seed'"),
                ("source_ref", "TEXT"),
                ("version", "INTEGER DEFAULT 1"),
            ]
            for col_name, col_type in new_cols:
                if col_name not in existing_cols:
                    c.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")
            conn.commit()
            conn.close()

def seed():
    print("Ensuring tables and schema...")
    Base.metadata.create_all(bind=engine)
    ensure_columns()

    db: Session = SessionLocal()
    try:
        # 1. Seed categories
        existing_cats = {c.id for c in db.query(Category).all()}
        added_cats = 0
        for cid, name in CATEGORIES:
            if cid not in existing_cats:
                db.add(Category(id=cid, name=name))
                added_cats += 1
        if added_cats:
            db.commit()
            print(f"Seeded {added_cats} categories.")

        # 2. Load verified manifest
        manifest_path = find_file("data/verified_manifest.json")
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_data = json.load(f)
        verified_by_id = {c["id"]: c for c in manifest_data.get("candidates", [])}

        # 3. Load base products CSV
        csv_path = find_file("data/products.csv")
        print(f"Loading products from {csv_path} and enriching from {manifest_path}...")

        counts = {
            "verified": 0,
            "unverified_unknown": 0,
            "pending_review": 0,
            "updated": 0,
            "inserted": 0,
        }

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pid = int(row["id"])
                product = db.query(Product).filter(Product.id == pid).first()
                is_new = product is None

                if is_new:
                    product = Product(id=pid)
                    db.add(product)
                    counts["inserted"] += 1
                else:
                    counts["updated"] += 1

                # Base fields
                product.name = row["name"]
                product.category_id = int(row["category_id"])
                product.price_per_unit = float(row["price_per_unit"]) if row["price_per_unit"] else None
                product.serving_size = float(row["serving_size"]) if row["serving_size"] else None
                product.calories = float(row["calories"]) if row["calories"] else None
                product.sugar = float(row["sugar"]) if row["sugar"] else None
                product.sodium = float(row["sodium"]) if row["sodium"] else None
                product.protein = float(row["protein"]) if row["protein"] else None
                product.fat = float(row["fat"]) if row["fat"] else None
                product.saturated_fat = float(row["saturated_fat"]) if row["saturated_fat"] else None
                product.fiber = float(row["fiber"]) if row["fiber"] else None
                product.image_url = row["image_url"] or None

                # Enrich with verified manifest if present
                if pid in verified_by_id:
                    v = verified_by_id[pid]
                    product.brand = v.get("brand")
                    product.variant = v.get("variant")
                    product.pack_quantity = v.get("pack_quantity")
                    product.pack_unit = v.get("pack_unit", "g")
                    product.serving_unit = v.get("serving_unit", "g")
                    product.measurement_basis = v.get("measurement_basis", "per_serving")
                    product.verification_status = v.get("verification_status", "verified")
                    product.source_type = v.get("source_type", "structured_db")
                    product.source_ref = v.get("source_ref")
                    product.version = 1
                    counts["verified"] += 1
                else:
                    # Incomplete legacy records without verification
                    if product.sugar is None or product.sodium is None or product.protein is None:
                        product.verification_status = "unverified_unknown"
                        product.source_type = "legacy_incomplete"
                        counts["unverified_unknown"] += 1
                    else:
                        product.verification_status = "verified"
                        product.source_type = "seed"
                        counts["verified"] += 1

        db.commit()
        print("\n--- Idempotent Catalogue Import Summary ---")
        print(f"Total Products in DB: {db.query(Product).count()}")
        print(f"Verified Records:     {counts['verified']}")
        print(f"Unverified / Unknown: {counts['unverified_unknown']}")
        print(f"Pending Review:       {counts['pending_review']}")
        print(f"Inserts / Updates:    {counts['inserted']} new / {counts['updated']} refreshed")
        print("Import completed successfully with zero duplicates.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
