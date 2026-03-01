from pydantic import BaseModel
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
    
class ProductResponse(ProductBase):
    id: int
    category_name: str | None = None
    sat_fat: Decimal | None = None

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True


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
    calories: float
    sugar: float
    protein: float
    fiber: float
    sodium: float
    fat: float
    sat_fat: float
    image_url: str | None = None

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

class RecommendResponse(BaseModel):
    recommendations: list[RecommendProduct]
    summary: RecommendSummary