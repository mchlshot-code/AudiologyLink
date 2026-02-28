# AudiologyLink – Architecture Enforcement Guide
## Modular Monolith + Plugin-Ready Clinical Platform

This project follows a STRICT Modular Monolith architecture.

It is a healthcare platform operating under:
- Nigeria Data Protection Act (NDPA) 2023
- Healthcare data sensitivity requirements
- Institutional-grade separation of concerns

This document defines NON-NEGOTIABLE architectural rules.

---

# 1️⃣ Core Philosophy

AudiologyLink is:

- A Modular Monolith (Modulith)
- Event-Driven internally
- Plugin-extensible
- CMS-integrated (Headless)
- Backend-for-Frontend separated
- NDPA compliant by structure

We DO NOT build a traditional monolith.
We DO NOT build premature microservices.
We DO NOT allow cross-module leakage.

---

# 2️⃣ High-Level Architecture

Edge Layer
    → Reverse Proxy / API Gateway

Presentation Layer
    → Public Backend-for-Frontend (BFF)
    → Professional Backend-for-Frontend (BFF)

Core Layer
    → Host Application (Composition Root Only)
    → Core Modules
    → Plugin Manager
    → In-Memory Event Bus

Data Layer
    → Single relational database
    → Schema per module (STRICT)
    → No cross-schema queries

---

# 3️⃣ Module Structure (MANDATORY)

Each module MUST follow:

/modules
    /ModuleName
        /contracts
        /domain
        /infrastructure
        /features

### Rules:

- Other modules may reference ONLY `contracts`
- No module may reference another module’s `domain`
- No module may reference another module’s `infrastructure`
- Host application contains ZERO business logic

Violation of these rules is architectural corruption.

---

# 4️⃣ Vertical Slice Architecture

Inside `/features`:

Each feature is a vertical slice.

Example:

/features
    /CreateAudiogram
        endpoint.ts
        handler.ts
        validator.ts

OR small features may live in one file.

Do NOT create horizontal folders like:
- /controllers
- /services
- /repositories

That pattern is forbidden.

---

# 5️⃣ Event-Driven Communication

Modules communicate ONLY via:

- Public contracts
- Integration events
- Event bus

NEVER:
- Direct database access across modules
- Direct internal method calls to another module’s domain

All cross-module state updates must:

1. Save to local schema
2. Write event to Outbox table
3. Publish to event bus
4. Other modules consume via Inbox pattern

---

# 6️⃣ Plugin System Rules

Plugins are future innovation modules.

Plugins must:

- Implement IPlugin contract (from Shared Kernel)
- Use dependency injection
- Never manually create DB connections
- Never access filesystem directly
- Never access other modules' schemas

Plugin Types:

- Research Modules
- PTM Modules
- Experimental Sound Models
- Institutional Extensions

Future security model:
- WebAssembly sandboxing (Phase 2+)

For MVP:
- Plugins may be statically loaded
- But must respect contracts

---

# 7️⃣ Sound Alert System (MVP Feature)

This feature:

- Detects dangerous sound levels
- Publishes SoundDangerEvent
- Logs exposure data
- Must not block main thread
- Must use event-driven update

Sound alert logic must remain isolated in its module.

---

# 8️⃣ PTM Stepping Module

PTM (Progressive Tinnitus Management) logic must:

- Be implemented as a plugin-ready module
- Be feature-flag controlled
- Query Consent module before processing data
- Never access raw patient schema directly
- Use anonymized research schema if needed

All experimental tinnitus logic must be reversible via feature flags.

---

# 9️⃣ CMS Integration (MANDATORY)

AudiologyLink uses a Headless CMS.

The CMS must:

- Be separate from core monolith
- Expose content via REST or GraphQL
- Handle:
    - Marketing pages
    - Patient education
    - Public resources
    - Institutional announcements

Public BFF responsibilities:

- Fetch CMS content
- Fetch operational data from monolith
- Merge and return unified response
- Cache aggressively
- Use static generation when possible

CMS must NEVER:

- Access clinical database
- Handle authentication tokens
- Process patient data

Content updates must not require core redeployment.

---

# 🔟 Authentication Strategy

Professional portal uses:

