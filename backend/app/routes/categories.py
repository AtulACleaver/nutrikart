from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_categories_db
from ..models import Category
from ..schemas import CategoryBase, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_categories_db)):
    """Get all categories"""
    categories = db.query(Category).all()
    return categories

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryBase, db: Session = Depends(get_categories_db)):
    """Create a new category"""
    # Check if category with same name already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category
