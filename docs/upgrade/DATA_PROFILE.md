# NutriKart Upgrade 2: Baseline Data Profile

**Phase:** Phase 0 — Baseline and regression inventory  
**Snapshot Source:** `data/products.csv` (Commit `60f0463`)  
**Audit Date:** 1 April 2026  
**Auditor:** Gemini 3.1 Pro High  

---

## 1. Executive Summary & Inventory Counts

| Metric | Measured Value | Notes / Observations |
|---|---|---|
| **Total Product Records** | **45** | Bounded initial seed catalogue |
| **Total Categories** | **9** | Matches standard grocery taxonomy |
| **Complete Nutrition Records** | **44 (97.8%)** | 44 items contain all 7 macro fields |
| **Incomplete Nutrition Records** | **1 (2.2%)** | Product ID 1 (`Whey Protein`) contains 7 null fields |
| **Duplicate IDs / Names** | **0** | Clean relational integrity |
| **Image URL Coverage** | **45 (100%)** | 44 live Blinkit CDN URLs, 1 placeholder |
| **Serving Size Unit Specification** | **0%** | All 44 serving sizes are bare floats without unit strings |

---

## 2. Category Distribution & Price Ranges

| Category ID | Category Name | Count | Min Price (₹) | Max Price (₹) | Mean Price (₹) |
|---|---|---|---|---|---|
| `1` | Cereals & Breakfast | 6 | 99.00 | 1500.00 | 363.50 |
| `2` | Dairy & Cheese | 7 | 28.00 | 195.00 | 94.71 |
| `3` | Chips & Crisps | 5 | 20.00 | 50.00 | 34.00 |
| `4` | Biscuits & Cookies | 5 | 30.00 | 120.00 | 67.00 |
| `5` | Beverages | 5 | 35.00 | 140.00 | 82.00 |
| `6` | Protein & Nutrition Bars | 4 | 60.00 | 150.00 | 97.50 |
| `7` | Grains & Staples | 5 | 55.00 | 240.00 | 134.00 |
| `8` | Spreads & Jams | 4 | 85.00 | 290.00 | 171.25 |
| `9` | Frozen & Ready-to-Eat | 4 | 110.00 | 250.00 | 182.50 |

---

## 3. Nutrient Completeness & Null Distribution

Field-by-field audit across all 45 products:

```text
Field             Type       Non-Null Count    Null Count    Min       Max       Mean
-------------------------------------------------------------------------------------
id                INTEGER    45 (100%)         0             1         45        23.0
name              STRING     45 (100%)         0             -         -         -
category_id       INTEGER    45 (100%)         0             1         9         4.7
price_per_unit    DECIMAL    45 (100%)         0             20.00     1500.00   140.24
serving_size      DECIMAL    44 (97.8%)        1             15.00     200.00    48.20
calories          DECIMAL    45 (100%)         0             40.00     520.00    212.44
sugar             DECIMAL    44 (97.8%)        1             0.00      45.00     9.45
sodium            DECIMAL    44 (97.8%)        1             0.00      890.00    215.11
protein           DECIMAL    44 (97.8%)        1             0.00      25.00     5.82
fat               DECIMAL    44 (97.8%)        1             0.00      30.00     7.61
saturated_fat     DECIMAL    44 (97.8%)        1             0.00      18.00     2.85
fiber             DECIMAL    44 (97.8%)        1             0.00      12.00     2.91
image_url         STRING     45 (100%)         0             -         -         -
```

---

## 4. Key Gaps & Observations for Upgrade 2

### 4.1 Missing Data Bypass Vulnerability (Product ID 1)
- **Product**: ID 1, `Whey Protein`, ₹1500.00.
- **Null Fields**: `serving_size`, `sugar`, `sodium`, `protein`, `fat`, `saturated_fat`, `fiber`.
- **System Failure**: In `backend/app/recommendation.py` (`filter_products`), the logic executes:
  ```python
  if product_value is None:
      continue  # Don't penalize incomplete data
  ```
  Consequently, `Whey Protein` bypasses the Diabetic filter (which requires `sugar <= 5.0g`) and Hypertension filter (which requires `sodium <= 200mg`), because missing values are treated as non-violations!

### 4.2 Ambiguity in Measurement Basis & Serving Units
- Values in `serving_size` vary widely without units:
  - Solid foods (oats, cookies): `30.00` to `40.00` (implied grams).
  - Liquids (toned milk): `200.00` (implied millilitres).
  - Ready-to-eat / snacks: `15.00` to `50.00`.
- **Recommendation**: Upgrade 2 must add an explicit `measurement_basis` enum (`per_100g`, `per_100ml`, `per_serving`) and structured unit strings (`g`, `ml`, `piece`).

### 4.3 Pack Size Extraction
- Retail pack quantities are currently embedded in the product name (e.g., `"Saffola Classic Masala Instant Oats 225 g"`, `"Amul Taaza Homogenised Toned Milk 1 L"`).
- Pack quantities must be decoupled from serving sizes to prevent naive multiplication when calculating basket-level nutrient totals.
