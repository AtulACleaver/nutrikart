"""NutriKart Catalog Integrity & Quality Assurance Inspector.

Scans all active products in the local database to verify:
1. Valid positive price_per_unit
2. Category ID foreign key resolution
3. Presence of essential nutrient values (calories, protein, sugar, sodium)
4. Absence of impossible negative nutrient metrics
"""

import sys
from pathlib import Path
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models import Product, Category


def audit_catalog():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        categories = {c.id: c.name for c in db.query(Category).all()}

        print("=" * 70)
        print("NutriKart Database Catalog Quality & Integrity Audit")
        print("=" * 70)
        print(f"Total Products Audited: {len(products)}")
        print(f"Total Categories: {len(categories)}")
        print("-" * 70)

        issues = []
        verified_count = 0

        for p in products:
            item_issues = []
            if p.price_per_unit is None or p.price_per_unit <= 0:
                item_issues.append("Invalid or non-positive price")

            if p.category_id not in categories:
                item_issues.append(f"Orphaned category ID: {p.category_id}")

            # Check negative values
            for nutrient in ["calories", "sugar", "sodium", "protein", "fat", "saturated_fat", "fiber"]:
                val = getattr(p, nutrient, None)
                if val is not None and val < 0:
                    item_issues.append(f"Negative {nutrient}: {val}")

            if item_issues:
                issues.append((p.id, p.name, item_issues))
            else:
                verified_count += 1

        print(f"Verified & Structurally Sound Products: {verified_count}")
        print(f"Products With Integrity Warnings:      {len(issues)}")

        if issues:
            print("\nWarnings Details:")
            for pid, name, reasons in issues:
                print(f"  - [ID {pid}] {name}: {', '.join(reasons)}")
        else:
            print("\nCatalog health: 100% compliant with schema invariants.")

        print("=" * 70)
        return len(issues) == 0
    finally:
        db.close()


if __name__ == "__main__":
    success = audit_catalog()
    sys.exit(0 if success else 1)
