# Staging Smoke Test and Provider Isolation Report

**Execution Date:** 2026-05-31  
**Environment:** Staging / Local Verification Harness  
**Objective:** Validate read-only catalog offers and ensure strict separation of simulated coverage from observed live coverage.

## 1. Provider Isolation & Authorization Audit

| Mode | Authorization Required | External Traffic | Observed Status | Active Fallback Pathway |
| :--- | :--- | :--- | :--- | :--- |
| **Static** | None (Internal DB) | None | Verified Functional | Primary release baseline |
| **Fixture** | None (Local JSON) | None | Verified Functional | Testing & offline simulation |
| **Live (Swiggy)** | `SWIGGY_PARTNER_API_KEY` | Read-only HTTPS | Blocked (No Key Set) | Clean auto-fallback to Fixture/Static |

## 2. Controlled Smoke Test Scenarios

### Scenario A: Static Baseline (Default Release Mode)
- **Input Query:** `"oats"`
- **Response Count:** 4 verified items returned
- **Offer Sku Prefix:** `static_*`
- **Observation Time:** Attached and verified UTC timestamp
- **Nutrient Match Confidence:** `REVIEWED_VARIANT` (100% matched to verified nutrition tables)

### Scenario B: Offline Fixture Simulation
- **Input Query:** `"atta"`
- **Response Sku:** `instamart_1001`
- **Retailer Name:** `Instamart Local`
- **Barcode Validation:** Exact GTIN `8901030382894` matched to Aashirvaad Sharbati Atta
- **Retained Nutrition Safe:** `True`

### Scenario C: Live Missing Authorization Path
- **Condition:** Empty or unset `SWIGGY_PARTNER_API_KEY`
- **Behavior:** `is_authorized == False`
- **Graceful Degradation:** No unhandled exceptions; returns labelled fallback offers with `source_mode="fixture"` and `retailer_name="Instamart (Offline Fixture)"`.

## 3. Findings & Safety Guarantee

1. Zero unauthorized web scraping or reverse-engineered private endpoints exist in the codebase.
2. Checkout or payment systems are strictly out of scope; the application remains an educational nutritional planning tool.
3. Users are never shown simulated or fixture results masquerading as live verified local inventory.
