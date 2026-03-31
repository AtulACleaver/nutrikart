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
