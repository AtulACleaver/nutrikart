#!/usr/bin/env bash
# Simple script to run the backend FastAPI app from the health-score folder
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Default backend directory
BACKEND_DIR="$ROOT_DIR/search-and-barcode"
cd "$BACKEND_DIR"

# Create venv if missing
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

# Run uvicorn on port 8000 (module: queary.py)
python -m uvicorn queary:app --reload --port 8000