- OpenID Connect
- Identity Provider
- HTTP-Only cookies
- SameSite=Strict
- Redis session store

DO NOT:

- Store JWT in localStorage
- Expose tokens to frontend
- Allow cross-domain cookie sharing

Public site remains unauthenticated.

---

# 🔟.1️⃣ Backend AuthModule (Current)

AuthModule lives in `apps/backend/src/modules/auth` and follows the standard module structure:

/modules/auth
    /contracts
        auth.constants.ts
        auth.dto.ts
        auth.roles.ts
        auth.types.ts
        guards.ts
        roles.decorator.ts
        index.ts
    /domain
        auth.repository.ts
        auth.service.ts
        auth.service.spec.ts
        auth.user.ts
        password-hasher.ts
        token-payload.ts
    /features
        /login
            endpoint.ts
            handler.ts
        /refresh
            endpoint.ts
            handler.ts
        /register
            endpoint.ts
            handler.ts
        /me
            endpoint.ts
        /logout
            endpoint.ts
    /infrastructure
        bcrypt-password-hasher.ts
        cookie.helper.ts
        in-memory-auth.repository.ts
        postgres-auth.repository.ts
        jwt.strategy.ts
    auth.module.ts

### Token Delivery

Tokens are delivered via HTTP-only cookies (`SameSite=Strict`):
- `accessToken` cookie — path `/`, max-age from `JWT_ACCESS_TTL`
- `refreshToken` cookie — path `/api/auth`, max-age from `JWT_REFRESH_TTL`

No tokens are returned in JSON response bodies.
`JwtStrategy` reads the access token from the cookie first, falls back
to `Authorization: Bearer` header for API clients.

### Public Interface for Other Modules

Other modules must import ONLY from `apps/backend/src/modules/auth/contracts/index.ts`:

- `Roles()` decorator
- `JwtAuthGuard`, `RolesGuard`
- `Role`, `AuthenticatedUser`, and DTO types

No module may import AuthModule internals.

### Endpoints

- `POST /api/auth/login` — sets auth cookies
- `POST /api/auth/register` — sets auth cookies
- `POST /api/auth/refresh` — reads refresh cookie, sets new cookies
- `GET  /api/auth/me` — returns authenticated user (protected)
- `POST /api/auth/logout` — clears auth cookies

### Roles

- admin
- clinician
- receptionist
- patient

### Environment Variables (Backend)

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL` (e.g. `15m`)
- `JWT_REFRESH_TTL` (e.g. `7d`)
- `AUTH_SEED_EMAIL`
- `AUTH_SEED_PASSWORD`
- `AUTH_SEED_ROLES` (comma-separated)
- `CORS_ORIGIN` (e.g. `http://localhost:3000`)

### Frontend Auth Integration

- Next.js middleware (`src/middleware.ts`) redirects unauthenticated
  users to `/login` by checking the `accessToken` cookie presence
- `AuthProvider` context fetches `GET /api/auth/me` on mount, provides
  `{ user, loading, logout }` to dashboard components
- All fetch calls use `credentials: "include"` for cookie transport

### Passport Integration

- `JwtStrategy` is registered inside AuthModule
- Guards in contracts use Passport's `jwt` strategy

# 1️⃣1️⃣ Database Rules

- One Supabase project per environment (dev, production)
- Separate schema per module — STRICT
- No cross-schema SQL joins
- Data sharing happens ONLY via events

RLS Architecture Rules:
- RLS must be ENABLED on every table before any data is written
- Every module owns the RLS policies for its own schema
- Service role key is used ONLY in the NestJS backend
- Anon key is NEVER used — all access goes through the backend
- No module may define RLS policies on another module's tables
- RLS policies must be documented alongside the migration that 
  creates the table

---

# 1️⃣2️⃣ Consent & NDPA Compliance

Consent is a module.

Research modules MUST:

- Query Consent module before data use
- Process only required fields
- Receive anonymized data
- Respect expiration policies

All data access must be auditable.

---

# 1️⃣3️⃣ Feature Flags

All experimental features must:

- Be toggleable at runtime
- Be region-aware
- Be clinic-aware
- Be reversible instantly

No experimental logic should be permanently embedded without flag control.

