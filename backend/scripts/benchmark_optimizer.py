"""Benchmark harness for the NutriKart Linear Programming optimizer.

Measures solver latency, allocation density, and constraint compliance
across synthetic catalogs of varying scale factors.
"""

import time
import sys
from pathlib import Path
from decimal import Decimal
from typing import List, Dict, Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.lp_optimizer import allocate_budget_lp


from types import SimpleNamespace

def make_benchmark_product(id: int, name: str, price: float, score: float):
    return SimpleNamespace(
        id=id,
        name=name,
        price_per_unit=Decimal(str(price)),
        category_id=(id % 5) + 1,
        category_name=f"Category {(id % 5) + 1}",
        calories=120.0,
        sugar=2.0,
        protein=10.0,
        fiber=4.0,
        sodium=80.0,
        fat=3.0,
        saturated_fat=0.8,
        image_url="https://example.com/item.png",
        brand="BenchmarkBrand",
        variant="Standard",
        measurement_basis="per_serving",
        verification_status="verified",
        source_ref="benchmark_db",
    )


def generate_synthetic_catalog(size: int) -> List[tuple]:
    catalog = []
    for i in range(1, size + 1):
        price = 25.0 + (i * 7.5) % 300.0
        score = 40.0 + (i * 13.0) % 60.0
        prod = make_benchmark_product(id=i, name=f"Synthetic Food Item {i}", price=price, score=score)
        catalog.append((prod, score))
    return catalog


def benchmark_scale(item_count: int, budget: float, household: int = 2) -> Dict[str, Any]:
    catalog = generate_synthetic_catalog(item_count)
    start_time = time.perf_counter()
    allocations, remaining_budget = allocate_budget_lp(
        catalog, budget=budget, household_size=household
    )
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    total_spent = sum(item["subtotal"] for item in allocations)
    total_qty = sum(item["quantity"] for item in allocations)

    return {
        "item_count": item_count,
        "budget": budget,
        "elapsed_ms": round(elapsed_ms, 2),
        "allocated_items": len(allocations),
        "total_units": total_qty,
        "total_spent": round(float(total_spent), 2),
        "remaining_budget": round(float(remaining_budget), 2),
    }


def run_all_benchmarks():
    scales = [10, 50, 100, 200]
    budgets = [500.0, 1500.0, 3000.0]

    print("=" * 65)
    print("NutriKart LP Optimizer Performance Benchmark")
    print("=" * 65)
    print(f"{'Catalog Size':<14}{'Budget (₹)':<12}{'Latency (ms)':<15}{'Items Picked':<14}{'Spent (₹)':<10}")
    print("-" * 65)

    for size in scales:
        for budget in budgets:
            res = benchmark_scale(size, budget)
            print(
                f"{res['item_count']:<14}{res['budget']:<12}{res['elapsed_ms']:<15}{res['allocated_items']:<14}{res['total_spent']:<10}"
            )

    print("=" * 65)
    print("Benchmark completed successfully.")


if __name__ == "__main__":
    run_all_benchmarks()
