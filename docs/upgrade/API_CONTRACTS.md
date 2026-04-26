# NutriKart Upgrade 2: Frontend API Contracts & Specification

**Phase Context:** Recommendation integrity and API contracts  
**Specification Version:** `2.0.0`  
**Base URL (Localhost):** `http://localhost:8000`  
**Base URL (Production):** `https://nutrikart.onrender.com`  

---

## 1. Endpoints Overview

| Method | Path | Description | Version |
|---|---|---|---|
| `GET` | `/products` | List all catalog products with category, provenance, and verification status | `2.0` |
| `GET` | `/products/{id}` | Single product with full nutrition specifications | `2.0` |
| `GET` | `/categories` | List of 9 standard grocery categories | `1.0` |
| `POST` | `/recommend` | Calculate globally optimal grocery allocation (PuLP/greedy) with explanations | `2.0` |
| `GET` | `/profile-rules` | Authoritative versioned rules, heuristic limits, and scoring weights | `2.0 (New)` |

---

## 2. Detailed Contract Specifications

### 2.1 `GET /profile-rules`
Returns authoritative versioned health constraints and weights so the frontend never hardcodes or drifts from backend rules.

**Response (HTTP 200)**:
```json
{
  "version": 2,
  "basis": "per_serving",
  "disclaimer": "NutriKart profiles apply heuristic limits based on public nutritional guidelines. Not medical or clinical advice.",
  "conditions": {
    "diabetic": {
      "display_name": "Diabetic-Friendly",
      "limits": {
        "sugar_max": 5.0,
        "calorie_max": 200.0
      },
      "weights": {
        "sugar": -3.0,
        "fiber": 2.0,
        "protein": 1.5,
        "sodium": -0.5,
        "calories": -0.5
      }
    },
    "hypertension": {
      "display_name": "Hypertension-Conscious",
      "limits": {
        "sodium_max": 200.0,
        "fat_max": 5.0
      },
      "weights": {
        "sodium": -4.0,
        "fat": -2.0,
        "saturated_fat": -2.5,
        "fiber": 1.5,
        "protein": 1.0,
        "sugar": -1.0
      }
    },
    "weight_loss": {
      "display_name": "Weight Management",
      "limits": {
        "calorie_max": 150.0,
        "saturated_fat_max": 3.0,
        "sugar_max": 8.0
      },
      "weights": {
        "calories": -3.0,
        "saturated_fat": -2.5,
        "sugar": -2.0,
        "protein": 2.5,
        "fiber": 2.0,
        "fat": -1.0
      }
    }
  }
}
```

### 2.2 `POST /recommend`
Optimizes a grocery list according to health profile and budget.

**Request Payload**:
```json
{
  "budget": 500.0,
  "health_condition": "diabetic",
  "household_size": 2
}
```
*Constraints*: `budget >= 1` (UI recommends $\ge 50$), `household_size` between 1 and 10. `health_condition` is `"diabetic"`, `"hypertension"`, `"weight_loss"`, or `null`.

**Response (HTTP 200 - Matches Found)**:
```json
{
  "recommendations": [
    {
      "id": 2,
      "name": "Saffola Classic Masala Instant Oats 225 g",
      "brand": "Saffola",
      "variant": "Classic Masala Instant Oats",
      "category_id": 1,
      "category_name": "Cereals & Breakfast",
      "price_per_unit": 99.0,
      "quantity": 2,
      "subtotal": 198.0,
      "score_raw": -12.5,
      "score100": 91,
      "calories": 150.0,
      "sugar": 1.5,
      "protein": 4.0,
      "fiber": 4.0,
      "sodium": 450.0,
      "fat": 3.5,
      "sat_fat": 1.0,
      "image_url": "https://cdn.grofers.com/...",
      "measurement_basis": "per_serving",
      "verification_status": "verified",
      "source_ref": "marico-packaging-label-225g",
      "is_fallback": true,
      "selection_reason": "Low sugar (1.5g <= 5.0g limit), high fiber (+8.0 pts)"
    }
  ],
  "summary": {
    "total_products": 1,
    "total_spent": 198.0,
    "remaining_budget": 302.0,
    "budget": 500.0,
    "total_calories": 300.0,
    "total_protein": 8.0,
    "products_considered": 45,
    "products_after_filter": 18,
    "health_condition": "diabetic",
    "household_size": 2,
    "allocation_method": "lp",
    "data_mode": "static_catalogue",
    "is_fallback": true,
    "freshness_status": "verified_static_baseline",
    "disclaimer": "NutriKart recommendations apply heuristic nutrient limits to verified food data. Not clinical advice."
  }
}
```

**Response (HTTP 200 - Zero Matches / Low Budget)**:
When no items can be purchased within budget or filters exclude all catalog items:
```json
{
  "recommendations": [],
  "summary": {
    "total_products": 0,
    "total_spent": 0.0,
    "remaining_budget": 10.0,
    "budget": 10.0,
    "total_calories": 0.0,
    "total_protein": 0.0,
    "products_considered": 45,
    "products_after_filter": 0,
    "health_condition": "diabetic",
    "household_size": 1,
    "allocation_method": "lp",
    "data_mode": "static_catalogue",
    "is_fallback": true,
    "freshness_status": "verified_static_baseline",
    "disclaimer": "NutriKart recommendations apply heuristic nutrient limits to verified food data. Not clinical advice."
  }
}
```
*(Replaces the legacy HTTP 404 crash behavior with clean empty states)*.
