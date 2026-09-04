# Oil Spill Detection & Attribution — Backend API

A Next.js API backend for oil spill detection, drift analysis, and vessel attribution. Designed for deployment on **Vercel** with **Supabase** PostgreSQL.

## Tech Stack

- **Runtime**: Next.js 14 (App Router, API Routes only)
- **Database**: Supabase PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Export**: GeoJSON + PDF (@react-pdf/renderer)
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | — | Health check + DB connectivity |
| GET | `/api/cases` | — | List cases with metrics & pagination |
| GET | `/api/cases/:id` | — | Full case record |
| GET | `/api/pipeline/stream` | — | SSE stream for real-time updates |
| GET | `/api/report/:id` | — | Export case as GeoJSON or PDF |
| POST | `/api/internal/cases/start` | API Key | Create new case |
| POST | `/api/internal/cases/:id/stage` | API Key | Update pipeline stage |

### Query Parameters

**GET /api/cases**
- `status` — Filter by case status (`detecting`, `drift_calculating`, `ais_scanning`, `confirmed`, `unresolved`)
- `search` — Search by case ID
- `page` — Page number (default: 1)
- `limit` — Results per page (default: 20, max: 100)

**GET /api/report/:id**
- `format` — Export format: `geojson` (default) or `pdf`

**GET /api/pipeline/stream**
- `caseId` — Subscribe to a specific case (omit for all cases)

### Internal API Authentication

Internal endpoints require an `X-API-Key` header matching the `INTERNAL_API_KEY` environment variable.

## Setup

### 1. Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database** and copy the connection strings
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Replace the placeholders in `.env`:
- `[YOUR-PROJECT-REF]` — Your Supabase project reference
- `[YOUR-PASSWORD]` — Your database password
- `[REGION]` — Your Supabase region (e.g., `us-east-1`)

### 2. Install & Migrate

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Run Locally

```bash
npm run dev
# Server starts at http://localhost:3000
```

### 4. Test the Pipeline

```bash
# Run the mock ML simulator
npm run simulate
```

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/oilspill-backend.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add these environment variables in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | Your Supabase direct connection string (port 5432) |
| `INTERNAL_API_KEY` | A strong secret key for ML pipeline auth |
| `ALLOWED_ORIGINS` | Your frontend domain(s), comma-separated |

3. Deploy!

### 3. Run Migration on Supabase

After the first deploy, run the migration against your Supabase database:

```bash
npx prisma migrate deploy
```

Or push the schema directly:

```bash
npx prisma db push
```

## Pipeline Flow

```
ML Service                          Backend API                    Frontend
    │                                   │                              │
    ├─POST /internal/cases/start───────►│ Creates case (detecting)     │
    │                                   ├──────────SSE event──────────►│
    │                                   │                              │
    ├─POST /internal/cases/:id/stage───►│ System 1 (drift_calculating) │
    │  stage: "detected"                ├──────────SSE event──────────►│
    │                                   │                              │
    ├─POST /internal/cases/:id/stage───►│ System 2 (ais_scanning)      │
    │  stage: "drift_calculated"        ├──────────SSE event──────────►│
    │                                   │                              │
    ├─POST /internal/cases/:id/stage───►│ System 3 (confirmed)         │
    │  stage: "attributed"              ├──────────SSE event──────────►│
    │                                   │                              │
    └─POST /internal/cases/:id/stage───►│ Complete                     │
       stage: "complete"                ├──────────SSE event──────────►│
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── scripts/
│   ├── mock-data.ts           # Centralized mock GeoJSON data
│   └── simulate-pipeline.ts   # Mock ML pipeline simulator
├── src/
│   ├── middleware.ts           # CORS middleware
│   ├── app/api/
│   │   ├── route.ts           # Root API info
│   │   ├── health/            # Health check
│   │   ├── cases/             # Public query APIs
│   │   ├── internal/cases/    # ML ingestion APIs
│   │   ├── pipeline/stream/   # SSE streaming
│   │   └── report/            # GeoJSON/PDF export
│   └── lib/
│       ├── prisma.ts          # DB client singleton
│       ├── events.ts          # Pub/sub event bus
│       ├── auth.ts            # API key validation
│       ├── validation.ts      # Zod schemas
│       ├── case-id.ts         # ID generator
│       ├── geojson-builder.ts # GeoJSON assembler
│       └── pdf-report.tsx     # PDF template
├── vercel.json                # Vercel deployment config
└── package.json
```

## License

Private — All rights reserved.
