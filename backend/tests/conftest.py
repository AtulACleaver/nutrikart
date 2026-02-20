import pytest
from types import SimpleNamespace

def make_product(**kwargs):
    defaults = {
        "id": 1,
        "name": "Product 1",
        "price": 100,
        "description": "Description 1",
        "image_url": "https://example.com/image1.jpg",
        "category_id": 1,
        "brand": "Brand 1",
        "rating": 4.5,
        "review_count": 10,
        "stock": 100,
        "is_active": True,
        "created_at": "2022-01-01T00:00:00Z",
        "updated_at": "2022-01-01T00:00:00Z",
        "calories": 100,
        "sugar": 10,
        "protein": 10,
        "fiber": 10,
        "sodium": 10,
        "fat": 10,
        "saturated_fat": 10,
    }
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)

@pytest.fixture
def sample_products():
    return [
        make_product(id=2, name="Low Sugar Oats", sugar=1, calories=120, sodium=50, fiber=10, protein=10),
        make_product(id=1, name="Sugary Cereal", sugar=15, calories=150, sodium=300, fiber=2, protein=5),
        make_product(id=3, name="Salty Chips", sodium=500, calories=300, sugar=2),
        make_product(id=4, name="High Protein Bar", protein=20, fat=6, calories=250),
        make_product(id=5, name="Missing Data Product", sugar=None, calories=None),
    ]