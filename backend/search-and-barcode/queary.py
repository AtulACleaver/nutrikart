from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import requests

from health_score import compute_health_score

app = FastAPI(title="Nutrikart - Open Food Facts Proxy")

OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"
OFF_PRODUCT_URL = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"


def _extract_first_value(d: dict) -> Optional[str]:
	for _, v in (d or {}).items():
		if isinstance(v, str) and v:
			return v
	return None


def get_image_urls(p: dict) -> tuple[Optional[str], Optional[str]]:
	"""Return (image_url, image_small_url) with sensible fallbacks from OFF product JSON."""
	# Small image candidates
	small_candidates = [
		p.get("image_small_url"),
		p.get("image_front_small_url"),
		p.get("image_thumb_url"),
	]
	# selected_images.front.small.{lang}
	try:
		sel = p.get("selected_images") or {}
		front_small = sel.get("front", {}).get("small", {})
		if isinstance(front_small, dict):
			small_candidates.append(_extract_first_value(front_small))
	except Exception:
		pass

	# Large image candidates
	large_candidates = [
		p.get("image_url"),
		p.get("image_front_url"),
	]
	try:
		sel = p.get("selected_images") or {}
		front_display = sel.get("front", {}).get("display", {})
		if isinstance(front_display, dict):
			large_candidates.append(_extract_first_value(front_display))
	except Exception:
		pass

	small = next((u for u in small_candidates if u), None)
	large = next((u for u in large_candidates if u), None)
	if not large:
		large = small
	return large, small

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
		img_large, img_small = get_image_urls(p)
		simplified.append({
			"id": p.get("id") or p.get("code"),
			"code": p.get("code"),
			"product_name": p.get("product_name", ""),
			"brands": p.get("brands", ""),
			"image_small_url": img_small,
		})
	return simplified


def _extract_ingredients_text(p: dict) -> Optional[str]:
	# Try language-specific first, then generic, then build from list
	for key in ("ingredients_text_en", "ingredients_text"):
		val = p.get(key)
		if isinstance(val, str) and val.strip():
			return val
	# OFF sometimes has a list under "ingredients"
	ing_list = p.get("ingredients")
	if isinstance(ing_list, list):
		parts = []
		for item in ing_list:
			if isinstance(item, dict):
				name = item.get("text") or item.get("id")
				if isinstance(name, str) and name:
					parts.append(name)
		if parts:
			return ", ".join(parts)
	return None


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
	img_large, img_small = get_image_urls(p)
	ingredients_text = _extract_ingredients_text(p) or ""
	return {
		"id": p.get("id") or p.get("code"),
		"code": p.get("code"),
		"product_name": p.get("product_name", ""),
		"brands": p.get("brands", ""),
		"image_url": img_large,
		"image_small_url": img_small,
		"ingredients_text": ingredients_text,
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


# ----- MVP Scan endpoint -----
class ScanRequest(BaseModel):
	barcode: Optional[str] = None


class ScannedProduct(BaseModel):
	id: str
	code: str
	product_name: str
	brands: Optional[str] = None
	image_url: Optional[str] = None
	image_small_url: Optional[str] = None
	nutri_score: Optional[str] = None
	score: int
	reasons: List[str]


@app.post("/scan", response_model=ScannedProduct)
def scan(req: ScanRequest):
	"""Scan by barcode: returns product fields + deterministic health score with reasons."""
	if not req.barcode:
		raise HTTPException(status_code=400, detail="Provide barcode")
	try:
		p = off_get_product(req.barcode)
	except requests.HTTPError as e:
		raise HTTPException(status_code=502, detail=str(e))
	# Compute deterministic score
	ingredients = p.get("ingredients_text", "")
	nutr = p.get("nutriments", {}) or {}
	score, reasons = compute_health_score(ingredients, nutr)
	return {
		**p,
		"score": score,
		"reasons": reasons,
	}

