# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- This repo currently contains a Python FastAPI microservice in backend/search-and-barcode that proxies the Open Food Facts API.
- Endpoints:
  - GET /search?query=term&limit=5 — returns up to limit simplified products
  - GET /product/{barcode} — returns product details (nutriments, nutri-score)
- There is a placeholder directory backend/health-score with no Python source at the moment.

Common development commands

Environment setup (per-service)
- Create and activate a virtualenv, then install dependencies:
  ```bash
  cd backend/search-and-barcode
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  ```

Run the API locally
- From backend/search-and-barcode, start Uvicorn against the FastAPI app defined in queary.py:
  ```bash
  cd backend/search-and-barcode
  source .venv/bin/activate
  uvicorn queary:app --reload --port 8000
  ```
- Try endpoints:
  - http://127.0.0.1:8000/search?query=chocolate
  - http://127.0.0.1:8000/product/737628064502

Testing
- Run all tests for this service:
  ```bash
  cd backend/search-and-barcode
  source .venv/bin/activate
  pytest -q
  ```
- Run a single test case:
  ```bash
  # from repo root
  pytest backend/search-and-barcode/tests/test_health.py::test_product_monkeypatch -q
  # or filter by keyword
  pytest backend/search-and-barcode -k "search_monkeypatch" -q
  ```

Linting / formatting
- No linter or formatter configuration is present in this repository (e.g., no ruff/flake8/black config). If you intend to add one, prefer project-local config files and update this WARP.md accordingly.

High-level architecture
- Service: backend/search-and-barcode
  - Framework: FastAPI (served via Uvicorn)
  - External dependency: Open Food Facts (world.openfoodfacts.org)
  - Core file: queary.py
    - off_search(query, page_size=5): calls OFF search endpoint, returns simplified items (id/code, product_name, brands, image_small_url)
    - off_get_product(barcode): calls OFF product endpoint, returns product fields plus nutriments and nutri-score
    - Routes:
      - GET /search → wraps off_search and returns { query, count, products }
      - GET /product/{barcode} → wraps off_get_product and returns the product payload
  - Tests: backend/search-and-barcode/tests/test_health.py
    - Use pytest with monkeypatch to stub requests.get
    - Instantiate TestClient against the app loaded from a local module path

Notes and quirks
- Module import vs directory name: The directory name contains a hyphen (search-and-barcode), which is not importable as a Python package path. Run server and tests from within backend/search-and-barcode (or manage PYTHONPATH accordingly) so module imports by file path work.
- README discrepancy: The service README shows uvicorn health:app; the app currently lives in queary.py as app. Use uvicorn queary:app unless a health.py is added.
