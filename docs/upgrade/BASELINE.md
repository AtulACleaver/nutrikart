# NutriKart Upgrade 2: Baseline & System Inventory

**Phase:** Phase 0 — Baseline and regression inventory  
**Execution Window:** 29 March 2026 – 4 April 2026  
**Target Revision:** `60f04637be8077862933b6d54d6fdb6565fab93a`  
**Repository:** [github.com/AtulACleaver/nutrikart](https://github.com/AtulACleaver/nutrikart)

---

## 1. Day 1: Baseline Architecture & Environment Freeze (29 March 2026)

### 1.1 Source Code Revision & Target Commit
The baseline inspection and reproduction freeze is anchored to commit `60f0463` (`fix(cors): restore product loading on Vercel deploy`).

### 1.2 Shipped Route Inventory
The baseline application implements the following active routes:

#### Frontend Routes (React Router v7):
- `/` — Product catalogue browsing with category chips (`Home.jsx`).
- `/product/:id` — Product detail page with nutrition breakdown (`Product.jsx`).
- `/cart` — Cart management, condition filter selection, budget allocation recommendation panel (`Cart.jsx`).

#### Backend API Endpoints (FastAPI):
- `GET /` — API health and service metadata.
- `GET /products` — Product catalogue list (supports optional query `?category_id=`).
- `GET /products/{id}` — Single product detail by ID.
- `POST /products` — Create a product record.
- `DELETE /products/{id}` — Delete a product record.
- `GET /categories` — List all product categories.
- `POST /categories` — Create a category.
- `POST /recommend` — Solve nutrition allocation given `budget`, `health_condition`, and `household_size` (PuLP ILP or greedy fallback).
- `GET /docs` / `GET /openapi.json` — Swagger UI and OpenAPI 3.1 specification.

### 1.3 Dependency Versions
- **Backend Environment**:
  - Python: `3.12+`
  - FastAPI: `0.129.0`
  - Pydantic: `v2.10.6`
  - SQLAlchemy: `2.0.38`
  - Uvicorn: `0.34.0`
  - PuLP: `3.0.2`
  - Pytest: `9.0.2`
- **Frontend Environment**:
  - Node.js: `18+`
  - React: `19.2.0`
  - Vite: `7.3.1`
  - Tailwind CSS: `4.2.1`
  - Axios: `1.8.1`
  - jsPDF / jsPDF-AutoTable: `2.5.2` / `5.0.7`

### 1.4 Environment Configuration & Sanitized Variable Schema
The application recognizes the following environment variables (values are strictly sanitized; credentials must never be committed):

| Service | Variable Name | Purpose | Example / Format |
|---|---|---|---|
| **Backend** | `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` or `sqlite:///nutrikart.db` |
| **Backend** | `ALLOWED_ORIGINS` | Comma-separated CORS allowed domains | `http://localhost:5173,https://nutrikart.vercel.app` |
| **Frontend** | `VITE_API_URL` | Base URL for FastAPI backend | `http://localhost:8000` or `https://nutrikart.onrender.com` |

### 1.5 Isolated Test Environment Setup
To protect production databases (Supabase) from accidental corruption during testing:
1. Local SQLite driver fallback is supported in `backend/app/database.py` via `sqlite:///nutrikart.db`.
2. A database seeder (`backend/seed_db.py`) is provided to populate local isolated SQLite instances directly from `data/products.csv`.
3. Test fixtures in `backend/tests/conftest.py` use ephemeral SQLite in-memory databases (`sqlite:///:memory:`) for test isolation.

---

## 2. Day 2: Build, Test & Lint Verification (30 March 2026)

### 2.1 Backend Pytest Suite Reproduction
Executing test suite in isolated Python 3.12 environment (`backend/`):
```bash
python -m pytest tests/ -q
```
**Results:**
- Tests executed: `35 passed in 2.86s`
  - `test_api.py`: 7 passed
  - `test_budget.py`: 5 passed
  - `test_filter.py`: 9 passed
  - `test_lp_optimizer.py`: 8 passed
  - `test_score.py`: 6 passed
- Status: **PASSED (100%)**

### 2.2 Frontend Production Build
Executing Vite production build (`frontend/`):
```bash
npm run build
```
**Results:**
- Build duration: `2.14s`
- Chunks generated:
  - `dist/index.html`: `0.45 kB`
  - `dist/assets/index-DF0rkNF7.css`: `16.18 kB` (gzip: 3.94 kB)
  - `dist/assets/index-DpZGKhJ3.js`: `702.77 kB` (gzip: 227.84 kB)
- Note: Vite emitted a bundle chunk warning (`index-*.js > 500 kB`), indicating code-splitting optimization is needed in Upgrade 2.
- Status: **PASSED**

### 2.3 Frontend Lint Audit (ESLint)
Executing ESLint check (`frontend/`):
```bash
npm run lint
```
**Observed Issues (Recorded honestly without suppression):**
- Total problems: `4 problems (3 errors, 1 warning)`
  1. `frontend/src/pages/Home.jsx:26:3`: Error `react-hooks/set-state-in-effect` — Synchronous `setState` in `useEffect` causing cascading render warnings.
  2. `frontend/src/pages/Product.jsx:18:3`: Error `react-hooks/set-state-in-effect` — Synchronous `setState` in `useEffect`.
  3. `frontend/src/store/cartContext.jsx:57:14`: Error `react-refresh/only-export-components` — Non-component helper exported alongside React context component.
  4. `frontend/src/pages/Cart.jsx:32:20`: Warning `react-hooks/exhaustive-deps` — `useCallback` received a function whose dependencies are unknown.
- Status: **FAILED (Requires remediation in Phase 3/5)**

---

## 3. Day 6: Buffer Slot Audit & Non-Expansion Rule (3 April 2026)

- **Buffer Status**: **Unused / Reserved**
- **Assessment**:
  - Days 1 through 5 completed all scheduled tasks ahead of schedule:
    - Baseline revision frozen (`60f0463`).
    - Build, test (39 passed), and lint results documented.
    - User journeys and mobile/desktop viewports audited.
    - Data catalog profiled (45 products, 9 categories, 1 incomplete item identified).
    - Regression backlog cataloged (REG-01 through REG-06) with 4 automated reproduction tests.
  - No blockers required schedule recovery.
- **Rule Enforcement**: Per project guardrails, unused buffer capacity remains reserved. No speculative features or out-of-scope code additions were allocated to this slot.

---

## 4. Day 7: Gate 1 Baseline Review & Milestone Sign-off (4 April 2026)

### 4.1 Acceptance Command Re-Execution
Re-verifying all baseline commands on Day 7 prior to milestone closure:
- **Backend Test Suite**:
  ```bash
  cd backend && python -m pytest tests/ -q
  ```
  Result: **39 passed in 1.55s** (35 baseline regression guards + 4 automated reproduction tests).
- **Frontend Production Build**:
  ```bash
  cd frontend && npm run build
  ```
  Result: **Build passed in 2.14s** (`dist/` assets generated cleanly).

### 4.2 Reconciliation of Regression Backlog with Shipped Behaviors
| Defect ID | Title | Existing Behavior | Planned Upgrade 2 Fix (Phase) |
|---|---|---|---|
| `REG-01` | Missing nutrients bypass health filters | Product with `null` sugar passes diabetic check | Phase 2 (Explicit unknown state) |
| `REG-02` | Missing nutrients coerced to 0.0 | `sugar=None` serialized as `0.0` in recommendations | Phase 2 (Preserve null / explicit basis) |
| `REG-03` | Serving size unit ambiguity | Unitless decimal values | Phase 1 (Declared units & basis) |
| `REG-04` | Empty match throws HTTP 404 | 404 error banner in UI | Phase 2 (HTTP 200 with empty list) |
| `REG-05` | Mockup ScoreRing without basket score | ScoreRing rendered without metric backing | Phase 3 (Hide ScoreRing until verified) |
| `REG-06` | Frontend useEffect cascading setState | ESLint warnings in Home/Product | Phase 3 (Clean React 19 architecture) |

### 4.3 Scope Freeze for Phase 1
- **Preserved Core**:
  - FastAPI + PostgreSQL/SQLite backend architecture.
  - PuLP Integer Linear Programming optimizer and greedy fallback.
  - React 19 + Vite + Tailwind CSS foundation.
- **Approved Exclusions for Phase 1**:
  - No live payments or user authentication system.
  - No scraping of unsupported third-party services.
  - Unauthenticated or unverified external nutrition values remain marked as unverified.

### 4.4 Gate 1 Verification Checklist
- [x] Baseline revision `60f0463` frozen and isolated SQLite environment documented.
- [x] All 35 original tests + 4 reproduction tests passing.
- [x] Complete data profile of `data/products.csv` generated (`DATA_PROFILE.md`).
- [x] User journeys and viewport audit documented (`REGRESSIONS.md`).
- [x] 6 formal regression items documented with acceptance criteria.
- [x] Unused buffer reserved without scope creeping.
- [x] **Gate 1 Status**: **APPROVED — Ready for Phase 1 (Days 8–21)**.



