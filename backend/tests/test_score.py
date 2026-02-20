# backend/test_score_manual.py
from app.database import ProductsSessionLocal
from app.models import Product
from app.recommendation import filter_products, rank_products

db = ProductsSessionLocal()
try:
    all_products = db.query(Product).all()

    # Filter then score for diabetic
    diabetic_safe = filter_products(all_products, "diabetic")
    ranked = rank_products(diabetic_safe, "diabetic")


    print("TOP 10 FOR DIABETIC USER")

    for i, (p, score) in enumerate(ranked[:10], 1):
        print(f"{i:2d}. {p.name}")
        print(f"    Score: {score:>8} | Sugar: {p.sugar}g | "
            f"Fiber: {p.fiber}g | Protein: {p.protein}g")
        print()

    print("\nBOTTOM 5 (worst fits among safe products):")
    for p, score in ranked[-5:]:
        print(f"  {p.name} | Score: {score}")

    # Also test hypertension
    bp_safe = filter_products(all_products, "hypertension")
    bp_ranked = rank_products(bp_safe, "hypertension")

    print("TOP 5 FOR HYPERTENSION USER")
    for i, (p, score) in enumerate(bp_ranked[:5], 1):
        print(f"{i}. {p.name} | Score: {score} | "
            f"Sodium: {p.sodium}mg | Fat: {p.fat}g")

finally:
    db.close()