---

# 1️⃣4️⃣ Scalability Roadmap

Phase 1:
- Pure Modular Monolith
- In-memory event bus
- Single DB cluster

Phase 2:
- External message broker
- DB read replicas

Phase 3:
- Extract heavy modules using Strangler Fig pattern

We DO NOT jump to microservices early.

---

# 1️⃣5️⃣ Development Discipline Rules (CRITICAL)

As a beginner developer:

- Never bypass module boundaries “just to make it work”
- Never create shared utility chaos folders
- Never expose domain entities directly to controllers
- Always use Contracts for cross-module communication
- If confused, isolate instead of coupling

Architecture integrity > speed hacks.

---

# 1️⃣6️⃣ Shared Kernel

Shared Kernel contains ONLY:

- Base event types
- Messaging interfaces
- Plugin interfaces
- Error formats
- Primitive shared value objects

No domain logic allowed here.

---

# 1️⃣7️⃣ Things That Are Forbidden

- Cross-module SQL joins
- Business logic inside Host
- Direct plugin DB access
- Storing JWT in frontend
- Mixing CMS with clinical logic
- Horizontal layered architecture
- Premature microservices

---

# 1️⃣8️⃣ Mission Reminder

AudiologyLink is being built to:

- Support audiology institutions
- Enable safe research innovation
- Protect Nigerian patient data
- Scale into enterprise infrastructure
- Remain plugin-ready for the future

Architecture integrity is a strategic advantage.

Protect it.


# Infrastructure & Cost-Conscious Deployment Strategy

AudiologyLink is currently in early-stage development with limited funding.

The infrastructure must remain:

- Simple
- Affordable
- Maintainable by a single developer
- Scalable later

---

## Approved Stack

Frontend:
- Next.js (TypeScript)
- TailwindCSS
- shadcn/ui components
- Blue / Green / White brand system

Backend:
- NestJS (Modular Monolith)
- TypeScript

Database:
- PostgreSQL via Supabase (managed)
- Row Level Security (RLS) is MANDATORY on every table
- No table is accessible without an explicit RLS policy

Sessions:
- Redis via Railway (managed plugin)

File Storage:
- Supabase Storage (S3-compatible, built into Supabase project)

CMS:
- Strapi (Headless CMS)
- Hosted on Railway

---

## Hosting Rule

All services run on PaaS. No VPS. No self-hosted infrastructure.
No Nginx to manage. No Docker in production.

- Frontend → Vercel
- Backend → Railway
- CMS → Railway
- Database → Supabase
- Redis → Railway plugin
- File Storage → Supabase Storage

This is the permanent production architecture.
There is no planned migration to self-hosted infrastructure.

Docker is used for LOCAL DEVELOPMENT ONLY if needed for isolated 
testing. It is NOT required. All services are managed by 
Supabase and Railway in both development and production.

---

## NDPA Compliance

Cross-border hosting is authorised under NDPA 2023 via the 
Standard Contractual Clauses gateway.

Instruments required:
- Supabase DPA signed and stored at docs/legal/supabase-dpa.pdf
- Patient onboarding consent must explicitly state that data is 
  processed on foreign infrastructure under contractual 
  NDPA-equivalent protections
- DPIA must be completed before first real patient is onboarded,
  stored at docs/legal/dpia.md

All clinical data access must pass through the NestJS backend.
No direct database access from frontend or CMS under any circumstance.

---

## UI / Brand System & Template Strategy

Brand colors are derived from the AudiologyLink logo and defined as
CSS custom properties in `apps/frontend/src/app/globals.css`.

| Role | Token | Hex Equivalent | Usage |
|---|---|---|---|
| Primary | `--primary` | Deep navy `#1B3A5C` | Trust / authority, headings |
| Accent | `--brand-cyan` / `--accent` | Cyan `#00B4D8` | Active states, links, ring |
| Destructive | `--destructive` | Coral-red `#E63946` | Errors, warnings, logo waves |
| Success | `--success` | Medical green `#16A34A` | Health indicators, confirmations |
| Sidebar | `--sidebar` | Very dark navy | Dark navigation shell |

All values use OKLCH color space with light and dark theme variants.

