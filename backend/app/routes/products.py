from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_products_db, get_categories_db
from ..models import Product, Category
from ..schemas import ProductBase, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_products_db)):
    """Get all products"""
    products = db.query(Product).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_products_db)):
    """Get a single product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductBase, db: Session = Depends(get_products_db)):
    """Create a new product"""
    new_product = Product(
        name=product.name,
        category_id=product.category_id,
        price_per_unit=product.price_per_unit,
        serving_size=product.serving_size,
        calories=product.calories,
        sugar=product.sugar,
        sodium=product.sodium,
        protein=product.protein,
        fat=product.fat,
        saturated_fat=product.saturated_fat,
        fiber=product.fiber,
        image_url=product.image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_products_db)):
    """Delete a product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return None
