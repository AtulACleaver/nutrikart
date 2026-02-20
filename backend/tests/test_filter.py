# tests/test_filter.py
# Run: cd backend && python3 -m tests.test_filter
from app.database import ProductsSessionLocal
from app.models import Product
from app.recommendation import filter_products

db = ProductsSessionLocal()
try:
    all_products = db.query(Product).all()
    print(f"Total products: {len(all_products)}")

    # ── Diabetic filter ──
    diabetic_safe = filter_products(all_products, "diabetic")
    print(f"\nDiabetic-safe: {len(diabetic_safe)} / {len(all_products)}")
    for p in diabetic_safe:
        print(f"  {p.name} | sugar: {p.sugar}g | cal: {p.calories}")

    violations = [p for p in diabetic_safe if p.sugar and p.sugar > 5]
    assert len(violations) == 0, f"BUG: {len(violations)} products slipped through!"
    print("\n✅ Diabetic filter: no sugar violations")

    # ── Hypertension filter ──
    bp_safe = filter_products(all_products, "hypertension")
    print(f"\nHypertension-safe: {len(bp_safe)} / {len(all_products)}")
    for p in bp_safe:
        print(f"  {p.name} | sodium: {p.sodium}mg | fat: {p.fat}g")

    # ── No condition = all products ──
    no_filter = filter_products(all_products, None)
    assert len(no_filter) == len(all_products)
    print(f"\n✅ None condition: all {len(no_filter)} returned")

    # ── Unknown condition = all products ──
    unknown = filter_products(all_products, "alien_disease")
    assert len(unknown) == len(all_products)
    print("✅ Unknown condition: all products returned")

finally:
    db.close()