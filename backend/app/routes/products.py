from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_products_db, get_categories_db
from ..models import Product, Category
from ..schemas import ProductBase, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
def get_products(
    category_id: int | None = None,
    db: Session = Depends(get_products_db),
    cat_db: Session = Depends(get_categories_db)
):
    """Get products, optionally filtered by category_id, with category names"""
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    products = query.all()
    
    # Fetch all categories to create a lookup map
    categories = cat_db.query(Category).all()
    cat_map = {c.id: c.name for c in categories}
    
    # Attach category_name and sat_fat to each product
    for p in products:
        p.category_name = cat_map.get(p.category_id)
        p.sat_fat = p.saturated_fat
        
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int, 
    db: Session = Depends(get_products_db),
    cat_db: Session = Depends(get_categories_db)
):
    """Get a single product by ID with category name"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Fetch category name
    category = cat_db.query(Category).filter(Category.id == product.category_id).first()
    product.category_name = category.name if category else None
    product.sat_fat = product.saturated_fat
    
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
