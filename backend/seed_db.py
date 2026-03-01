# backend/seed_db.py
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.database import products_engine, categories_engine, ProductsBase, CategoriesBase
from app.models import Product, Category

def seed():
    # Create tables
    ProductsBase.metadata.create_all(bind=products_engine)
    CategoriesBase.metadata.create_all(bind=categories_engine)

    with Session(categories_engine) as session:
        if session.query(Category).count() > 0:
            print("Categories already seeded.")
        else:
            cats = [
                Category(id=1, name="Dairy"),
                Category(id=2, name="Grains"),
                Category(id=3, name="Bakery"),
                Category(id=4, name="Snacks"),
                Category(id=5, name="Proteins"),
            ]
            session.add_all(cats)
            session.commit()
            print("Categories seeded.")

    with Session(products_engine) as session:
        if session.query(Product).count() > 0:
            print("Products already seeded.")
        else:
            prods = [
                Product(name="Greek Yogurt", category_id=1, price_per_unit=120, calories=100, sugar=4, protein=15, fiber=0, sodium=40, fat=1, saturated_fat=0.5),
                Product(name="Apple", category_id=4, price_per_unit=50, calories=95, sugar=19, protein=0.5, fiber=4.5, sodium=1, fat=0.3, saturated_fat=0.1),
                Product(name="Brown Rice", category_id=2, price_per_unit=150, calories=215, sugar=0.5, protein=5, fiber=3.5, sodium=5, fat=1.6, saturated_fat=0.4),
                Product(name="Chicken Breast", category_id=5, price_per_unit=400, calories=165, sugar=0, protein=31, fiber=0, sodium=74, fat=3.6, saturated_fat=1),
                Product(name="Whole Wheat Bread", category_id=3, price_per_unit=80, calories=70, sugar=1, protein=3, fiber=2, sodium=135, fat=1, saturated_fat=0.2),
                Product(name="Peanut Butter", category_id=4, price_per_unit=300, calories=190, sugar=3, protein=7, fiber=2, sodium=140, fat=16, saturated_fat=3),
                Product(name="Oats", category_id=2, price_per_unit=99, calories=150, sugar=0.5, protein=5, fiber=4, sodium=2, fat=2.5, saturated_fat=0.5),
                Product(name="Almonds", category_id=4, price_per_unit=600, calories=160, sugar=1, protein=6, fiber=3.5, sodium=0, fat=14, saturated_fat=1.1),
            ]
            session.add_all(prods)
            session.commit()
            print("Products seeded.")

if __name__ == "__main__":
    seed()
