# FinPulse

Personal Finance Tracker with AI-powered spending insights. Full-stack monorepo: Express/TypeScript REST API + React dashboard.

## Features

- **Auth** — Supabase JWT authentication with Row-Level Security; all data is user-isolated
- **Transactions** — Income/expense CRUD with category tagging, pagination, and date/type filtering
- **Budgets** — Spending limits with real-time progress tracking (spent / remaining / % used)
- **Accounts** — Multi-account balance management (checking, savings, credit, investment, cash)
- **Recurring Transactions** — Automated transaction rules with frequency-based reconciliation
- **AI Insights** — Claude API (`claude-sonnet-4-6`) generates monthly summaries, 3-month trend analysis, and answers natural-language finance questions
- **Dashboard** — KPI cards, income vs. expenses area chart, category donut chart, recent transactions

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express, TypeScript |
| Database | Supabase (PostgreSQL) + Knex.js migrations |
| Auth | Supabase Auth (JWT + RLS policies) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Data Fetching | TanStack React Query v5 + Axios |
| Validation | Zod (API boundary) |
| Testing | Jest + Supertest |
| Deploy | Railway (API) + Vercel (Frontend) |

## Architecture

```
finPulse/
├── src/
│   ├── domain/entities/        # TypeScript interfaces (Transaction, Budget, etc.)
│   ├── usecases/               # Business logic (CreateTransaction, GenerateSpendingInsights, etc.)
│   ├── adapters/
│   │   ├── repositories/       # Knex DB queries (PgTransactionRepo, PgBudgetRepo, etc.)
│   │   └── services/           # External integrations (SupabaseAuthService, ClaudeInsightsService)
│   ├── infrastructure/
│   │   ├── config/             # Database + Supabase client singletons
│   │   ├── middleware/         # Auth guard, error handler, Zod validation
│   │   └── routes/             # Express routers
│   └── shared/
│       ├── errors/             # AppError, ValidationError, NotFoundError, UnauthorizedError
│       └── validators/         # Zod schemas for all endpoints
├── db/
│   ├── migrations/             # 7 Knex migrations (accounts → RLS policies)
│   └── seeds/                  # Default system categories
├── frontend/
│   └── src/
│       ├── lib/                # Axios API client, AuthContext
│       ├── hooks/              # React Query hooks (useApi.ts)
│       ├── components/         # UI kit (Button, Card, Badge, Modal) + layout + charts
│       └── pages/              # Dashboard, Transactions, Budgets, Accounts, Insights
└── tests/
    ├── integration/            # Auth endpoint tests (Supertest)
    └── unit/                   # Repo + service + validator tests (Jest)
```

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- Supabase account (for Auth)
- Anthropic API key

### 1. Clone and install

```bash
git clone https://github.com/RickMelendez/finPulse.git
cd finPulse
npm install
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finpulse
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

### 3. Start database

```bash
docker compose up -d postgres
```

### 4. Run migrations and seed

```bash
npm run migrate:latest
npm run seed:run
```

### 5. Start API

```bash
npm run dev          # http://localhost:3000
```

### 6. Start frontend

```bash
cd frontend
npm run dev          # http://localhost:5173
```

### Docker (all services)

```bash
docker compose up --build
```

Starts: API on `3000`, PostgreSQL on `5432`, pgAdmin on `5050`.

## API Reference

All endpoints require `Authorization: Bearer <access_token>` except auth routes.

### Auth — `/api/v1/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/register` | `{ email, password }` | Register new user |
| POST | `/login` | `{ email, password }` | Login, get tokens |
| POST | `/refresh` | `{ refreshToken }` | Refresh access token |
| POST | `/logout` | — | Revoke session |

### Transactions — `/api/v1/transactions`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List with filters: `?page&limit&type&categoryId&startDate&endDate` |
| POST | `/` | Create transaction |
| GET | `/:id` | Get by ID |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |
| GET | `/summary` | Monthly totals: `?period=YYYY-MM` |

### Budgets — `/api/v1/budgets`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List with real-time progress (spent, remaining, % used) |
| POST | `/` | Create budget |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |
| GET | `/alerts` | Budgets at ≥80% |

### Accounts — `/api/v1/accounts`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List accounts |
| POST | `/` | Create account |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |

### Categories — `/api/v1/categories`

System categories are seeded automatically. Users can add custom categories.

| Method | Path | Description |
|---|---|---|
| GET | `/` | List (system + user's own) |
| POST | `/` | Create custom category |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete (own only) |

### Recurring Transactions — `/api/v1/recurring`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List recurring rules |
| POST | `/` | Create rule |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |
| POST | `/reconcile` | Generate due transactions for today |

### AI Insights — `/api/v1/insights`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Monthly summary: `?period=YYYY-MM` (24h cache) |
| GET | `/trends` | 3-month trend analysis |
| POST | `/ask` | Body: `{ question }` — NL finance question |

## Testing

```bash
npm test                    # All tests (88 tests, ~10s)
npm test -- --coverage      # With coverage report
```

Tests cover: auth endpoints, transaction repo (CRUD + mapping), budget repo (progress calc), category repo, account repo, recurring repo (reconcile logic), insights validators, Claude service (mocked SDK).

## Deployment

### Backend → Railway

1. Connect GitHub repo to Railway
2. Set root directory to `/` (project root)
3. Railway auto-detects `railway.json` — build: `npm ci && npm run build`, start: `npm start`
4. Add environment variables in Railway dashboard (all vars from `.env.example`)
5. Run migrations once via Railway CLI: `railway run npm run migrate:latest`

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Framework: Vite (auto-detected)
4. Build command: `npm run build` | Output: `dist`
5. Add env var: `VITE_API_URL=https://your-api.up.railway.app`
6. `vercel.json` handles SPA rewrites automatically

### CI/CD

GitHub Actions runs on every push to `main` / `develop` and on all PRs:
- Backend: TypeScript compile + Jest test suite
- Frontend: TypeScript + Vite production build

## Default Categories

**Expenses:** Groceries, Rent, Transportation, Entertainment, Healthcare, Utilities, Dining, Shopping, Education, Personal Care

**Income:** Salary, Freelance, Investment, Other Income

## License

MIT
