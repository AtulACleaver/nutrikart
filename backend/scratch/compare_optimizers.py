"""
Side-by-side comparison of greedy vs LP allocation.
Run from backend/: python3 -m scratch.compare_optimizers
"""
import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.database import ProductsSessionLocal
from app.models import Product
from app.recommendation import filter_products, rank_products, allocate_budget
from app.lp_optimizer import allocate_budget_lp

def print_allocation(label, allocations, remaining, budget):
    total_score = sum(a["score_raw"] * a["quantity"] for a in allocations)
    total_spent = sum(a["subtotal"] for a in allocations)
    print(f"\n{'='*60}")
    print(f"{label}")
    print(f"{'='*60}")
    for a in allocations:
        print(f"  {a['name'][:40]:<40} qty={a['quantity']}  "
              f"₹{a['subtotal']:>7.0f}  score={a['score_raw'] * a['quantity']:.1f}")
    print(f"  {'─'*56}")
    print(f"  Total spent: ₹{total_spent:.0f} / ₹{budget:.0f}")
    print(f"  Remaining:   ₹{remaining:.0f}")
    print(f"  Total score: {total_score:.1f}")
    print(f"  Products:    {len(allocations)}")
    return total_score

def main():
    db = ProductsSessionLocal()
    try:
        all_products = db.query(Product).all()
        if not all_products:
            print("No products found in database. Please seed the database first.")
            return

        for condition in ["diabetic", "hypertension", "weight_loss", None]:
            for budget in [300, 500, 1000]:
                household = 2
                label = f"Condition: {condition or 'None'} | Budget: ₹{budget} | Household: {household}"
                print(f"\n\n{'#'*60}")
                print(f"# {label}")
                print(f"{'#'*60}")

                filtered = filter_products(all_products, condition)
                ranked = rank_products(filtered, condition)

                # Greedy
                g_alloc, g_rem = allocate_budget(ranked, budget, household)
                # Need to map schema for compare tool
                g_alloc_mapped = []
                for a in g_alloc:
                    # Current greedy _build_allocation already has score_raw
                    g_alloc_mapped.append(a)
                
                g_score = print_allocation("GREEDY", g_alloc_mapped, g_rem, budget)

                # LP
                lp_alloc, lp_rem = allocate_budget_lp(ranked, budget, household)
                lp_score = print_allocation("LP (PuLP)", lp_alloc, lp_rem, budget)

                # Comparison
                diff = lp_score - g_score
                pct = (diff / abs(g_score) * 100) if g_score != 0 else 0
                print(f"\n  >>> LP advantage: {diff:+.1f} score ({pct:+.1f}%)")
    finally:
        db.close()

if __name__ == "__main__":
    main()
