from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ProductBase(BaseModel):
    name: str
    category_id: int
    price_per_unit: Decimal | None = None
    serving_size: Decimal | None = None
    calories: Decimal | None = None
    sugar: Decimal | None = None
    sodium: Decimal | None = None
    protein: Decimal | None = None
    fat: Decimal | None = None
    saturated_fat: Decimal | None = None
    fiber: Decimal | None = None
    image_url: str | None = None
    
    # Provenance and identity fields
    brand: str | None = None
    variant: str | None = None
    pack_quantity: Decimal | None = None
    pack_unit: str | None = "g"
    serving_unit: str | None = "g"
    measurement_basis: str | None = "per_serving"
    verification_status: str | None = "verified"
    source_type: str | None = "seed"
    source_ref: str | None = None
    version: int = 1
    
class ProductResponse(ProductBase):
    id: int
    category_name: str | None = None
    sat_fat: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Recommendation Schemas

class RecommendRequest(BaseModel):
    budget: float
    health_condition: str | None = None
    household_size: int = 1


class RecommendProduct(BaseModel):
    id: int
    name: str
    category_id: int
    category_name: str | None = None
    price_per_unit: float
    quantity: int
    subtotal: float
    score_raw: float
    score100: int
    calories: float | None = None
    sugar: float | None = None
    protein: float | None = None
    fiber: float | None = None
    sodium: float | None = None
    fat: float | None = None
    sat_fat: float | None = None
    image_url: str | None = None
    brand: str | None = None
    variant: str | None = None
    measurement_basis: str | None = "per_serving"
    verification_status: str | None = "verified"
    source_ref: str | None = None
    is_fallback: bool = True

class RecommendSummary(BaseModel):
    total_products: int
    total_spent: float
    remaining_budget: float
    budget: float
    total_calories: float
    total_protein: float
    products_considered: int
    products_after_filter: int
    health_condition: str | None
    household_size: int
    allocation_method: str = "lp"
    data_mode: str = "static_catalogue"
    is_fallback: bool = True
    freshness_status: str = "verified_static_baseline"
    disclaimer: str = "NutriKart recommendations apply heuristic nutrient limits to verified food data. Not clinical advice."

class RecommendResponse(BaseModel):
    recommendations: list[RecommendProduct]
    summary: RecommendSummary