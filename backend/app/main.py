from fastapi import FastAPI
from .routes import categories, products, recommend, profile_rules, location
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

TAGS_METADATA = [
    {
        "name": "recommend",
        "description": "Linear programming optimization engine that computes mathematically optimal grocery baskets under dietary constraints.",
    },
    {
        "name": "products",
        "description": "Product catalog endpoints with category relations and nutritional profiles.",
    },
    {
        "name": "categories",
        "description": "Food category taxonomies and department groupings.",
    },
    {
        "name": "profile_rules",
        "description": "Clinical condition rules, dietary thresholds, and scoring objective weights.",
    },
    {
        "name": "location",
        "description": "Quick-commerce serviceability inspection and locality verification.",
    },
]

app = FastAPI(
    title="NutriKart Engine API",
    version="2.0.0",
    description="Health-aware grocery planning, nutrient scoring, and LP budget optimization API.",
    openapi_tags=TAGS_METADATA,
    contact={
        "name": "NutriKart Engineering",
        "url": "https://github.com/nutrikart",
    },
    license_info={
        "name": "MIT",
    },
)

# A trailing slash in the Render env var blocked every request.
# Strip whitespace, quotes, and trailing slashes so origins match accurately.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = (
    [o.strip().strip("'\"").rstrip("/") for o in _raw_origins.split(",") if o.strip()]
    if _raw_origins.strip().strip("'\"") != "*"
    else ["*"]
)
allow_origin_regex = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"https://nutrikart(-[a-z0-9-]+)?\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(recommend.router)
app.include_router(profile_rules.router)
app.include_router(location.router)

@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}

@app.get("/health")
def healthcheck():
    from app.services.providers import get_provider
    from app.database import SessionLocal
    from sqlalchemy import text

    provider = get_provider()
    db_ok = True
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "provider_mode": provider.mode.value,
        "service": "NutriKart API",
        "version": "2.0.0",
    }