No random color usage.
All colors must be defined as CSS custom properties and referenced
via Tailwind theme tokens (`text-primary`, `bg-brand-cyan`, etc.).
Do not use arbitrary hex/rgb values in component code.

UI must use a component-based system built on:
- Next.js (TypeScript) App Router
- TailwindCSS utility classes
- shadcn/ui component library

The primary frontend shell is an admin/dashboard layout with:
- Persistent sidebar navigation for feature modules
- Top header for search, user menu, and clinic context
- Main content area for cards, tables, forms, and detail views

All screens MUST be composed from the shared dashboard primitives:
- Navigation shell (sidebar + header)
- Cards and stats blocks
- Data tables with filters and pagination
- Forms, dialogs, drawers/sheets, and tabs

Do not introduce additional UI frameworks.
Do not create ad-hoc bespoke layouts when an existing dashboard pattern fits.
Do not create inconsistent styling patterns.

### Module UX Pattern (Professional Portal)

Any backend module that surfaces UI in the professional portal must follow a standard pattern:

- Sidebar navigation entry named after the module’s business purpose
- List route: `/[module]` using a table-based view
- Create route: `/[module]/new` or a create sheet/dialog
- Detail route: `/[module]/[id]` showing the entity overview

List pages:
- Use shadcn/ui table components with search, filters, and pagination
- Show key columns that match the module’s contracts
- Provide row-level actions via buttons or dropdown menus

Detail pages:
- Use a summary card at the top for the most important fields
- Use tabs to separate sub-areas (overview, history, notes, attachments, etc.)
- Provide clear primary actions (edit, archive, add note, attach document)

Forms (create/edit):
- Use the shared Form, Input, Select, Textarea, and date/time components
- Group fields logically using cards or sections
- Show inline validation errors and a clear global error state

These rules define the generic module UX.
Actual module names (patients, appointments, clinicians, etc.) can change without changing this pattern.

---

## Security Minimum Standard (MVP)

- HTTPS enforced
- Environment variables secured in hosting platform
- HttpOnly cookies for professional portal
- No JWT stored in localStorage
- Role-based authorization in backend
- Schema-per-module isolation in PostgreSQL

Security must never be sacrificed for speed.
---

# 1️⃣9️⃣ Development Start Guide

This section provides a concrete, minimal path to begin building AudiologyLink while honoring all architectural rules above.

## Prerequisites

- Windows 10/11, Git, VS Code or Cursor
- Node.js 20+ with npm
- A Supabase account (supabase.com)
- A Railway account (railway.app)
- A Vercel account (vercel.com)
- No Docker required. All services are managed by 
  Supabase and Railway.

## Workspace Bootstrap

- Create the following top-level folders:
  - /apps/frontend → Next.js (TypeScript, Tailwind, shadcn/ui)
  - /apps/backend → NestJS (Modular Monolith)
  - /apps/cms → Strapi (Headless CMS)
  - /modules → Optional shared libraries if cross-app reuse is required

## Frontend (Next.js)

- Scaffold the app:

```bash
npx create-next-app@latest apps/frontend --ts --eslint --src-dir --import-alias "@/*"
```

- Install dependencies:

```bash
cd apps/frontend
npm install
```

- Tailwind is included by default in the current Next.js template. If missing, install and initialize:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- Initialize shadcn/ui:

```bash
npx shadcn@latest init
```

- Brand colors are defined in `globals.css` as CSS custom properties (OKLCH)
  - Primary (deep navy), Accent/brand-cyan, Destructive (coral-red), Success (medical green)
  - Components must use the shared design tokens (`text-primary`, `bg-brand-cyan`, etc.); no ad-hoc colors

- Base the application UI on a dashboard-style layout:
  - Sidebar navigation for core modules (Patients, Appointments, Clinicians, Reports, Settings)
  - Top header with search, notifications, and user account menu
  - Content area that uses cards, tables, and forms from shadcn/ui

- When designing new screens:
  - Prefer existing shadcn/ui components (Card, Table, Dialog, Sheet, Tabs, Form)
  - Reuse dashboard patterns instead of inventing new layouts
  - Keep flows form- and table-centric; avoid marketing-style layouts in the professional portal

