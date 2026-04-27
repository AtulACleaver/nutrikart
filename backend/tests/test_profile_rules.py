from fastapi.testclient import TestClient
from app.main import app
from app.recommendation import HEALTH_CONSTRAINTS, SCORING_WEIGHTS

client = TestClient(app)

def test_get_profile_rules():
    response = client.get("/profile-rules")
    assert response.status_code == 200
    data = response.json()
    
    assert data["version"] == 2
    assert data["basis"] == "per_serving"
    assert "disclaimer" in data
    assert "conditions" in data
    
    conditions = data["conditions"]
    # Check that all health constraints from recommendation engine are present
    for cond_key, limits in HEALTH_CONSTRAINTS.items():
        assert cond_key in conditions
        cond_data = conditions[cond_key]
        assert "display_name" in cond_data
        assert "limits" in cond_data
        assert "weights" in cond_data
        
        # Verify limits match exactly
        for nutrient, limit_val in limits.items():
            assert cond_data["limits"][nutrient] == float(limit_val)
            
        # Verify scoring weights match exactly
        expected_weights = SCORING_WEIGHTS.get(cond_key, {})
        for nutrient, weight in expected_weights.items():
            assert cond_data["weights"][nutrient] == weight
