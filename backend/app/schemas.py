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
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