## Backend (NestJS Modulith)

- Scaffold the app:

```bash
npx @nestjs/cli new apps/backend
```

- Install dependencies:

```bash
cd apps/backend
npm install
```

- Inside apps/backend, create a module-per-folder structure under /src/modules following:
  - contracts → DTOs, interfaces, events
  - domain → aggregates, entities, business rules
  - infrastructure → repositories, orm mappings, adapters
  - features → vertical slices (endpoint/handler/validator)

- Add environment config:
  - .env contains DATABASE_URL, SESSION_SECRET, CMS_URL, etc.
  - Do not commit secrets
  - Use schema-per-module in PostgreSQL (align with Database Rules)
  - Keep .env.example updated with placeholders for new modules

## CMS (Strapi)

- Scaffold the CMS:

```bash
npx create-strapi-app@latest apps/cms --quickstart --no-run
```

- Keep CMS content strictly non-clinical and separate from backend logic
- Expose content via REST/GraphQL for the Public BFF to consume

## Database (Supabase)

- Create a Supabase project at supabase.com
- Store the service role connection string in .env as DATABASE_URL
- Never commit this key. Never expose it to the frontend.
- Use the Supabase dashboard SQL editor to run migrations
- Point your local .env directly at the Supabase project URL —
  no local database setup required

RLS rule for every new table:
1. Create the schema migration
2. Enable RLS immediately:
   ALTER TABLE x ENABLE ROW LEVEL SECURITY;
3. Write the RLS policy before writing any application code
4. Document the policy in a comment above the migration

NDPA instrument:
- Download and sign the Supabase DPA from the Supabase dashboard 
  under Settings → Legal
- Save it to docs/legal/supabase-dpa.pdf

## Running Locally

Use three terminals:

```bash
# Backend
cd apps/backend
npm run start:dev

# Frontend
cd apps/frontend
npm run dev

# CMS
cd apps/cms
npm run develop
```

Backend → port 3001
Frontend → port 3000
CMS → port 1337

Local database → your Supabase project (connect via DATABASE_URL 
in .env — no local Docker or database setup required)
Local Redis → your Railway Redis URL (set REDIS_URL in .env)

No docker compose up. No local containers. Just npm run.

## Module Scaffolding (Backend)

- For each business capability, create a module under /src/modules:
  - Only expose contracts to other modules
  - Use vertical slice features inside /features
  - Communicate across modules via events and Outbox/Inbox pattern
  - Host app contains zero business logic (composition root only)

## Best Module Pattern (Use This)

- Keep modules inside apps/backend/src/modules for this codebase
- Do not create a root-level modules/ unless you are extracting shared libraries for multiple apps
- Each module owns its data, rules, and public contracts; no cross-module imports beyond contracts
- Compose modules in the backend app only; avoid duplicating domain logic in the frontend or CMS

## Testing & Quality Gates

- Enable ESLint/Prettier in both frontend and backend
- Use the default testing tool from each scaffold:
  - Next.js: the chosen scaffold’s test setup (e.g., Jest/Vitest)
  - NestJS: Jest with @nestjs/testing
- Add a .env.example file with placeholders (no secrets)
- CI should run lint, typecheck, and tests before deploy

## Deployment

Frontend → Vercel
- Connect the apps/frontend folder to a Vercel project
- Set NEXT_PUBLIC_API_URL to the Railway backend URL

Backend → Railway
- Connect the apps/backend folder to a Railway service
- Add a Redis plugin to the Railway project
- Set all environment variables from .env.example

CMS → Railway
- Connect the apps/cms folder to a separate Railway service
- Set CMS environment variables including DATABASE_URL 
  pointing to Supabase

Database → Supabase
- All schemas and migrations run directly on the Supabase project
- Never use Railway's built-in PostgreSQL

File Storage → Supabase Storage
- Use Supabase Storage buckets for all file uploads
- Access via the NestJS backend only, never directly from frontend

No Kubernetes. No Docker in production. No VPS. No multi-cloud.

By following these steps, you will have a working tri-service setup (frontend, backend, CMS) backed by Supabase Postgres that adheres to AudiologyLink's strict modular, event-driven, and compliance-aware architecture.
