import time
import pytest
from scripts.benchmark_optimizer import generate_synthetic_catalog, benchmark_scale
from app.lp_optimizer import allocate_budget_lp


class TestOptimizerBenchmarks:
    """Verifies that LP solver execution stays well within real-time latency budgets."""

    @pytest.mark.parametrize("catalog_size", [10, 50, 100])
    def test_solver_subsecond_latency(self, catalog_size):
        res = benchmark_scale(item_count=catalog_size, budget=1200.0, household=2)
        # Latency should comfortably remain under 1000ms for web request lifecycles
        assert res["elapsed_ms"] < 1000.0
        assert res["total_spent"] <= 1200.0
        assert res["remaining_budget"] >= 0.0

    def test_monotonic_score_improvement_with_budget(self):
        catalog = generate_synthetic_catalog(40)
        alloc_500, rem_500 = allocate_budget_lp(catalog, budget=500.0, household_size=1)
        alloc_1500, rem_1500 = allocate_budget_lp(catalog, budget=1500.0, household_size=1)

        score_500 = sum(item["score_raw"] * item["quantity"] for item in alloc_500)
        score_1500 = sum(item["score_raw"] * item["quantity"] for item in alloc_1500)

        assert score_1500 >= score_500
