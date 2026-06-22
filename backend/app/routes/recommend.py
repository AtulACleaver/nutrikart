from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, Category
from ..schemas import RecommendRequest, RecommendResponse
from ..recommendation import get_recommendation

router = APIRouter()

VALID_CONDITIONS = {"diabetic", "hypertension", "weight_loss"}


@router.post("/recommend", response_model=RecommendResponse)
def recommend(
    request: RecommendRequest,
    use_lp: bool = True,
    db: Session = Depends(get_db),
):
    # ── Validate inputs ──
    if request.health_condition and request.health_condition not in VALID_CONDITIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid health_condition: '{request.health_condition}'. "
                f"Valid options: {', '.join(sorted(VALID_CONDITIONS))} or null"
            ),
        )

    if request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be greater than 0")

    if request.household_size < 1:
        raise HTTPException(status_code=400, detail="household_size must be at least 1")

    # ── Run pipeline ──
    try:
        all_products = db.query(Product).all()
        categories = db.query(Category).all()
        cat_map = {c.id: c.name for c in categories}
    except Exception as db_err:
        from .products import get_fallback_catalog
        all_products = get_fallback_catalog()
        cat_map = {
            1: "Cereals & Breakfast",
            2: "Dairy & Cheese",
            3: "Chips & Crisps",
            4: "Biscuits & Cookies",
            5: "Beverages",
            6: "Protein & Nutrition Bars",
            7: "Grains & Staples",
            8: "Spreads & Jams",
            9: "Frozen & Ready-to-Eat",
        }

    result = get_recommendation(
        products=all_products,
        health_condition=request.health_condition,
        budget=request.budget,
        household_size=request.household_size,
        use_lp=use_lp,
    )

    # ── Handle empty results ──
    if not result["recommendations"]:
        result["summary"]["message"] = (
            "No products match your criteria. "
            "Try increasing your budget or removing health condition filters."
        )

    # ── Add category names ──
    for rec in result["recommendations"]:
        rec["category_name"] = cat_map.get(rec["category_id"])

    return result