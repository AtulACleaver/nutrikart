# backend/tests/test_score.py
from app.recommendation import score_product, rank_products
from tests.conftest import make_product


def test_diabetic_rewards_fiber_protein(sample_products):
    oats = sample_products[0]   # Low Sugar Oats: high fiber, high protein
    cereal = sample_products[1] # Sugary Cereal: low fiber, low protein
    # Even before filtering, oats should score higher for diabetics
    assert score_product(oats, "diabetic") > score_product(cereal, "diabetic")


def test_hypertension_penalizes_sodium():
    low_sodium = make_product(name="Low Na", sodium=20, fat=1, saturated_fat=0.5,
                            fiber=5, protein=8, sugar=2)
    high_sodium = make_product(name="High Na", sodium=180, fat=1, saturated_fat=0.5,
                            fiber=5, protein=8, sugar=2)
    assert score_product(low_sodium, "hypertension") > score_product(high_sodium, "hypertension")


def test_weight_loss_rewards_protein():
    high_prot = make_product(name="Protein", protein=25, fiber=5, calories=100,
                            sugar=2, saturated_fat=1, fat=3)
    low_prot = make_product(name="No Protein", protein=1, fiber=1, calories=100,
                            sugar=2, saturated_fat=1, fat=3)
    assert score_product(high_prot, "weight_loss") > score_product(low_prot, "weight_loss")


def test_missing_values_dont_crash():
    empty = make_product(name="Empty", sugar=None, fiber=None, protein=None,
                            calories=None, sodium=None)
    score = score_product(empty, "diabetic")
    assert score == 0.0  # all values missing = zero score


def test_rank_products_returns_sorted(sample_products):
    ranked = rank_products(sample_products, "diabetic")
    scores = [s for _, s in ranked]
    assert scores == sorted(scores, reverse=True)


def test_default_weights_used_when_no_condition(sample_products):
    ranked_none = rank_products(sample_products, None)
    ranked_unknown = rank_products(sample_products, "bogus")
    # Both should use DEFAULT_WEIGHTS → same order
    names_none = [p.name for p, _ in ranked_none]
    names_unknown = [p.name for p, _ in ranked_unknown]
    assert names_none == names_unknown