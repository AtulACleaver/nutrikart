#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo " Starting NutriKart Local Development Stack"
echo "=========================================="

cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend
echo "[1/2] Launching FastAPI backend on http://127.0.0.1:8000..."
cd "$ROOT_DIR/backend"
if [ -d "venv" ]; then
    ./venv/bin/uvicorn app.main:app --reload --port 8000 &
else
    uvicorn app.main:app --reload --port 8000 &
fi

# Start frontend
echo "[2/2] Launching Vite frontend on http://localhost:5173..."
cd "$ROOT_DIR/frontend"
npm run dev &

wait
