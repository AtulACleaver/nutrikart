from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .database import get_products_db, get_categories_db
from .models import Product, Category

app = FastAPI(title="NutriKart API")

@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}

@app.get("/products")
def get_products(db: Session = Depends(get_products_db)):
    products = db.query(Product).all()
    return products

@app.get("/categories")
def get_categories(db: Session = Depends(get_categories_db)):
    categories = db.query(Category).all()
    return categories

@app.get("/products/by-category/{category_id}")
def get_products_by_category(category_id: int, db: Session = Depends(get_products_db)):
    products = db.query(Product).filter(Product.category_id == category_id).all()
    if not products:
        raise HTTPException(status_code=404, detail="No products found for this category")
    return products
