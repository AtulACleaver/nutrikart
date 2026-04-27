from fastapi import FastAPI
from .routes import categories, products, recommend, profile_rules
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NutriKart API")

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

@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}
