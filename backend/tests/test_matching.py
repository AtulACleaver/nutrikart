"""Tests for exact product matching service."""

from app.models import Product
from app.services.matching import (
    MatchConfidence,
    ProductMatcher,
    extract_pack_grams,
    normalize_text,
)
from app.services.providers.base import RetailerOffer


def make_test_product(id, name, barcode=None, pack_qty=500.0, pack_unit="g"):
    p = Product(id=id, name=name)
    p.source_ref = barcode
    p.pack_quantity = pack_qty
    p.pack_unit = pack_unit
    return p


def test_normalize_text():
    assert normalize_text("Amul Masti Dahi, 400g!") == "amul masti dahi 400g"
    assert normalize_text("  Kellogg's Oats - 1kg ") == "kellogg s oats 1kg"


def test_extract_pack_grams():
    assert extract_pack_grams("5 kg") == 5000.0
    assert extract_pack_grams("500g") == 500.0
    assert extract_pack_grams("1 L") == 1000.0
    assert extract_pack_grams("250 ml") == 250.0
    assert extract_pack_grams("Pouch pack") is None


def test_barcode_exact_match():
    products = [
        make_test_product(1, "Aashirvaad Sharbati Atta", barcode="8901030382894", pack_qty=5000.0),
        make_test_product(2, "Tata Salt Lite", barcode="8904043901111", pack_qty=1000.0),
    ]

    offer = RetailerOffer(
        sku_id="swiggy_123",
        retailer_name="Instamart",
        title="Aashirvaad Whole Wheat Atta 5kg",
        price=320.0,
        barcode="8901030382894",
    )

    result = ProductMatcher.match(offer, products)
    assert result.confidence == MatchConfidence.EXACT_BARCODE
    assert result.matched_product_id == 1
    assert result.retained_nutrition_safe is True


def test_reviewed_variant_pack_identity_match():
    products = [
        make_test_product(1, "Saffola Masala Oats Classic", pack_qty=500.0),
        make_test_product(2, "Saffola Masala Oats Peppy Tomato", pack_qty=500.0),
    ]

    offer = RetailerOffer(
        sku_id="swiggy_456",
        retailer_name="Instamart",
        title="Saffola Masala Oats Classic",
        pack_size_desc="500g",
        price=180.0,
    )

    result = ProductMatcher.match(offer, products)
    assert result.confidence == MatchConfidence.REVIEWED_VARIANT
    assert result.matched_product_id == 1
    assert result.retained_nutrition_safe is True


def test_ambiguous_candidate_rejected():
    # Two variants sharing similar name but different flavors
    products = [
        make_test_product(1, "Epigamia Greek Yogurt Natural", pack_qty=100.0),
        make_test_product(2, "Epigamia Greek Yogurt Strawberry", pack_qty=100.0),
        make_test_product(3, "Epigamia Greek Yogurt Blueberry", pack_qty=100.0),
    ]

    # Retailer title lacks flavor specificity
    offer = RetailerOffer(
        sku_id="swiggy_789",
        retailer_name="Instamart",
        title="Epigamia Greek Yogurt",
        pack_size_desc="100g",
        price=60.0,
    )

    result = ProductMatcher.match(offer, products)
    assert result.confidence == MatchConfidence.AMBIGUOUS_CANDIDATE
    assert result.matched_product_id is None
    assert result.retained_nutrition_safe is False
    assert "Ambiguous" in result.reason


def test_unmatched_retailer_sku():
    products = [
        make_test_product(1, "Daawat Brown Rice", pack_qty=1000.0),
    ]

    offer = RetailerOffer(
        sku_id="swiggy_999",
        retailer_name="Instamart",
        title="Lay's West Indies Hot 'n' Sweet Chilli Chips",
        pack_size_desc="52g",
        price=20.0,
    )

    result = ProductMatcher.match(offer, products)
    assert result.confidence == MatchConfidence.UNMATCHED
    assert result.matched_product_id is None
    assert result.retained_nutrition_safe is False
