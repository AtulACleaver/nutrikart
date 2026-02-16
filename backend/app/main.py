from fastapi import FastAPI
from .routes import categories, products

app = FastAPI(title="NutriKart API")

# Include routers
app.include_router(categories.router)
app.include_router(products.router)

@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}
