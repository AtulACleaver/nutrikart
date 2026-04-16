# NutriKart Upgrade 2: Data Permissions & Attribution Register

**Phase Context:** Verified data foundation and access spike  
**Audit Date:** 16 April 2026  
**Auditor:** Compliance & Data Licensing  

---

## 1. Data Source Licensing & Permitted-Use Matrix

| Data Source | Content Type | License / Terms | Attribution Requirement | Permitted Use in NutriKart |
|---|---|---|---|---|
| **Open Food Facts** | Nutritional values, macro tables, ingredient statements | **ODbL (Open Database License)** | *"Data from Open Food Facts, licensed under ODbL"* | Permitted for candidate generation and structured verification. |
| **Manufacturer Packaging (Label OCR)** | Factual nutrition labels, serving sizes, ingredient lists | **Factual Information / FSSAI Public Disclosures** | Reference manufacturer batch / packaging SKU | Permitted for factual product verification; raw packshots must not be redistributed as standalone stock. |
| **Blinkit / Grofers CDN** | Retail packshot images | **Commercial Retailer CDN (Transient)** | Used for mockup demonstration; production uses licensed brand assets | Previews permitted in local development; production deployment must use owned or approved retailer catalog assets. |
| **NutriKart Seed Data** | Baseline categories, scoring weights, heuristic limits | **MIT License (NutriKart Project)** | Standard repo attribution | Fully open and unencumbered. |

---

## 2. Product Discrepancy Audits

### 2.1 Whey Protein (ID 1) Audit
- **Reported Issue**: Missing macro fields, missing serving size, generic placeholder image.
- **Resolution**:
  - The record is formally flagged with `verification_status: "unverified_unknown"` in the database.
  - In Phase 2, `filter_products` will explicitly bar this unverified record from being returned as a "verified fit" for diabetic or hypertension health profiles.
  - Legacy category remains `1` (`Cereals & Breakfast`), earmarked for reassignment to `6` (`Protein & Nutrition Bars`) in Phase 2.

---

## 3. Buffer Audit (17 April 2026)
- **Buffer Status**: **Unused / Reserved**.
- **Audit Outcome**: Data permissions register complete. No licensing blockers prevent proceeding to Gate 2 review.
