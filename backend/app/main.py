from fastapi import FastAPI
from .routes import categories, products, recommend
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NutriKart API")

# In production set ALLOWED_ORIGINS to your Vercel URL, e.g.:
#   ALLOWED_ORIGINS=https://nutrikart.vercel.app
# Multiple origins: comma-separated. Defaults to "*" for local dev.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = (
    [o.strip() for o in _raw_origins.split(",") if o.strip()]
    if _raw_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(recommend.router)

@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}
