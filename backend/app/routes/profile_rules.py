from fastapi import APIRouter
from ..recommendation import HEALTH_CONSTRAINTS, SCORING_WEIGHTS

router = APIRouter()

DISPLAY_NAMES = {
    "diabetic": "Diabetic-Friendly",
    "hypertension": "Hypertension-Conscious",
    "weight_loss": "Weight Management",
}

@router.get("/profile-rules")
def get_profile_rules():
    """
    Authoritative versioned rules endpoint.
    Ensures frontend client and backend recommendation engine share the exact same
    nutritional constraints and scoring weights, eliminating configuration drift.
    """
    conditions_payload = {}
    for cond_key, constraints in HEALTH_CONSTRAINTS.items():
        conditions_payload[cond_key] = {
            "display_name": DISPLAY_NAMES.get(cond_key, cond_key.title()),
            "limits": {k: float(v) for k, v in constraints.items()},
            "weights": SCORING_WEIGHTS.get(cond_key, {}),
        }

    return {
        "version": 2,
        "basis": "per_serving",
        "disclaimer": (
            "NutriKart profiles apply heuristic limits based on public nutritional guidelines. "
            "Not medical or clinical advice."
        ),
        "conditions": conditions_payload,
    }
