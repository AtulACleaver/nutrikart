"""Evaluation script assessing optimizer convergence and allocation efficiency.

Simulates varying realistic grocery planning scenarios across household budgets,
evaluating:
1. Budget utilization percentage
2. Category diversity in resulting basket
3. Solution convergence speed
4. Nutrition score maximization vs greedy baseline
"""

import sys
import time
from pathlib import Path
from decimal import Decimal
from typing import List, Dict, Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.lp_optimizer import allocate_budget_lp
from app.recommendation import allocate_budget
from scripts.benchmark_optimizer import generate_synthetic_catalog


def evaluate_scenario(budget: float, household: int, catalog_size: int = 60) -> Dict[str, Any]:
    catalog = generate_synthetic_catalog(catalog_size)

    # Run Greedy baseline
    t0_greedy = time.perf_counter()
    greedy_alloc, greedy_rem = allocate_budget(catalog, budget=budget, household_size=household)
    greedy_time = (time.perf_counter() - t0_greedy) * 1000.0

    # Run LP Optimizer
    t0_lp = time.perf_counter()
    lp_alloc, lp_rem = allocate_budget_lp(catalog, budget=budget, household_size=household)
    lp_time = (time.perf_counter() - t0_lp) * 1000.0

    greedy_score = sum(item["score_raw"] * item["quantity"] for item in greedy_alloc)
    lp_score = sum(item["score_raw"] * item["quantity"] for item in lp_alloc)

    lp_spent = budget - lp_rem
    utilization_pct = (lp_spent / budget) * 100.0 if budget > 0 else 0.0

    unique_categories = len(set(item["category_id"] for item in lp_alloc))

    return {
        "budget": budget,
        "household": household,
        "lp_time_ms": round(lp_time, 2),
        "greedy_time_ms": round(greedy_time, 2),
        "lp_score": round(lp_score, 1),
        "greedy_score": round(greedy_score, 1),
        "score_uplift_pct": round(((lp_score - greedy_score) / max(1.0, abs(greedy_score))) * 100.0, 1),
        "budget_utilization_pct": round(utilization_pct, 1),
        "category_count": unique_categories,
        "total_items": len(lp_alloc),
    }


def run_evaluation_suite():
    scenarios = [
        {"budget": 400.0, "household": 1},
        {"budget": 800.0, "household": 2},
        {"budget": 1500.0, "household": 3},
        {"budget": 2500.0, "household": 4},
        {"budget": 4000.0, "household": 5},
    ]

    print("=" * 78)
    print("NutriKart Optimizer Efficiency & Clinical Convergence Evaluation")
    print("=" * 78)
    header = f"{'Budget':<10}{'Family':<8}{'LP (ms)':<10}{'Greedy (ms)':<12}{'Score Uplift':<14}{'Util %':<10}{'Categories':<12}"
    print(header)
    print("-" * 78)

    for sc in scenarios:
        res = evaluate_scenario(sc["budget"], sc["household"])
        row = (
            f"₹{res['budget']:<9}"
            f"{res['household']:<8}"
            f"{res['lp_time_ms']:<10}"
            f"{res['greedy_time_ms']:<12}"
            f"+{res['score_uplift_pct']}%{'':<9}"
            f"{res['budget_utilization_pct']}%{'':<5}"
            f"{res['category_count']}"
        )
        print(row)

    print("=" * 78)
    print("Evaluation completed successfully.")


if __name__ == "__main__":
    run_evaluation_suite()
