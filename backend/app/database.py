from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os 
from dotenv import load_dotenv

load_dotenv()

# Products Database
PRODUCTS_DATABASE_URL = os.getenv("PRODUCTS_DATABASE_URL")
if not PRODUCTS_DATABASE_URL:
    raise ValueError("PRODUCTS_DATABASE_URL is not set in the environment or .env file")

products_engine = create_engine(PRODUCTS_DATABASE_URL)
ProductsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=products_engine)

class ProductsBase(DeclarativeBase):
    pass

# Categories Database
CATEGORIES_DATABASE_URL = os.getenv("CATEGORIES_DATABASE_URL")
if not CATEGORIES_DATABASE_URL:
    raise ValueError("CATEGORIES_DATABASE_URL is not set in the environment or .env file")

categories_engine = create_engine(CATEGORIES_DATABASE_URL)
CategoriesSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=categories_engine)

class CategoriesBase(DeclarativeBase):
    pass

def get_products_db():
    db = ProductsSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_categories_db():
    db = CategoriesSessionLocal()
    try:
        yield db
    finally:
        db.close()