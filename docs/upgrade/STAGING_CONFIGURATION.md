# Isolated Staging Deployment & Configuration Runbook

**Document Date:** 2026-06-02  
**Target Environment:** Staging Isolated Preview  
**Platforms:** Render (FastAPI), Vercel (React Frontend), Supabase (PostgreSQL)

---

## 1. Environment Variable Architecture & Secret Hygiene

Client-side environment variables (`VITE_*`) are compiled directly into public JavaScript bundles. Server credentials must **NEVER** use the `VITE_` prefix.

### Frontend Environment Variables (Vercel Staging)
| Variable Name | Required | Example / Default | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | No | `https://nutrikart-staging-api.onrender.com` | Base backend API endpoint |
| `VITE_USE_FIXTURES`| No | `false` | Fallback offline fixtures if backend is offline |

### Backend Environment Variables (Render Staging)
| Variable Name | Required | Sensitive | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Yes (Secret) | Connection string for isolated Supabase staging database |
| `ALLOWED_ORIGINS` | Yes | No | Comma-separated list of staging origins (e.g., `https://nutrikart-staging.vercel.app`) |
| `ALLOWED_ORIGIN_REGEX`| Yes | No | Regular expression matching Vercel preview deploys |
| `NUTRIKART_PROVIDER_MODE`| Yes | No | Provider mode: `static`, `fixture`, or `live` |
| `SWIGGY_PARTNER_API_KEY`| No | Yes (Secret) | Partner API key (only if official access is granted) |
| `SWIGGY_API_ENDPOINT`| No | No | Partner staging sandbox URL |

---

## 2. Database Provisioning & Seed Integrity

1. **Staging Database Isolation:**
   - Staging utilizes a dedicated Supabase project distinct from any production database.
   - `sqlite:///./nutrikart.db` remains available for offline development and CI environments.

2. **Idempotent Migration & Seeding:**
   - Initial bootstrap runs `python seed.py` to populate 30 verified Indian grocery items and categories.
   - All migrations verify table existence and column constraints before mutation.

3. **Backup & Rollback Strategy:**
   - Pre-deployment point-in-time snapshot created via Supabase CLI:  
     `supabase db dump -f pre_upgrade_backup.sql`
   - Reversible schema changes only: No dropping of columns without a multi-phase deprecation window.

---

## 3. Staging Deployment Checklist

- [x] Zero partner tokens or database credentials exposed in frontend code.
- [x] CORS configuration explicitly disallows wildcard `*` when credentials or cookies are used.
- [x] Healthcheck endpoint `/health` returns 200 OK without requiring database write locks.
- [x] Static-first fallback is enabled by default so frontend remains functional during backend deploys.
