import pytest
from app.services.nutrition import StructuredNutritionService
from app.services.extraction import LabelExtractionService
from app.services.verification import NutritionVerificationWorkflow
from tests.fixtures.nutrition_fixtures import (
    EXACT_VERIFIED_OATS,
    MISSING_REQUIRED_NUTRIENTS_WHEY,
    CONFLICTING_FAT_DATA,
    VERIFIED_LIQUID_MILK,
)

def test_structured_nutrition_barcode_lookup():
    service = StructuredNutritionService(offline_mode=True)
    candidate = service.lookup_by_barcode("8901491102047")
    assert candidate is not None
    assert candidate["brand"] == "Quaker"
    assert candidate["measurement_basis"] == "per_serving"
    assert candidate["sodium"] == 5.0
    assert candidate["verification_status"] == "pending_review"
    assert "Open Food Facts" in candidate["attribution"]

def test_structured_nutrition_name_search_returns_candidates_only():
    service = StructuredNutritionService(offline_mode=True)
    results = service.search_candidates_by_name("Quaker")
    assert len(results) > 0
    # Strict guardrail: Name search must never return 'verified' automatically
    for r in results:
        assert r["verification_status"] == "pending_review"

def test_label_extraction_service_clear_label():
    extractor = LabelExtractionService()
    sample_text = """
    Nutritional Facts
    Serving Size: 30 g
    Energy: 128 kcal
    Protein: 2.4 g
    Total Fat: 4.2 g
    Saturated Fat: 1.1 g
    Total Sugar: 1.2 g
    Dietary Fiber: 2.1 g
    Sodium: 195 mg
    """
    success, record, warning = extractor.extract_from_ocr_text(sample_text, "image-test-01")
    assert success is True
    assert record["calories"] == 128.0
    assert record["protein"] == 2.4
    assert record["fat"] == 4.2
    assert record["saturated_fat"] == 1.1
    assert record["sugar"] == 1.2
    assert record["fiber"] == 2.1
    assert record["sodium"] == 195.0
    assert record["verification_status"] == "pending_review"

def test_label_extraction_salt_to_sodium_conversion():
    extractor = LabelExtractionService()
    sample_text = """
    Nutrition Information per 100 g:
    Calories: 380 kcal
    Protein: 12.0 g
    Total Fat: 6.0 g
    Salt: 1.0 g
    """
    success, record, warning = extractor.extract_from_ocr_text(sample_text, "image-test-salt")
    assert success is True
    assert record["measurement_basis"] == "per_100g"
    # Salt (1.0g / 2.5) * 1000 = 400.0 mg
    assert record["sodium"] == 400.0
    assert record.get("sodium_converted_from_salt") is True

def test_label_extraction_unreadable_rejection():
    extractor = LabelExtractionService()
    success, record, warning = extractor.extract_from_ocr_text("unreadable...", "blurry-img")
    assert success is False
    assert "Unreadable" in warning

def test_verification_workflow_success():
    verifier = NutritionVerificationWorkflow()
    is_valid, reason, audit = verifier.verify_candidate(EXACT_VERIFIED_OATS)
    assert is_valid is True
    assert audit["decision"] == "verified"

def test_verification_workflow_conflicting_fat_rejected():
    verifier = NutritionVerificationWorkflow()
    is_valid, reason, audit = verifier.verify_candidate(CONFLICTING_FAT_DATA)
    assert is_valid is False
    assert audit["decision"] == "rejected"
    assert "Saturated fat" in audit["rejection_reason"]

def test_verification_workflow_missing_nutrients_unverified():
    verifier = NutritionVerificationWorkflow()
    is_valid, reason, audit = verifier.verify_candidate(MISSING_REQUIRED_NUTRIENTS_WHEY)
    assert is_valid is False
    assert audit["decision"] == "unverified_unknown"
    assert "Missing required" in audit["rejection_reason"]
