from fastapi import FastAPI
from .routes import categories, products, recommend
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NutriKart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
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
