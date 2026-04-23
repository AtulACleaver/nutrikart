from decimal import Decimal

# HARD Constraints

HEALTH_CONSTRAINTS = {
    "diabetic": {
        "sugar_max": Decimal("5.0"),       # grams per serving
        "calorie_max": Decimal("200.0"),   # kcal per serving
    },
    "hypertension": {
        "sodium_max": Decimal("200.0"),    # mg per serving
        "fat_max": Decimal("5.0"),         # grams per serving
    },
    "weight_loss": {
        "calorie_max": Decimal("150.0"),   # kcal per serving
        "saturated_fat_max": Decimal("3.0"),  # grams per serving
        "sugar_max": Decimal("8.0"),       # grams per serving
    },
}

# maps constraint keys to field names
CONSTRAINT_FIELD_MAP = {
    "sugar_max": "sugar",
    "sodium_max": "sodium",
    "calorie_max": "calories",
    "fat_max": "fat",
    "saturated_fat_max": "saturated_fat",
}


# Remove products that violate hard constraints for the given condition.
# If health_condition is None or not recognized, return all products.


def get_normalized_serving_nutrient(product, field_name: str) -> Decimal | None:
    """
    Normalizes a nutrient value to a 'per_serving' basis.
    If product basis is per_100g or per_100ml, scales via serving_size / 100.
    If basis is unknown or serving_size is missing, returns None to prevent ungrounded fits.
    """
    raw_val = getattr(product, field_name, None)
    if raw_val is None:
        return None

    basis = getattr(product, "measurement_basis", "per_serving") or "per_serving"

    if basis == "per_serving":
        return Decimal(str(raw_val))
    elif basis in ("per_100g", "per_100ml"):
        serving_size = getattr(product, "serving_size", None)
        if not serving_size or float(serving_size) <= 0:
            return None  # Cannot normalize without valid serving size
        factor = Decimal(str(serving_size)) / Decimal("100.0")
        return round(Decimal(str(raw_val)) * factor, 2)
    else:
        return None  # Unsupported basis


def filter_products(products, health_condition: str | None):
    if not health_condition or health_condition not in HEALTH_CONSTRAINTS:
        return list(products)  # no filtering

    constraints = HEALTH_CONSTRAINTS[health_condition]
    filtered = []

    for product in products:
        # Unverified / unknown records cannot be represented as verified fits
        if getattr(product, "verification_status", None) == "unverified_unknown":
            continue

        passes = True
        for constraint_key, max_value in constraints.items():
            field_name = CONSTRAINT_FIELD_MAP[constraint_key]
            # Obtain normalized per-serving value according to the measurement basis contract
            product_value = get_normalized_serving_nutrient(product, field_name)

            # Strict guardrail: Missing or non-convertible nutrients cannot pass condition filters
            if product_value is None:
                passes = False
                break

            if product_value > max_value:
                passes = False
                break  # one violation = out

        if passes:
            filtered.append(product)

    return filtered



# Scoring weights per health condition
# Positive = reward, Negative = penalty
# Higher absolute value = more influence on the score
SCORING_WEIGHTS = {
    "diabetic": {
        "sugar": -3.0,      # heavy penalty for sugar
        "fiber": 2.0,       # reward fiber (slows sugar absorption)
        "protein": 1.5,     # reward protein (satiety)
        "sodium": -0.5,     # mild penalty
        "calories": -0.5,   # mild penalty
    },
    "hypertension": {
        "sodium": -4.0,     # heavy penalty for sodium
        "fat": -2.0,        # penalize fat
        "saturated_fat": -2.5,
        "fiber": 1.5,
        "protein": 1.0,
        "sugar": -1.0,
    },
    "weight_loss": {
        "calories": -3.0,   # heavy penalty for calories
        "saturated_fat": -2.5,
        "sugar": -2.0,
        "protein": 2.5,     # reward protein (keeps you full)
        "fiber": 2.0,       # reward fiber (keeps you full)
        "fat": -1.0,
    },
}

# default weights when no health condition is specified
DEFAULT_WEIGHTS = {
    "protein": 1.5,
    "fiber": 1.5,
    "sugar": -1.0,
    "sodium": -0.5,
    "saturated_fat": -1.0,
    "calories": -0.3,
}

# Calculate a numeric score for a single product.
# Higher score = better fit for this health condition.

def score_product(product, health_condition: str | None) -> float:
    weights = SCORING_WEIGHTS.get(health_condition, DEFAULT_WEIGHTS)
    score = 0.0

    for nutrient, weight in weights.items():
        value = getattr(product, nutrient, None)
        if value is None:
            continue
        score += float(value) * weight
    return round(score, 2)


# Score all products, return sorted best-first.
# Returns: list of (product, score) tuples.None

