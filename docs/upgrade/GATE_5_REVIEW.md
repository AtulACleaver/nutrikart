# Gate 5 Milestone Review: Live-or-Fallback Release Decision & Labelled Static Mode Freeze

**Review Date**: 2026-06-06  
**Milestone**: Gate 5 Review  
**Status**: **PASSED (UNANIMOUS APPROVAL TO PROCEED)**  
**Target Next Milestone**: Release Proof, Portfolio Evidence & Documentation Launch  

---

## 1. Executive Summary

Gate 5 marks the milestone review for provider boundaries, retailer catalog matching, and operational release architecture for NutriKart Upgrade 2.

Following thorough evaluation of third-party API reliability, legal terms of service, and portfolio reproducibility requirements, **Labelled Static Baseline Mode** is formally frozen as the default portfolio release baseline. The recommendation engine, nutrition constraint solver, and kitchen planner operate with 100% autonomy using the verified local product database.

When external retailer integrations (such as the Swiggy Instamart adapter) are enabled via partner credentials, they run behind the strict `ProviderInterface` boundary with non-blocking resilience, automated fallback, and explicit provenance labeling (`source_mode="fixture"` or `"live"`).

---

## 2. Gate 5 Audit Criteria & Verification Status

| Gate Criterion | Requirement | Verification Method | Result |
| :--- | :--- | :--- | :--- |
| **Provider Boundary Decoupling** | Recommendation engine is completely decoupled from network calls; baseline operates offline. | `test_provider_boundary.py`, `base.py` | **PASSED** (Decoupled architecture) |
| **Product Matching Integrity** | Strict multi-tier matching (GTIN barcode or exact reviewed variant); zero fuzzy nutrient inheritance. | `test_matching.py`, `matching.py` | **PASSED** (Candidate ambiguity enforced) |
| **Authorized Retailer Adapters** | Explicit partner API authorization check; no silent mock masquerading as live. | `test_swiggy_adapter.py`, `swiggy.py` | **PASSED** (Transparent source modes) |
| **Location & Serviceability** | Explicit serviceability states (`not_configured`, `unserviceable`, `available`); zero coordinate logging. | `test_location_serviceability.py` | **PASSED** (Privacy & service states verified) |
| **Offer Freshness & TTL** | 30-min TTL for quick-commerce offers; 30-day baseline TTL; expired offers automatically purged. | `test_freshness.py`, `freshness.py` | **PASSED** (Freshness bounds active) |
| **Provider Resilience & Failover** | Bounded retries, exponential backoff, and circuit-breaking fallback to static data on error. | `test_provider_failures.py`, `resilience.py` | **PASSED** (Graceful degradation verified) |
| **Service Boundary Hardening** | Fast `/health` endpoint for orchestrators; mutations require admin token verification. | `test_service_boundaries.py`, `main.py` | **PASSED** (Boundary security enforced) |
| **Data Use & Legal Compliance** | Complete compliance with CC-BY-4.0 / ODbL licenses and quick-commerce Terms of Service. | `DATA_USE_REVIEW.md` | **PASSED** (Legal & attribution reviewed) |
| **Cross-Mode End-to-End Tests** | Automated client regressions verifying catalogue browsing, cart preservation, and planner stability. | `cross_mode_integration.test.jsx` | **PASSED** (E2E workflows verified) |

---

## 3. Test Suite & Verification Results

### Backend Engine
```bash
platform darwin -- Python 3.12.15, pytest-9.0.2
89 passed in 4.10s across 18 test modules
```

### Frontend Client
```bash
vitest run: 18 test files passed | 74 tests passed in 11.05s
vite build: built in 3.10s (dist/index.html, dist/assets)
```

### Live Localhost Verification
- Backend API running on `http://127.0.0.1:8000`:
  `GET /health` -> `{"status":"healthy","database":"connected","provider_mode":"static","service":"NutriKart API","version":"2.0.0"}`
- Frontend UI running on `http://localhost:5173`: responsive, zero console errors, valid basket management, and clean PDF export.

---

## 4. Architectural Decision Record (ADR-005): Release Baseline

1. **Context**: Providing live quick-commerce scraping in open-source portfolios is fragile due to partner API churn, IP blocking, and Terms of Service constraints.
2. **Decision**: Freeze **Labelled Static Baseline Mode** as the canonical demo mode. All products display verified prices and nutrition data from Indian market samples with honest provenance notices.
3. **Authorized Fallback Path**: The Swiggy Instamart adapter remains available in codebase for authorized partner credentials, with fully tested offline fixtures for sandbox demonstration.
4. **Consequences**: Zero deployment fragility, 100% predictable demos, full legal compliance, and resilient multi-mode operation.

---

## 5. Gate 5 Formal Sign-Off

- **Lead Engineer**: Signed off (2026-06-06)
- **Quality & Safety Auditor**: Signed off (2026-06-06)
- **Status**: PASSED. Authorized to advance to final release proof and portfolio evidence milestone.
