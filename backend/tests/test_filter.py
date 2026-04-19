from app.recommendation import filter_products
from tests.conftest import make_product


def test_diabetic_filter_removes_high_sugar(sample_products):
    result = filter_products(sample_products, "diabetic")
    names = [p.name for p in result]
    assert "Sugary Cereal" not in names  # sugar=15 > 5
    assert "Low Sugar Oats" in names     # sugar=1 < 5


def test_diabetic_filter_removes_high_calorie(sample_products):
    result = filter_products(sample_products, "diabetic")
    names = [p.name for p in result]
    # Salty Chips: calories=300 > 200, should be removed
    assert "Salty Chips" not in names


def test_hypertension_filter_removes_high_sodium(sample_products):
    result = filter_products(sample_products, "hypertension")
    names = [p.name for p in result]
    assert "Sugary Cereal" not in names  # sodium=300 > 200
    assert "Salty Chips" not in names    # sodium=500 > 200


def test_hypertension_filter_removes_high_fat(sample_products):
    result = filter_products(sample_products, "hypertension")
    names = [p.name for p in result]
    assert "High Protein Bar" not in names  # fat=6 > 5


def test_none_condition_returns_all(sample_products):
    result = filter_products(sample_products, None)
    assert len(result) == len(sample_products)


def test_unknown_condition_returns_all(sample_products):
    result = filter_products(sample_products, "made_up")
    assert len(result) == len(sample_products)


def test_empty_product_list():
    result = filter_products([], "diabetic")
    assert result == []


def test_missing_data_product_excluded_from_condition_filter(sample_products):
    """Products with missing required nutrition values must NOT pass condition filters."""
    result = filter_products(sample_products, "diabetic")
    names = [p.name for p in result]
    assert "Missing Data Product" not in names, "Missing sugar must be excluded from diabetic filter"

    # When no condition filter is specified, missing data product is allowed for general browsing
    general_result = filter_products(sample_products, None)
    general_names = [p.name for p in general_result]
    assert "Missing Data Product" in general_names


def test_weight_loss_filter():
    """Weight loss: calories > 150, saturated_fat > 3, or sugar > 8 = out."""
    products = [
        make_product(id=1, name="Light Salad", calories=80, saturated_fat=0.5, sugar=2),
        make_product(id=2, name="Heavy Burger", calories=500, saturated_fat=10, sugar=12),
        make_product(id=3, name="Borderline", calories=150, saturated_fat=3, sugar=8),
    ]
    result = filter_products(products, "weight_loss")
    names = [p.name for p in result]
    assert "Light Salad" in names
    assert "Heavy Burger" not in names
    assert "Borderline" in names  # at the limit, not over