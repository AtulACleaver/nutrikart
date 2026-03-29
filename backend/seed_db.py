import os
import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
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

def find_csv_path() -> Path:
    # Check common locations relative to script or workspace
    candidates = [
        Path(__file__).resolve().parent.parent / "data" / "products.csv",
        Path(__file__).resolve().parent / "data" / "products.csv",
        Path("data/products.csv").resolve(),
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError("Could not find data/products.csv")

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Seed categories
        existing_cats = {c.id for c in db.query(Category).all()}
        added_cats = 0
        for cid, name in CATEGORIES:
            if cid not in existing_cats:
                db.add(Category(id=cid, name=name))
                added_cats += 1
        if added_cats:
            db.commit()
            print(f"Seeded {added_cats} categories.")
        else:
            print(f"Categories already up to date ({len(existing_cats)} existing).")

        # Seed products from CSV
        csv_path = find_csv_path()
        print(f"Loading products from {csv_path}...")
        existing_prod_ids = {p.id for p in db.query(Product.id).all()}

        added_prods = 0
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pid = int(row["id"])
                if pid in existing_prod_ids:
                    continue

                product = Product(
                    id=pid,
                    name=row["name"],
                    category_id=int(row["category_id"]),
                    price_per_unit=float(row["price_per_unit"]) if row["price_per_unit"] else None,
                    serving_size=float(row["serving_size"]) if row["serving_size"] else None,
                    calories=float(row["calories"]) if row["calories"] else None,
                    sugar=float(row["sugar"]) if row["sugar"] else None,
                    sodium=float(row["sodium"]) if row["sodium"] else None,
                    protein=float(row["protein"]) if row["protein"] else None,
                    fat=float(row["fat"]) if row["fat"] else None,
                    saturated_fat=float(row["saturated_fat"]) if row["saturated_fat"] else None,
                    fiber=float(row["fiber"]) if row["fiber"] else None,
                    image_url=row["image_url"] or None,
                )
                db.add(product)
                added_prods += 1

        if added_prods:
            db.commit()
            print(f"Seeded {added_prods} products.")
        else:
            print(f"Products already up to date ({len(existing_prod_ids)} existing).")

        print("Database seeding completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