def rank_products(products, health_condition: str | None):
    scored = [
        (product, score_product(product, health_condition))
        for product in products
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored

### How to read a score

# Say a product has: sugar=2g, fiber=5g, protein=8g, sodium=100mg, calories=120
# For a diabetic:

# score = (2 × -3.0) + (5 × 2.0) + (8 × 1.5) + (100 × -0.5) + (120 × -0.5)
#       = -6 + 10 + 12 + -50 + -60
#       = -94.0

# The absolute number doesn't matter. What matters is that products with lower sugar, higher fiber, and higher protein get higher (less negative) scores relative to others.

# BUDGET ALLOCATION
def allocate_budget(
    ranked_products,
    budget: float,
    household_size: int = 1,
):
    """
    Greedy budget allocation: buy from best-scored products first.
    Enforces bounded household size (1 to 10) and strict integer quantities.
    """
    if not ranked_products or budget <= 0:
        return [], round(budget, 2) if budget > 0 else 0.0

    household_size = max(1, min(10, int(household_size)))
    remaining = round(float(budget), 2)
    allocations = []

    for product, score in ranked_products:
        if remaining <= 0:
            break

        price = float(product.price_per_unit) if product.price_per_unit else 0
        if price <= 0:
            continue

        # base: 1 unit per household member
        desired_qty = household_size
        cost = price * desired_qty

        if cost <= remaining: 
            # Can afford full household quantity
            allocations.append(_build_allocation(product, desired_qty, cost, score))
            remaining -= cost
        elif price <= remaining:
            # Can't afford full qty, buy what we can
            affordable_qty = int(remaining // price)
            if affordable_qty > 0:
                cost = price * affordable_qty
                allocations.append(_build_allocation(product, affordable_qty, cost, score))
                remaining -= cost

    return allocations, round(remaining, 2)

try:
    from app.lp_optimizer import allocate_budget_lp
    LP_AVAILABLE = True
except ImportError:
    LP_AVAILABLE = False


def get_recommendation(
    products,
    health_condition: str | None,
    budget: float,
    household_size: int = 1,
    use_lp: bool = True,
):
    # filter (1)
    filtered = filter_products(products, health_condition)

    # score and rank
    ranked = rank_products(filtered, health_condition)

    # allocate budget
    if use_lp and LP_AVAILABLE:
        allocations, remaining_budget = allocate_budget_lp(
            ranked, budget, household_size
        )
        allocation_method = "lp"
    else:
        allocations, remaining_budget = allocate_budget(
            ranked, budget, household_size
        )
        allocation_method = "greedy"

    # summary stats
    total_spent = sum(a["subtotal"] for a in allocations)
    total_calories = sum((a["calories"] or 0) * a["quantity"] for a in allocations)
    total_protein = sum((a["protein"] or 0) * a["quantity"] for a in allocations)

    return {
        "recommendations": allocations,
        "summary": {
            "total_products": len(allocations),
            "total_spent": round(total_spent, 2),
            "remaining_budget": round(remaining_budget, 2),
            "budget": budget,
            "total_calories": round(total_calories, 2),
            "total_protein": round(total_protein, 2),
            "products_considered": len(products),
            "products_after_filter": len(filtered),
            "health_condition": health_condition,
            "household_size": household_size,
            "allocation_method": allocation_method,
            "data_mode": "static_catalogue",
            "is_fallback": True,
            "freshness_status": "verified_static_baseline",
            "disclaimer": "NutriKart recommendations apply heuristic nutrient limits to verified food data. Not clinical advice.",
        },
    }

def _build_allocation(product, quantity: int, subtotal: float, score: float) -> dict:
    # Basic normalization: assume scores mostly fall between -150 and 0.
    # Map -150 -> 0, 0 -> 100.
    score100 = max(0, min(100, int((score + 150) / 150 * 100)))

    return {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": getattr(product, "category_name", None),
        "price_per_unit": float(product.price_per_unit) if product.price_per_unit is not None else 0.0,
        "quantity": quantity,
        "subtotal": subtotal,
        "score_raw": score,
        "score100": score100,
        "calories": float(product.calories) if product.calories is not None else None,
        "sugar": float(product.sugar) if product.sugar is not None else None,
        "protein": float(product.protein) if product.protein is not None else None,
        "fiber": float(product.fiber) if product.fiber is not None else None,
        "sodium": float(product.sodium) if product.sodium is not None else None,
        "fat": float(product.fat) if product.fat is not None else None,
        "sat_fat": float(product.saturated_fat) if product.saturated_fat is not None else None,
        "image_url": product.image_url,
        "brand": getattr(product, "brand", None),
        "variant": getattr(product, "variant", None),
        "measurement_basis": getattr(product, "measurement_basis", "per_serving"),
        "verification_status": getattr(product, "verification_status", "verified"),
        "source_ref": getattr(product, "source_ref", None),
        "is_fallback": True,
    }