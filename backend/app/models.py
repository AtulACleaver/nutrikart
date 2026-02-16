from sqlalchemy import Column, Integer, String, Numeric, Text
from .database import ProductsBase, CategoriesBase

class Product(ProductsBase):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer)
    price_per_unit = Column(Numeric(10, 2))
    serving_size = Column(Numeric(6, 2))
    calories = Column(Numeric(6, 2))
    sugar = Column(Numeric(6, 2))
    sodium = Column(Numeric(6, 2))
    protein = Column(Numeric(6, 2))
    fat = Column(Numeric(6, 2))
    saturated_fat = Column(Numeric(6, 2))
    fiber = Column(Numeric(6, 2))
    image_url = Column(String, nullable=True)

class Category(CategoriesBase):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)