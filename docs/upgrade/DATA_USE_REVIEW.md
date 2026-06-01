# Nutrition Data Use, Licensing & Retailer Compliance Register

**Review Date:** 2026-06-01  
**Scope:** Open Food Facts Database, Product Brand Packaging, Retailer Pricing Feeds  
**Status:** Approved for Static-First and Authorized Fallback Release

---

## 1. Open Food Facts Database Compliance

NutriKart incorporates food items cross-referenced against the Open Food Facts (OFF) database.

- **License:** Open Database License (ODbL) 1.0.
- **Attribution Obligation:** Any public display of data or derivative databases derived from Open Food Facts must prominently credit the database.
- **Implementation in NutriKart:**
  1. Product detail pages display source provenance badges (`source_type: open_food_facts`, with corresponding OFF barcode/record ID).
  2. Public export documents (Shopping list PDF) include the mandatory credit:  
     *"Nutritional data sourced in part from Open Food Facts under the Open Database License (ODbL)."*
  3. No proprietary lock-in: Database schemas remain standard and reproducible.

---

## 2. Manufacturer Pack Information & Nutritional Facts

- **Nature of Data:** Factual nutritional tables (energy, protein, carbohydrates, fats, sodium) and ingredient lists printed on physical retail packaging in India under FSSAI regulations.
- **Legal Characterization:** Under Indian and international copyright law, raw factual information and quantitative dietary measurements are non-copyrightable facts.
- **Attribution & Fair Reference:**
  - Product names and brand identifiers (e.g., *Amul*, *Tata Sampann*, *Aashirvaad*, *Saffola*) are used purely nominatively to inform consumers of the specific item evaluated.
  - NutriKart does not claim endorsement by, affiliation with, or sponsorship from any food manufacturer.
  - Image assets are limited to clean product pack renderings for identification purposes.

---

## 3. Retailer Data & Swiggy Instamart Policy Review

- **Commercial Intent:** Educational dietary planning tool; non-monetized portfolio implementation.
- **Retention & Stockpiling Limits:**
  - Bulk harvesting, competitive price scraping, or perpetual archival of live retailer pricing feeds is strictly prohibited.
  - Offer caching is capped at a strict 30-minute in-memory TTL (`RETENTION_TTL_MINUTES[LIVE] = 30`).
  - No retailer customer records or private shopper tokens are ever captured or stored.
- **Fallback Rule:**
  - If official partner credentials are not actively configured, live network calls are halted.
  - The application automatically reverts to curated, labelled reference baselines.

---

## 4. Privacy & End-User Safety

- **Personal Data (PII):** Zero account registration or personal names required to use the planner.
- **Location Data:** User-provided delivery localities or pincodes are processed in memory and never written to backend persistent database tables.
- **Medical Disclaimer:** Visible on every page, planning form, and PDF export:  
  *"NutriKart is an educational planning tool designed to support everyday grocery decisions. It does not provide medical diagnoses or clinical advice."*
