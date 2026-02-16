from app.database import products_engine, categories_engine, ProductsBase, CategoriesBase, ProductsSessionLocal, CategoriesSessionLocal
from app.models import Product, Category
from sqlalchemy.orm import Session

def test_multi_db():
    print("--- Multi-Database Test ---")
    
    # 1. Create tables in respective databases
    print("Recreating tables in both databases...")
    ProductsBase.metadata.drop_all(bind=products_engine)
    ProductsBase.metadata.create_all(bind=products_engine)
    
    CategoriesBase.metadata.drop_all(bind=categories_engine)
    CategoriesBase.metadata.create_all(bind=categories_engine)
    print("Tables created successfully.")

    # 2. Insert a Category
    cat_db = CategoriesSessionLocal()
    try:
        print("Inserting a test category...")
        test_cat = Category(name="Supplements")
        cat_db.add(test_cat)
        cat_db.commit()
        cat_db.refresh(test_cat)
        print(f"Category inserted: {test_cat.name} (ID: {test_cat.id})")
        
        category_id = test_cat.id
    except Exception as e:
        print(f"Error inserting category: {e}")
        cat_db.rollback()
        return
    finally:
        cat_db.close()

    # 3. Insert a Product linking to that Category ID
    prod_db = ProductsSessionLocal()
    try:
        print("Inserting a test product...")
        test_prod = Product(
            name="Whey Protein",
            category_id=category_id,
            price_per_unit=1500.00,
            calories=120
        )
        prod_db.add(test_prod)
        prod_db.commit()
        prod_db.refresh(test_prod)
        print(f"Product inserted: {test_prod.name} (ID: {test_prod.id}, Category ID: {test_prod.category_id})")
    except Exception as e:
        print(f"Error inserting product: {e}")
        prod_db.rollback()
    finally:
        prod_db.close()

    # 4. Verify data from both
    print("\nVerifying data...")
    cat_db = CategoriesSessionLocal()
    prod_db = ProductsSessionLocal()
    try:
        cat = cat_db.query(Category).first()
        prod = prod_db.query(Product).first()
        
        if cat and prod:
            print(f"Success! Found category '{cat.name}' in Categories DB and product '{prod.name}' in Products DB.")
            if prod.category_id == cat.id:
                print("Cross-DB consistency check passed (ID match).")
        else:
            print("Failed to retrieve data from one or both databases.")
    finally:
        cat_db.close()
        prod_db.close()

if __name__ == "__main__":
    test_multi_db()
