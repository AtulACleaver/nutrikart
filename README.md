# NutriKart

NutriKart is a small demo app that integrates with Open Food Facts to search products, inspect nutrition facts, compute a simple health score, and recommend healthier alternatives. This repository contains a FastAPI backend and a Flutter front-end.

Repository layout (high level):

- backend/
  - search-and-barcode/queary.py — FastAPI backend (Open Food Facts proxy + analysis)
  - heathscore/ — health score helpers
  - run_backend.sh — helper script to start the backend
- flutter/nutrikart — Flutter app (Riverpod, GoRouter)

The Flutter app uses `lib/services/api_service.dart` to call the backend (default: http://127.0.0.1:8000).

---

## Backend — quick run & endpoints

Location: `backend/search-and-barcode/queary.py` (module name `queary`)

Development endpoints:

- GET /search?query=...&limit=... — search Open Food Facts and return simplified product summaries
- GET /product/{barcode} — product details (nutriments, images, ingredients, nutri_score)
- POST /scan — compute health score and reasons for a barcode
- GET /recommend/{barcode}?limit=3 — recommend healthier alternatives
- POST /summary — analyze a grocery list
- POST /ocr — upload nutrition label image (currently mocked)
- GET /health-info — general health tips and ranges

CORS for development: `allow_origins=["*"]` (adjust in production)

Run locally (macOS / zsh):

```bash
cd 'backend/search-and-barcode'
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run the FastAPI app
python -m uvicorn queary:app --reload --port 8000
```

Or from repo root using the helper script (it starts the app from `search-and-barcode`):

```bash
cd backend
./run_backend.sh
```

Notes:
- The backend module is named `queary.py`. If you prefer running from repo root with dotted module paths, consider renaming the folder to avoid hyphens (e.g., `search_and_barcode`).
- If port 8000 is in use, either stop the process or change the port using `--port`.

---

## Flutter app — run & host mapping

Location: `flutter/nutrikart`

The Flutter front-end expects the backend at port 8000. The `ApiService` in `lib/services/api_service.dart`:

- Defaults to `127.0.0.1:8000` for desktop/iOS.
- Maps `127.0.0.1` -> `10.0.2.2` automatically on Android emulators.
- Allows overriding the host at build/run time using `--dart-define=API_HOST=<host>`.

Run examples:

- Android emulator (localhost mapping handled automatically):

```bash
cd flutter/nutrikart
flutter run
```

- Physical device (use host machine IP):

```bash
cd flutter/nutrikart
flutter run --dart-define=API_HOST=192.168.0.10
```

- Web (ensure backend reachable from browser):

```bash
flutter run -d chrome --dart-define=API_HOST=127.0.0.1
```

Quick test flow:
1. Start backend (see above)
2. Run Flutter app on emulator/device
3. Search for a term (e.g., "chocolate") in the Search tab
4. Tap a product card to open Product Detail (calls `/product/{code}` and `/scan`)

---

## Integration pointers (how UI talks to backend)

- `SearchPage` calls `apiService.searchProducts(query)` and renders `ProductSummary` cards.
- Tapping a product uses GoRouter to navigate to `/product/{code}`; `ProductDescriptionView` calls `apiService.getProduct(code)` and `apiService.scanProduct(code)` to fetch details and health score.
- `ApiService` (`flutter/nutrikart/lib/services/api_service.dart`) mirrors the backend endpoints and maps JSON into UI models used across the app.

