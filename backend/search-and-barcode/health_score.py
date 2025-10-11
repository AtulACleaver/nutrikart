from typing import Dict, List, Tuple


def _to_float(val, default: float = 0.0) -> float:
    try:
        if val is None:
            return default
        return float(val)
    except (TypeError, ValueError):
        return default


def compute_health_score(ingredients_text: str, nutr: Dict) -> Tuple[int, List[str]]:
    """
    Compute a simple, deterministic health score (1-100) with reasons based on
    nutrition per 100g. This is a heuristic for MVP and can be replaced/tuned later.
    """
    score = 100
    reasons: List[str] = []

    # Prefer explicit per-100g fields; OFF sometimes provides alternatives
    kcal = _to_float(
        nutr.get("energy-kcal_100g",
                 nutr.get("energy-kcal")
                 )
    )

    sugar = _to_float(nutr.get("sugars_100g"))
    sat_fat = _to_float(nutr.get("saturated-fat_100g"))

    # Sodium is usually in grams per 100g as `sodium_100g` on OFF
    sodium_g = _to_float(nutr.get("sodium_100g"))
    sodium_mg = _to_float(nutr.get("sodium_mg_100g"), sodium_g * 1000 if sodium_g else 0)

    fiber = _to_float(nutr.get("fiber_100g"))
    protein = _to_float(nutr.get("proteins_100g"))

    # Penalties
    if sugar > 5:
        penalty = int((sugar - 5) * 2)  # 2 points per gram over 5g/100g
        score -= penalty
        reasons.append(f"High sugar ({sugar:.1f} g/100g)")

    if sat_fat > 3:
        penalty = int((sat_fat - 3) * 3)  # 3 points per gram over 3g/100g
        score -= penalty
        reasons.append(f"High saturated fat ({sat_fat:.1f} g/100g)")

    if sodium_mg > 400:
        penalty = int((sodium_mg - 400) / 40)  # 1 point per 40 mg over 400 mg/100g
        if penalty > 0:
            score -= penalty
            reasons.append(f"High sodium ({int(sodium_mg)} mg/100g)")

    if kcal > 250:
        penalty = int((kcal - 250) / 15)  # 1 point per 15 kcal over 250/100g
        if penalty > 0:
            score -= penalty
            reasons.append(f"Calorie dense ({int(kcal)} kcal/100g)")

    # Bonuses
    if fiber > 0:
        bonus = min(10, int(fiber))  # up to +10 for fiber
        if bonus:
            score += bonus
            reasons.append(f"Good fiber (+{fiber:.1f} g/100g)")

    if protein > 0:
        bonus = min(10, int(protein))  # up to +10 for protein
        if bonus:
            score += bonus
            reasons.append(f"Protein (+{protein:.1f} g/100g)")

    # Ingredient heuristics (very light-touch for MVP)
    txt = (ingredients_text or "").lower()
    if "artificial" in txt:
        score -= 5
        reasons.append("Contains additives")

    score = max(1, min(100, score))
    return score, reasons
