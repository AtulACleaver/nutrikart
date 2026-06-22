from fastapi import FastAPI
from contextlib import asynccontextmanager
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


def run_auto_migrations():
    """Ensure database tables and columns exist upon service initialization."""
    import logging
    logger = logging.getLogger("uvicorn.error")
    try:
        from app.database import engine, Base, SessionLocal, DATABASE_URL
        from sqlalchemy import text
        import os

        # 1. Ensure all declared tables exist
        Base.metadata.create_all(bind=engine)

        # 2. Ensure columns exist across both SQLite and PostgreSQL
        if DATABASE_URL.startswith("sqlite"):
            db_path = DATABASE_URL.replace("sqlite:///", "")
            if os.path.exists(db_path):
                import sqlite3
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                existing_cols = {r[1] for r in c.execute("PRAGMA table_info(products)").fetchall()}
                new_cols = [
                    ("brand", "TEXT"),
                    ("variant", "TEXT"),
                    ("pack_quantity", "NUMERIC(10, 2)"),
                    ("pack_unit", "TEXT DEFAULT 'g'"),
                    ("serving_unit", "TEXT DEFAULT 'g'"),
                    ("measurement_basis", "TEXT DEFAULT 'per_serving'"),
                    ("verification_status", "TEXT DEFAULT 'verified'"),
                    ("source_type", "TEXT DEFAULT 'seed'"),
                    ("source_ref", "TEXT"),
                    ("version", "INTEGER DEFAULT 1"),
                ]
                for col_name, col_type in new_cols:
                    if col_name not in existing_cols:
                        c.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")
                conn.commit()
                conn.close()
        else:
            pg_stmts = [
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS variant VARCHAR",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_quantity NUMERIC(10, 2)",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_unit VARCHAR DEFAULT 'g'",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS serving_unit VARCHAR DEFAULT 'g'",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS measurement_basis VARCHAR DEFAULT 'per_serving'",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS verification_status VARCHAR DEFAULT 'verified'",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS source_type VARCHAR DEFAULT 'seed'",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS source_ref VARCHAR",
                "ALTER TABLE products ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1",
                "CREATE INDEX IF NOT EXISTS ix_products_name ON products (name)",
            ]
            with engine.begin() as conn:
                for stmt in pg_stmts:
                    try:
                        conn.execute(text(stmt))
                    except Exception as err:
                        logger.warning(f"PostgreSQL migration warning: {err}")

        # 3. Seed default data if database is unpopulated
        db = SessionLocal()
        try:
            from app.models import Category, Product
            if db.query(Category).count() == 0 or db.query(Product).count() == 0:
                try:
                    import seed_db
                    seed_db.seed()
                    logger.info("Auto-seeded default catalogue successfully.")
                except Exception as seed_err:
                    logger.warning(f"Auto-seed exception: {seed_err}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Startup auto-migration failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_auto_migrations()
    yield


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
    lifespan=lifespan,
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
