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
