# Run instructions — NutriKart (backend + Flutter)

This file explains how to run the backend and the Flutter app during development.

## Backend (FastAPI)

The backend lives in `backend/search-and-barcode` (file: `queary.py`). It exposes endpoints used by the Flutter app:

- `GET /search?query=...&limit=...` — returns product summaries
- `GET /product/{barcode}` — returns detailed product info
- `POST /scan` — returns health score + reasons for a barcode
- Other endpoints: `/recommend/{barcode}`, `/summary`, `/ocr`, `/health-info`

Quick run (macOS / zsh):

```bash
cd 'backend/search-and-barcode'
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run the FastAPI app
python -m uvicorn queary:app --reload --port 8000
```

Alternatively, from the repo root you can run the helper script (it will start the service from `search-and-barcode`):

```bash
cd 'backend'
./run_backend.sh
```

Note: the `queary.py` filename is the current app module. The script runs `uvicorn queary:app`.

## Flutter app

Open the Flutter project at `flutter/nutrikart` in your IDE.

By default the app uses `127.0.0.1:8000` for the API. If you're running on an Android emulator, the host mapping is handled automatically by the Flutter `ApiService` — it will map `127.0.0.1` to `10.0.2.2`.

You can override the API host at build/run time:

- Flutter run with custom host:

```bash
flutter run --dart-define=API_HOST=192.168.0.10
```

- For web, use the machine host or 127.0.0.1 (port 8000 must be reachable).

## End-to-end

1. Start the backend (see instructions above).
2. Run the Flutter app on your device/emulator.
3. Use the Search tab to query products (e.g., "chocolate") and tap a product to view its nutrition and health score.

If you hit CORS errors, ensure the backend is started and that the backend output shows requests; backend `queary.py` enables permissive CORS for development.

## Troubleshooting

- `ModuleNotFoundError: No module named 'fastapi'` — activate venv and `pip install -r requirements.txt`.
- `zsh: command not found: uvicorn` — use `python -m uvicorn queary:app` after installing dependencies.
- On Android emulator, network `localhost` is mapped automatically in the app; for physical devices use your machine IP with `--dart-define=API_HOST=<your-ip>`.

If you want, I can:
- Rename backend folder to `health_score` for correct module imports from repo root.
- Add a Dockerfile to run the backend in a container.
- Add a GitHub Action to run tests.
