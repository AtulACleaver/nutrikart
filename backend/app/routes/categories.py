from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Category
from ..schemas import CategoryBase, CategoryResponse
from fastapi import HTTPException

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    return db.query(Category).all()

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryBase, db: Session = Depends(get_db)):
    """Create a new category"""
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category
