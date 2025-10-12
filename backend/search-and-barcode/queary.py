from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import random
from statistics import mean
import base64

from health_score import compute_health_score

app = FastAPI(
    title="Nutrikart - Open Food Facts Proxy",
    description="Backend API for NutriKart nutrition analysis app",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# ----- Recommend Endpoint -----
class RecommendationResponse(BaseModel):
	original_product: ScannedProduct
	recommendations: List[ScannedProduct]
	message: str


@app.get("/recommend/{barcode}", response_model=RecommendationResponse)
def recommend_alternatives(barcode: str, limit: int = Query(3, ge=1, le=10)):
	"""Get product recommendations based on health score and category."""
	try:
		# Get the original product
		original_product_data = off_get_product(barcode)
		ingredients = original_product_data.get("ingredients_text", "")
		nutr = original_product_data.get("nutriments", {}) or {}
		original_score, original_reasons = compute_health_score(ingredients, nutr)
		original_product = {
			**original_product_data,
			"score": original_score,
			"reasons": original_reasons,
		}
	
		# Search for similar products (simplified approach)
		product_name = original_product_data.get("product_name", "")
		brands = original_product_data.get("brands", "")
		
		# Extract category/type keywords for better search
		search_terms = []
		if product_name:
			words = product_name.lower().split()
			# Common food categories
			food_keywords = ['chocolate', 'cereal', 'yogurt', 'milk', 'cheese', 'bread', 'pasta', 'juice', 'cookies', 'snacks']
			for word in words:
				if any(keyword in word for keyword in food_keywords):
					search_terms.append(word)
		
		if not search_terms and product_name:
			# Fallback to first word of product name
			search_terms = [product_name.split()[0].lower()]
		
		recommendations = []
		for search_term in search_terms[:2]:  # Limit search terms
			try:
				results = off_search(search_term, page_size=10)
				for result in results:
					if result.get("code") != barcode:  # Don't recommend the same product
						try:
							alt_product = off_get_product(result.get("code"))
							alt_ingredients = alt_product.get("ingredients_text", "")
							alt_nutr = alt_product.get("nutriments", {}) or {}
							alt_score, alt_reasons = compute_health_score(alt_ingredients, alt_nutr)
							
							# Only recommend products with better health scores
							if alt_score > original_score:
								recommendations.append({
									**alt_product,
									"score": alt_score,
									"reasons": alt_reasons,
								})
								if len(recommendations) >= limit:
									break
						except:
							continue  # Skip products that can't be processed
				if len(recommendations) >= limit:
					break
			except:
				continue
	
		# Sort by health score (best first)
		recommendations.sort(key=lambda x: x["score"], reverse=True)
		recommendations = recommendations[:limit]
	
		# Generate recommendation message
		if recommendations:
			best_alt_score = recommendations[0]["score"]
			improvement = best_alt_score - original_score
			message = f"Found {len(recommendations)} healthier alternatives! Best option improves health score by {improvement} points."
		else:
			message = "No healthier alternatives found in the same category."
	
		return {
			"original_product": original_product,
			"recommendations": recommendations,
			"message": message
		}
	
	except requests.HTTPError as e:
		raise HTTPException(status_code=502, detail=str(e))


# ----- Summary Endpoint -----
class GroceryItem(BaseModel):
	barcode: str
	quantity: Optional[int] = 1


class GrocerySummaryRequest(BaseModel):
	items: List[GroceryItem]
	budget: Optional[float] = None


class GrocerySummary(BaseModel):
	total_items: int
	average_health_score: float
	health_grade: str  # A, B, C, D, F based on average score
	total_estimated_cost: Optional[float] = None
	nutrition_breakdown: dict
	health_insights: List[str]
	cost_savings_suggestions: List[str]


@app.post("/summary", response_model=GrocerySummary)
def grocery_summary(req: GrocerySummaryRequest):
	"""Analyze a grocery list and provide health and cost insights."""
	if not req.items:
		raise HTTPException(status_code=400, detail="Grocery list is empty")
	
	products = []
	scores = []
	nutrition_totals = {
		"calories": 0,
		"protein": 0,
		"carbs": 0,
		"fat": 0,
		"fiber": 0,
		"sugar": 0,
		"sodium": 0
	}
	
	total_estimated_cost = 0.0
	
	for item in req.items:
		try:
			p = off_get_product(item.barcode)
			ingredients = p.get("ingredients_text", "")
			nutr = p.get("nutriments", {}) or {}
			score, reasons = compute_health_score(ingredients, nutr)
			
			products.append({
				**p,
				"score": score,
				"reasons": reasons,
				"quantity": item.quantity
			})
			scores.append(score)
			
			# Aggregate nutrition (per 100g * estimated serving size)
			quantity = item.quantity or 1
			serving_factor = quantity * 0.5  # Assume 50g average serving
			
			nutrition_totals["calories"] += nutr.get("energy-kcal_100g", 0) * serving_factor
			nutrition_totals["protein"] += nutr.get("proteins_100g", 0) * serving_factor
			nutrition_totals["carbs"] += nutr.get("carbohydrates_100g", 0) * serving_factor
			nutrition_totals["fat"] += nutr.get("fat_100g", 0) * serving_factor
			nutrition_totals["fiber"] += nutr.get("fiber_100g", 0) * serving_factor
			nutrition_totals["sugar"] += nutr.get("sugars_100g", 0) * serving_factor
			nutrition_totals["sodium"] += nutr.get("sodium_100g", 0) * 1000 * serving_factor  # Convert to mg
			
			# Estimate cost (mock data - in real app, would use price database)
			base_cost = random.uniform(50, 500)  # ₹50-500 per item
			total_estimated_cost += base_cost * quantity
			
		except:
			continue  # Skip products that can't be processed
	
	if not scores:
		raise HTTPException(status_code=404, detail="No valid products found in grocery list")
	
	average_score = mean(scores)
	
	# Assign health grade
	if average_score >= 80:
		health_grade = "A"
	elif average_score >= 70:
		health_grade = "B"
	elif average_score >= 60:
		health_grade = "C"
	elif average_score >= 50:
		health_grade = "D"
	else:
		health_grade = "F"
	
	# Generate health insights
	health_insights = []
	if average_score >= 75:
		health_insights.append("Great job! Your grocery list has a high health score.")
	elif average_score >= 60:
		health_insights.append("Good choices overall, but there's room for improvement.")
	else:
		health_insights.append("Consider swapping some items for healthier alternatives.")
	
	if nutrition_totals["fiber"] < 25:
		health_insights.append("Add more fiber-rich foods like whole grains and vegetables.")
	if nutrition_totals["sugar"] > 50:
		health_insights.append("Your list is high in sugar. Consider reducing sugary snacks.")
	if nutrition_totals["sodium"] > 2000:
		health_insights.append("High sodium content detected. Look for low-sodium alternatives.")
	
	# Generate cost savings suggestions
	cost_savings = []
	if req.budget and total_estimated_cost > req.budget:
		overrun = total_estimated_cost - req.budget
		cost_savings.append(f"You're ₹{overrun:.0f} over budget. Consider store brands or bulk buying.")
	
	# Find expensive low-health items
	low_health_expensive = [p for p in products if p["score"] < 60]
	if low_health_expensive:
		cost_savings.append("Replace low-health score items with healthier alternatives to improve both health and value.")
	
	return {
		"total_items": len(products),
		"average_health_score": round(average_score, 1),
		"health_grade": health_grade,
		"total_estimated_cost": round(total_estimated_cost, 2) if total_estimated_cost > 0 else None,
		"nutrition_breakdown": {
			"calories": round(nutrition_totals["calories"], 1),
			"protein_g": round(nutrition_totals["protein"], 1),
			"carbs_g": round(nutrition_totals["carbs"], 1),
			"fat_g": round(nutrition_totals["fat"], 1),
			"fiber_g": round(nutrition_totals["fiber"], 1),
			"sugar_g": round(nutrition_totals["sugar"], 1),
			"sodium_mg": round(nutrition_totals["sodium"], 1)
		},
		"health_insights": health_insights,
		"cost_savings_suggestions": cost_savings
	}


# ----- OCR Endpoint -----
class OCRResponse(BaseModel):
	nutrition_facts: dict
	health_score: int
	reasons: List[str]
	confidence: str
	raw_text: Optional[str] = None


@app.post("/ocr", response_model=OCRResponse)
async def extract_nutrition_from_image(file: UploadFile = File(...)):
	"""Extract nutrition facts from uploaded nutrition label image using OCR."""
	
	if not file.content_type.startswith("image/"):
		raise HTTPException(status_code=400, detail="File must be an image")
	
	try:
		# Read image file
		image_data = await file.read()
		
		# TODO: Replace with actual GPT-4o Vision API call
		# For now, return mock nutrition data
		# In production, you would:
		# 1. Convert image to base64
		# 2. Send to OpenAI GPT-4o Vision API with OCR prompt
		# 3. Parse the response to extract nutrition values
		
		# Mock extracted nutrition facts (replace with actual OCR)
		mock_nutrition = {
			"energy-kcal_100g": 250,
			"proteins_100g": 8.5,
			"carbohydrates_100g": 45.0,
			"sugars_100g": 12.0,
			"fat_100g": 8.0,
			"saturated-fat_100g": 4.0,
			"fiber_100g": 3.5,
			"sodium_100g": 0.8,
			"salt_100g": 2.0
		}
		
		# Calculate health score using existing algorithm
		score, reasons = compute_health_score("", mock_nutrition)
		
		return {
			"nutrition_facts": mock_nutrition,
			"health_score": score,
			"reasons": reasons,
			"confidence": "high",  # Mock confidence
			"raw_text": "Mock OCR text - replace with actual GPT-4o output"
		}
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


# ----- Health Information Endpoint -----
@app.get("/health-info")
def get_health_info():
	"""Get general health and nutrition information for the app."""
	return {
		"nutrition_guidelines": {
			"daily_calories": "2000 kcal for average adult",
			"daily_protein": "50-60g per day",
			"daily_fiber": "25-30g per day",
			"daily_sugar_limit": "<25g added sugar per day",
			"daily_sodium_limit": "<2300mg per day"
		},
		"health_score_ranges": {
			"90-100": "Excellent - Very healthy choice",
			"80-89": "Good - Healthy with minor concerns",
			"70-79": "Fair - Moderate health impact",
			"60-69": "Poor - Consider healthier alternatives",
			"Below 60": "Very Poor - Avoid or limit consumption"
		},
		"tips": [
			"Look for products with high fiber content",
			"Avoid products with high added sugars",
			"Choose items with minimal processed ingredients",
			"Check sodium content, especially in packaged foods",
			"Prefer products with natural ingredients"
		]
	}

