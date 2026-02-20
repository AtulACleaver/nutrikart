# backend/test_pipeline_manual.py
from app.database import ProductsSessionLocal
from app.models import Product
from app.recommendation import get_recommendation

db = ProductsSessionLocal()
try:
    all_products = db.query(Product).all()

    # ── Test 1: Diabetic, family of 2, ₹500 ──
    result = get_recommendation(
        products=all_products,
        health_condition="diabetic",
        budget=500.0,
        household_size=2,
    )
    s = result["summary"]
    print(f"Budget: ₹{s['budget']} | Spent: ₹{s['total_spent']} | "
        f"Remaining: ₹{s['remaining_budget']}")
    print(f"Products: {s['total_products']} recommended "
        f"(filtered {s['products_considered'] - s['products_after_filter']} out)")
    print()
    for i, item in enumerate(result["recommendations"], 1):
        print(f"{i}. {item['name']}")
        print(f"   {item['quantity']}x × ₹{item['price_per_unit']} = ₹{item['subtotal']}  "
            f"(score: {item['score']})")
    print()

    # ── Test 2: Very tight budget ──
    tight = get_recommendation(all_products, "diabetic", 100.0, 1)
    print(f"₹100 budget → {tight['summary']['total_products']} products, "
        f"₹{tight['summary']['total_spent']} spent")

    # ── Test 3: Big budget ──
    big = get_recommendation(all_products, None, 5000.0, 4)
    print(f"₹5000 budget, no filter, family of 4 → "
        f"{big['summary']['total_products']} products, "
        f"₹{big['summary']['total_spent']} spent")

    # ── Test 4: Different conditions produce different carts ──
    d = get_recommendation(all_products, "diabetic", 500.0, 1)
    h = get_recommendation(all_products, "hypertension", 500.0, 1)
    d_names = {r["name"] for r in d["recommendations"]}
    h_names = {r["name"] for r in h["recommendations"]}
    overlap = d_names & h_names
    print(f"\nDiabetic cart: {len(d_names)} products")
    print(f"Hypertension cart: {len(h_names)} products")
    print(f"Overlap: {len(overlap)} products")
    if overlap != d_names:
        print("✅ Different conditions produce different carts")

finally:
    db.close()