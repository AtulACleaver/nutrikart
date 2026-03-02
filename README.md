# 🛒 NutriKart — Smart Health-Aware Grocery Scout

NutriKart is an AI-powered grocery assistant that helps users make informed food choices based on their health conditions and budget. It filters products by health constraints, scores them nutritionally, and uses Integer Linear Programming to find the globally optimal grocery mix within your budget.

![NutriKart](https://img.shields.io/badge/NutriKart-v1.0.0-4ade80?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.12-3b82f6?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.129-009688?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ecf8e?style=flat-square)
![Deployed](https://img.shields.io/badge/Backend-Render-46e3b7?style=flat-square)
![Deployed](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square)

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [nutrikart.vercel.app](https://nutrikart.vercel.app) |
| **Backend API** | [nutrikart.onrender.com](https://nutrikart.onrender.com) |
| **API Docs** | [nutrikart.onrender.com/docs](https://nutrikart.onrender.com/docs) |
| **Database** | Supabase (PostgreSQL) |

---

## ✨ Features

- **🎯 Health-Based Filtering** — Hard constraints per condition: diabetes, hypertension, weight loss
- **📊 Weighted Scoring Engine** — Rewards protein & fiber; penalises sugar, sodium, saturated fat
- **🧮 LP Budget Optimizer** — Integer Linear Programming (PuLP) finds the globally optimal cart, not just greedy picks
- **👨‍👩‍👧‍👦 Household Scaling** — Quantity recommendations scale with household size
- **📂 Category Browsing** — Filter products by category chips on the home page
- **🛒 Cart + PDF Export** — Cart drawer with quantity controls; export your cart as a formatted PDF
- **📱 Responsive Dark UI** — Clean Tailwind-based dark interface, works on mobile and desktop

---

## 🎯 How It Works

### The Recommendation Pipeline

```mermaid
graph TD
    A[Raw Product Catalog] --> B{Health Filter}
    B -->|Constraints Met| C[Nutrient Scoring Engine]
    B -->|Violates Limits| X[Discard Product]
    C --> D[Ranked Products]
    D --> E{LP Budget Optimizer}
    E --> F[Personalized Grocery List]

    subgraph "Health Constraints"
    B1["Diabetic: Sugar < 5g, Cal < 200"]
    B2["Hypertension: Sodium < 200mg, Fat < 5g"]
    B3["Weight Loss: Cal < 150, Sat Fat < 3g"]
    end

    subgraph "Scoring"
    C1["Score = Σ (NutrientValue × Weight)"]
    end
```

### Architecture

```mermaid
graph LR
    User((User)) <--> FE[React / Vercel]
    FE <--> API[FastAPI / Render]
    API <--> DB[(PostgreSQL / Supabase)]

    subgraph "Backend"
    API --- Rec[recommendation.py]
    API --- LP[lp_optimizer.py]
    API --- RT[routes/]
    end
```

---

## 🚀 Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- A running PostgreSQL instance (or Supabase project)

### Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Copy and fill in your DB URL
cp .env.example .env       # set DATABASE_URL=postgresql://...

uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install

# Point to local backend
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```text
nutrikart/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, routers
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   ├── models.py           # DB table definitions
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── recommendation.py   # Filter, score, rank logic (greedy fallback)
│   │   ├── lp_optimizer.py     # ILP budget allocation via PuLP
│   │   └── routes/             # products.py, categories.py, recommend.py
│   ├── tests/                  # 35-test pytest suite
│   ├── render.yaml             # Render deploy config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Router + CartProvider wrapper
│   │   ├── pages/              # Home, Cart, Product
│   │   ├── components/         # TopBar, ProductCard, CartDrawer, etc.
│   │   ├── api/                # Axios API clients
│   │   ├── store/              # Cart Context (useReducer)
│   │   └── utils/              # debounce.js, exportPDF.js
│   └── vite.config.js
└── data/                       # Seed data / CSV
```

---

## 🔌 API Reference

### Products & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List all products (optional `?category_id=`) |
| `GET` | `/products/{id}` | Single product with full nutrition data |
| `GET` | `/categories` | All categories |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/recommend` | Optimised grocery list within budget |

**Request:**
```json
{
  "budget": 500,
  "health_condition": "diabetic",
  "household_size": 2
}
```

`health_condition` accepts: `"diabetic"` · `"hypertension"` · `"weight_loss"` · `null`

---

## 🏥 Health Profiles

### Hard Constraints (products violating these are excluded)

| Condition | Max Sugar | Max Sodium | Max Calories | Other |
|-----------|-----------|------------|--------------|-------|
| **Diabetic** | 5 g | — | 200 kcal | — |
| **Hypertension** | — | 200 mg | — | Fat < 5 g |
| **Weight Loss** | 8 g | — | 150 kcal | Sat Fat < 3 g |

### Scoring Weights

| Nutrient | Diabetic | Hypertension | Weight Loss | Default |
|----------|----------|--------------|-------------|---------|
| Sugar | −3.0 | −1.0 | −2.0 | −1.0 |
| Fiber | +2.0 | +1.5 | +2.0 | +1.5 |
| Protein | +1.5 | +1.0 | +2.5 | +1.5 |
| Sodium | −0.5 | −4.0 | — | −0.5 |
| Calories | −0.5 | — | −3.0 | −0.3 |
| Sat Fat | — | −2.5 | −2.5 | −1.0 |

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.129, SQLAlchemy 2, Pydantic V2, PuLP |
| Frontend | React 19, Vite 7, Tailwind CSS 4, Axios |
| Database | PostgreSQL (Supabase) |
| Backend Host | Render |
| Frontend Host | Vercel |
| Auth | None (public read-only API) |

---

## 🧪 Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
# 35 passed in ~3.5s
```

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

> **Disclaimer**: NutriKart is for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor for health decisions.
