# app/routes/recommend.py (full updated version)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_products_db, get_categories_db
from app.models import Product, Category
from app.schemas import RecommendRequest, RecommendResponse
from app.recommendation import get_recommendation

router = APIRouter()

VALID_CONDITIONS = {"diabetic", "hypertension", "weight_loss"}

@router.post("/recommend", response_model=RecommendResponse)
def recommend(
    request: RecommendRequest,
    use_lp: bool = True,
    db: Session = Depends(get_products_db),
    cat_db: Session = Depends(get_categories_db),
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
        raise HTTPException(
            status_code=400,
            detail="Budget must be greater than 0",
        )

    if request.household_size < 1:
        raise HTTPException(
            status_code=400,
            detail="household_size must be at least 1",
        )

    # ── Run pipeline ──
    all_products = db.query(Product).all()
    result = get_recommendation(
        products=all_products,
        health_condition=request.health_condition,
        budget=request.budget,
        household_size=request.household_size,
        use_lp=use_lp,
    )

    # ── Handle empty results ──
    if not result["recommendations"]:
        raise HTTPException(
            status_code=404,
            detail=(
                "No products match your criteria. "
                "Try increasing your budget or removing health condition filters."
            ),
        )

    # ── Add category names ──
    categories = cat_db.query(Category).all()
    cat_map = {c.id: c.name for c in categories}
    for rec in result["recommendations"]:
        rec["category_name"] = cat_map.get(rec["category_id"])

    return result