# Nutrikart - Open Food Facts Proxy

Simple FastAPI app that proxies Open Food Facts to provide:

- GET /search?query=term&limit=5  -> returns up to 5 matching products
- GET /product/{barcode} -> returns product details including nutriments and nutri-score

Run locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn health:app --reload --port 8000
```

Try:

- http://127.0.0.1:8000/search?query=chocolate
- http://127.0.0.1:8000/product/737628064502
