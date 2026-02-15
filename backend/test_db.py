from app.database import engine, Base, SessionLocal
from app.models import Product
from sqlalchemy.orm import Session

def test_crud():
    # 1. Create tables
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    # 2. Insert one product
    db = SessionLocal()
    try:
        print("Inserting a test product...")
        test_product = Product(
            name="Test Product",
            description="Testing database connection with INR",
            price=1499.00,
            stock_quantity=100
        )
        db.add(test_product)
        db.commit()
        db.refresh(test_product)
        print(f"Product inserted with ID: {test_product.id}")

        # 3. Read it back
        print("Reading product back...")
        product = db.query(Product).filter(Product.id == test_product.id).first()
        if product:
            print(f"Successfully retrieved product: {product.name} - ${product.price}")
        else:
            print("Failed to retrieve product.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_crud()
