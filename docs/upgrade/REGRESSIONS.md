# NutriKart Upgrade 2: Regression Inventory & Journey Audit

**Phase:** Phase 0 — Baseline and regression inventory  
**Target Revision:** `60f0463`  
**Evaluation Dates:** 29 March 2026 – 4 April 2026  

---

## 1. Day 3: Baseline User Journeys & Viewport Audit (31 March 2026)

### 1.1 Journey 1: Catalogue Browsing (`/`)
- **Desktop (1280px)**:
  - Sticky TopBar displaying brand logo, navigation links, and cart badge with item counter.
  - Horizontal filter chips for 9 categories (`Cereals & Breakfast`, `Dairy & Cheese`, `Chips & Crisps`, `Biscuits & Cookies`, `Beverages`, `Protein & Nutrition Bars`, `Grains & Staples`, `Spreads & Jams`, `Frozen & Ready-to-Eat`).
  - 4-column responsive grid rendering `ProductCard` components with image, title, category, price, and "Add to Cart" CTA.
- **Mobile (375px)**:
  - TopBar scales to compact header with mobile drawer toggle.
  - CategoryChips support touch swipe / horizontal scroll.
  - Product grid collapses to a single column with full-width action buttons.
- **Observed Behavior**:
  - Clicking "Add to Cart" successfully increments cart counter and opens `CartDrawer`.
  - Image assets load from CDN; placeholder fallback renders if external URL fails.

### 1.2 Journey 2: Product Detail View (`/product/:id`)
- **Desktop & Mobile**:
  - Displays product image packshot, product title, category badge, and unit price.
  - Structured Nutrition Table renders Calories, Sugar, Sodium, Protein, Total Fat, Saturated Fat, and Fiber.
  - Quantity selector allows direct batch addition to cart.
- **Observed Friction**:
  - `serving_size` renders as a raw decimal (e.g. `38.00`), with no indication whether units are in grams, millilitres, or pieces.
  - Products with null nutrition fields render empty table cells or dashes with no explicit disclosure of unknown status.

### 1.3 Journey 3: Cart Management & PDF Export (`/cart`)
- **Behavior**:
  - Side-drawer (`CartDrawer`) and dedicated page (`/cart`) render synchronized state via `CartContext`.
  - Quantity controls (`+` / `−`) recalculate item subtotals and grand total in real-time.
  - "Export as PDF" generates a client-side document (`NutriKart-Cart.pdf`) using `jspdf` and `jspdf-autotable`.
- **Audit Findings**:
  - PDF export cleanly formats columns: Item, Qty, Unit Price, and Subtotal.
  - Grand total accurately matches UI calculation.

### 1.4 Journey 4: Recommendation Engine Panel (`/cart`)
- **Workflow**:
  - User configures budget (e.g., ₹500), selects a health profile (`Diabetic`, `Hypertension`, `Weight Loss`, or none), and selects household size (1–10).
  - Toggles between Integer Linear Programming (PuLP) and the greedy rule-based allocator.
  - Renders recommended basket items with individual `score100`, allocated quantities, and nutrient sums.
- **Failure Observations**:
  - **Cold Start Latency**: Backend hosted on Render free tier incurs 30–50s spin-up delay on initial wake, during which UI shows a loading spinner.
  - **404 on Empty Match**: When a restrictive condition or low budget produces zero matching products, backend responds with `HTTP 404 Not Found` (`{"detail": "No products match your criteria"}`), causing frontend to display a red network error banner instead of a graceful empty state.

---

## 2. Day 5: Formal Regression Backlog & Acceptance Criteria (2 April 2026)

The following 6 verified issues have been reproduced and cataloged into the regression backlog. Each entry links to automated reproduction tests where applicable.

### REG-01: Incomplete Nutrition Records Bypass Health Constraints
- **Severity**: High (Data Integrity / Safety)
- **Reproduction**: `backend/tests/test_regressions.py::test_reproduce_incomplete_product_bypasses_diabetic_filter`
- **Observed Bug**: In `filter_products`, `if product_value is None: continue` allows products missing sugar, sodium, or saturated fat to pass condition filters.
- **Desired Behavior**: Introduce explicit `UNKNOWN` nutrient states. Products with unknown values for condition-critical limits must not receive a "verified fit" verdict.
- **Acceptance Criteria**: In Phase 2, `filter_products` partitions candidates into `verified_fit`, `unverified_unknown`, and `violates_limit`.

### REG-02: Missing Nutrients Coerced Silently to Measured Zero
- **Severity**: Medium (Data Transparency)
- **Reproduction**: `backend/tests/test_regressions.py::test_reproduce_missing_nutrients_silently_coerced_to_zero`
- **Observed Bug**: `_build_allocation` transforms `product.sugar = None` into `0.0`, masking missing data as zero grams.
- **Desired Behavior**: Pydantic response models and JSON output must preserve `None` / `null` or carry a field-level verification flag.
- **Acceptance Criteria**: Response schema allows `float | None` for macros and does not fabricate measurements.

### REG-03: Serving Size Lacks Measurement Basis & Explicit Units
- **Severity**: Medium (UX / Calculation Correctness)
- **Observed Bug**: `serving_size` is stored as an undifferentiated decimal (e.g. `38.00`, `200.00`). Multiplying pack counts by per-serving values creates incorrect basket nutrient totals.
- **Desired Behavior**: Introduce explicit basis (`per_100g`, `per_100ml`, `per_serving`) and units (`g`, `ml`, `piece`).
- **Acceptance Criteria**: Data schema includes `measurement_basis` and `serving_unit`.

### REG-04: Empty Recommendations Result in HTTP 404 Exception
- **Severity**: Medium (API Contract / UX)
- **Reproduction**: `backend/tests/test_regressions.py::test_reproduce_empty_recommendation_raises_http_404`
- **Observed Bug**: When budget is too low (e.g. ₹10) or filters exclude all items, `/recommend` raises `HTTPException(404)`. Frontend treats this as a broken endpoint.
- **Desired Behavior**: Return `HTTP 200 OK` with `recommendations: []` and descriptive diagnostics in `summary`.
- **Acceptance Criteria**: Frontend renders a friendly empty state ("Try increasing your budget") without network alert banners.

### REG-05: Missing Basket-Level Score in Recommendation Summary
- **Severity**: Low (Feature Completeness)
- **Observed Bug**: `RecommendSummary` includes `total_spent`, `total_calories`, `total_protein`, but no composite basket-level score.
- **Desired Behavior**: Do not render mockup ScoreRing until a defensible basket-level scoring metric is implemented.
- **Acceptance Criteria**: Basket ScoreRing remains hidden in UI until metric contract is finalized.

### REG-06: Frontend Synchronous setState in useEffect & Context Export Warnings
- **Severity**: Low (Code Quality / Fast Refresh)
- **Observed Bug**: ESLint emits 4 issues (cascading render warnings in `Home.jsx` and `Product.jsx`, context export warning in `cartContext.jsx`, `useCallback` warning in `Cart.jsx`).
- **Desired Behavior**: Clean lint run adhering to React 19 standards.
- **Acceptance Criteria**: Remediate component lifecycle effects in Phase 3.

