# ⚙️ NutriKart Backend

FastAPI backend powering the NutriKart recommendation engine. Deployed on **Render**, connected to a **Supabase** PostgreSQL database.

**Live API:** `https://nutrikart.onrender.com`  
**Swagger UI:** `https://nutrikart.onrender.com/docs`

---

## 🏗️ Architecture

```mermaid
graph TD
    API[FastAPI Routes] --> Rec[recommendation.py]
    Rec --> Filter[Health Filter]
    Rec --> Score[Scoring Engine]
    Rec --> LP[LP Optimizer / PuLP]
    LP -->|infeasible fallback| Greedy[Greedy Allocator]
    Filter --> DB[(Supabase PostgreSQL)]
    Score --> DB
```

- **Health Filter** (`recommendation.py`) — Excludes products that exceed per-condition nutrient limits
- **Scoring Engine** (`recommendation.py`) — Assigns a numerical score to each product using condition-specific nutrient weights
- **LP Optimizer** (`lp_optimizer.py`) — Solves an Integer Linear Program (via PuLP/CBC) to maximise total nutrition score within budget. Falls back to greedy if ILP is infeasible
- **CORS** — Reads `ALLOWED_ORIGINS` from environment; locked to the Vercel domain in production

---

## 📁 Structure

```text
backend/
├── app/
│   ├── main.py             # App init, CORS, router registration
│   ├── database.py         # SQLAlchemy engine, SessionLocal, get_db
│   ├── models.py           # Category and Product ORM models
│   ├── schemas.py          # Pydantic V2 request/response schemas
│   ├── recommendation.py   # Filter → Score → Rank → Allocate pipeline
│   ├── lp_optimizer.py     # ILP budget allocation (PuLP)
│   └── routes/
│       ├── products.py     # GET/POST/DELETE /products
│       ├── categories.py   # GET/POST /categories
│       └── recommend.py    # POST /recommend
├── tests/                  # 35-test pytest suite
├── render.yaml             # Render deploy configuration
└── requirements.txt
```

---

## 🚀 Local Setup

```bash
# 1. Create and activate venv
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variable
export DATABASE_URL="postgresql://user:password@host:port/db"
# or create a .env file with DATABASE_URL=...

# 4. Start the server
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase Pooler URI) |
| `ALLOWED_ORIGINS` | Production | Comma-separated allowed CORS origins. Defaults to `*` locally. |

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/products` | List all products (`?category_id=` optional) |
| `GET` | `/products/{id}` | Product detail with full nutrition |
| `POST` | `/products` | Create a product |
| `DELETE` | `/products/{id}` | Delete a product |
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create a category |
| `POST` | `/recommend` | Optimised grocery recommendations |

### POST /recommend

**Request:**
```json
{
  "budget": 500,
  "health_condition": "diabetic",
  "household_size": 2
}
```
`health_condition`: `"diabetic"` · `"hypertension"` · `"weight_loss"` · `null`

**Response:**
```json
{
  "recommendations": [
    {
      "id": 12, "name": "...", "quantity": 2, "subtotal": 80.0,
      "score100": 74, "calories": 120, "protein": 8, ...
    }
  ],
  "summary": {
    "total_spent": 480.0, "remaining_budget": 20.0,
    "allocation_method": "lp", ...
  }
}
```

---

## 🧪 Tests

```bash
pytest tests/ -v
# 35 passed, 0 warnings
```

Test files:
- `test_api.py` — Full HTTP stack via `TestClient` (catches import errors)
- `test_filter.py` — Health constraint filtering
- `test_score.py` — Nutrient scoring & ranking
- `test_budget.py` — Greedy budget allocation
- `test_lp_optimizer.py` — LP solver correctness & fallback

---

## ☁️ Deployment (Render)

The `render.yaml` at the root of this directory configures the Render web service.

Key settings in Render dashboard:
- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Env vars:** `DATABASE_URL`, `ALLOWED_ORIGINS`

---

## 🛠️ Technologies

- [FastAPI](https://fastapi.tiangolo.com/) 0.129
- [SQLAlchemy](https://www.sqlalchemy.org/) 2.0
- [Pydantic](https://docs.pydantic.dev/) V2
- [PuLP](https://coin-or.github.io/pulp/) — ILP solver
- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/) — PostgreSQL adapter
- [Uvicorn](https://www.uvicorn.org/) — ASGI server
