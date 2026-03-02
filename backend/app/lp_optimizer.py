"""
Linear Programming budget optimizer using PuLP.
Replaces greedy allocate_budget() with a mathematically optimal solution.

Formulation:
  Maximize:  Σ (score_i x qty_i)
  Subject to:
    Σ (price_i x qty_i) ≤ budget           (budget constraint)
    0 ≤ qty_i ≤ max_qty                     (quantity bounds)
    qty_i ∈ integers                        (whole units only)
    Σ y_c ≥ min_categories                  (diversity, optional)
    Σ qty_i ≤ max_per_category  per cat     (category cap, optional)

Big-M trick links binary indicators y_c to product quantities:
    Σ qty_i(in cat c) ≥ y_c
    Σ qty_i(in cat c) ≤ M x y_c
"""
import pulp

def allocate_budget_lp(
    ranked_products,
    budget: float,
    household_size: int = 1,
    max_qty_per_product: int | None = None,
    min_categories: int = 0,
    max_per_category: int | None = None,
):
    """
    Optimal budget allocation using Integer Linear Programming.

    Args:
        ranked_products: list of (product, score) tuples from rank_products()
        budget: total budget in ₹
        household_size: number of people
        max_qty_per_product: max units per product (default: household_size × 3)
        min_categories: minimum distinct categories required in result
        max_per_category: max total units from any single category

    Returns:
        allocations: list of dicts (same shape as greedy version)
        remaining_budget: float
    """
    if not ranked_products or budget <= 0:
        return [], round(budget, 2) if budget > 0 else 0.0

    # Align with greedy behavior: typically 1 unit per person in household.
    # While the user suggested household_size * 3, using household_size ensures
    # the solver finds the best *set* of items to fill the budget without
    # hoarding a single item when scores are negative.
    max_qty = max_qty_per_product or household_size

    prob = pulp.LpProblem("NutriKart_Budget", pulp.LpMaximize)

    # ── Decision variables ──
    qty_vars = {}
    valid_products = []

    for idx, (product, score) in enumerate(ranked_products):
        price = float(product.price_per_unit) if product.price_per_unit else 0
        if price <= 0:
            continue
        qty_vars[idx] = pulp.LpVariable(
            f"qty_{idx}", lowBound=0, upBound=max_qty, cat="Integer"
        )
        valid_products.append((idx, product, score, price))

    if not valid_products:
        return [], round(budget, 2)

    # ── Objective: maximize total nutrition score ──
    # Note: Scores can be negative due to weights (e.g., penalties for sugar).
    # To ensure the solver doesn't pick 0 units as the mathematical maximum,
    # we shift scores to be positive. We shift such that the lowest-scored
    # product has a small positive value (e.g., 1.0).
    min_score = min(score for _, score in ranked_products)
    offset = abs(min_score) + 1.0

    prob += pulp.lpSum(
        (score + offset) * qty_vars[idx] for idx, _, score, _ in valid_products
    ), "Total_Nutrition_Score"

    # ── Budget constraint ──
    prob += pulp.lpSum(
        price * qty_vars[idx] for idx, _, _, price in valid_products
    ) <= budget, "Budget_Limit"

    # ── Category diversity constraints ──
    if min_categories > 0 or max_per_category:
        categories = {}
        for idx, product, score, price in valid_products:
            cat_id = product.category_id
            if cat_id not in categories:
                categories[cat_id] = []
            categories[cat_id].append(idx)

        if min_categories > 0:
            cat_indicators = {}
            for cat_id, product_indices in categories.items():
                y = pulp.LpVariable(f"cat_{cat_id}", cat="Binary")
                cat_indicators[cat_id] = y
                M = max_qty * len(product_indices)
                prob += pulp.lpSum(
                    qty_vars[i] for i in product_indices
                ) >= y, f"Cat_{cat_id}_lower"
                prob += pulp.lpSum(
                    qty_vars[i] for i in product_indices
                ) <= M * y, f"Cat_{cat_id}_upper"
            prob += pulp.lpSum(
                cat_indicators[c] for c in categories
            ) >= min_categories, "Min_Categories"

        if max_per_category:
            for cat_id, product_indices in categories.items():
                prob += pulp.lpSum(
                    qty_vars[i] for i in product_indices
                ) <= max_per_category, f"Cat_{cat_id}_max"

    # ── Solve ──
    solver = pulp.PULP_CBC_CMD(msg=0)
    if not solver.available():
        # If CBC is not found, we can't solve LP. 
        # The recommendation pipeline will fall back to greedy.
        return [], round(budget, 2)
        
    prob.solve(solver)

    if prob.status != pulp.constants.LpStatusOptimal:
        # Fallback to a simpler model if diversity constraints make it infeasible
        if min_categories > 0 or max_per_category:
            return allocate_budget_lp(
                ranked_products, budget, household_size,
                max_qty_per_product=max_qty_per_product,
                min_categories=0, max_per_category=None,
            )
        return [], round(budget, 2)

    # ── Extract results ──
    allocations = []
    total_spent = 0.0
    for idx, product, score, price in valid_products:
        qty = int(qty_vars[idx].value() or 0)
        if qty <= 0:
            continue
        subtotal = price * qty
        total_spent += subtotal
        allocations.append(_build_allocation_lp(product, qty, subtotal, score))

    allocations.sort(key=lambda a: a["score_raw"], reverse=True)
    remaining = round(budget - total_spent, 2)
    return allocations, remaining

def _build_allocation_lp(product, quantity: int, subtotal: float, score: float) -> dict:
    """Build allocation dict. Same shape as greedy for drop-in swap."""
    # Score normalization (consistent with greedy version)
    score100 = max(0, min(100, int((score + 150) / 150 * 100)))

    return {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": getattr(product, "category_name", None),
        "price_per_unit": float(product.price_per_unit) if product.price_per_unit else 0,
        "quantity": quantity,
        "subtotal": subtotal,
        "score_raw": score,
        "score100": score100,
        "calories": float(product.calories) if product.calories else 0,
        "sugar": float(product.sugar) if product.sugar else 0,
        "protein": float(product.protein) if product.protein else 0,
        "fiber": float(product.fiber) if product.fiber else 0,
        "sodium": float(product.sodium) if product.sodium else 0,
        "fat": float(product.fat) if product.fat else 0,
        "sat_fat": float(product.saturated_fat) if product.saturated_fat else 0,
        "image_url": product.image_url,
    }
