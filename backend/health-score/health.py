
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
import requests

app = FastAPI(title="Nutrikart - Open Food Facts Proxy")

OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"
OFF_PRODUCT_URL = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"


def off_search(query: str, page_size: int = 5) -> List[dict]:
	"""Search Open Food Facts for products matching query and return simplified list."""
	params = {
		"search_terms": query,
		"search_simple": 1,
		"action": "process",
		"page_size": page_size,
		"json": 1,
	}
	resp = requests.get(OFF_SEARCH_URL, params=params, timeout=10)
	resp.raise_for_status()
	data = resp.json()
	products = data.get("products", [])
	simplified = []
	for p in products[:page_size]:
		simplified.append({
			"id": p.get("id") or p.get("code"),
			"code": p.get("code"),
			"product_name": p.get("product_name", ""),
			"brands": p.get("brands", ""),
			"image_small_url": p.get("image_small_url"),
		})
	return simplified


def off_get_product(barcode: str) -> dict:
	"""Get product details from Open Food Facts by barcode/id."""
	url = OFF_PRODUCT_URL.format(barcode=barcode)
	resp = requests.get(url, timeout=10)
	resp.raise_for_status()
	data = resp.json()
	if data.get("status") != 1:
		raise HTTPException(status_code=404, detail="Product not found")
	p = data.get("product", {})
	nutriments = p.get("nutriments", {})
	nutri_score = p.get("nutriscore_grade") or p.get("nutrition_grade_fr")
	return {
		"id": p.get("id") or p.get("code"),
		"code": p.get("code"),
		"product_name": p.get("product_name", ""),
		"brands": p.get("brands", ""),
		"nutriments": nutriments,
		"nutri_score": nutri_score,
	}


@app.get("/search")
def search(query: str = Query(..., min_length=1), limit: int = Query(5, ge=1, le=20)):
	"""Return a list of products matching `query`. Default 5 results."""
	try:
		results = off_search(query, page_size=limit)
	except requests.HTTPError as e:
		raise HTTPException(status_code=502, detail=str(e))
	return {"query": query, "count": len(results), "products": results}


@app.get("/product/{barcode}")
def product(barcode: str):
	"""Return nutrition info and nutri-score for the given product code/barcode."""
	try:
		p = off_get_product(barcode)
	except requests.HTTPError as e:
		raise HTTPException(status_code=502, detail=str(e))
	return p

