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

# 1️⃣1️⃣ Database Rules

- One database server
- Separate schema per module
- Research schema isolated
- No cross-schema SQL joins

Data sharing happens ONLY via events.

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
- PostgreSQL (Hosted via Supabase)

CMS:
- Strapi (Headless CMS)
- Hosted as separate service

---

## Single PaaS Hosting Rule

All services may be hosted under ONE Platform-as-a-Service provider.

Example Structure:

- Frontend Service → Next.js
- Backend Service → NestJS Modulith
- CMS Service → Strapi
- Database → Supabase Postgres

No Kubernetes.
No microservices.
No multi-cloud strategy.
No unnecessary infrastructure complexity.

---

## Supabase Usage Rules

Supabase may be used for:

- Managed PostgreSQL
- File storage
- Optional authentication support

Supabase must NOT:

- Replace core business logic
- Bypass modular boundaries
- Be used as direct frontend database access
- Allow public access to clinical schemas

All clinical access must pass through the backend.

---

## UI / Brand System & Template Strategy

Brand colors must remain consistent:

Primary Blue → Trust and authority
Medical Green → Health and vitality
White → Clean clinical interface

No random color usage.
All colors must be defined in Tailwind config.

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

- Windows 10/11, Git, VS Code
- Node.js 20+ with npm
- Supabase account for PostgreSQL
- Optional: Docker Desktop (for local Postgres if not using Supabase)

## Workspace Bootstrap

- Create the following top-level folders:
  - /apps/frontend → Next.js (TypeScript, Tailwind, shadcn/ui)
  - /apps/backend → NestJS (Modular Monolith)
  - /apps/cms → Strapi (Headless CMS)
  - /modules → Core business modules (contracts/domain/infrastructure/features)

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

- Enforce brand in tailwind.config:
  - Primary Blue, Medical Green, White
  - Components must use the shared design tokens; no ad-hoc colors

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

- Create a Supabase project and Postgres database
- Generate a service role connection string and store it securely (environment variables only)
- Adopt separate schemas per module; never perform cross-schema joins
- Add a schema and table for the first vertical slice:

```sql
create schema if not exists clinic;

create table if not exists clinic.clinic_status (
  clinic_id text primary key,
  name text not null,
  status text not null,
  updated_at timestamptz not null default now()
);
```

- Add a starter row:

```sql
insert into clinic.clinic_status (clinic_id, name, status)
values ('lagos-main', 'AudiologyLink Lagos', 'open')
on conflict (clinic_id) do update
set name = excluded.name,
    status = excluded.status,
    updated_at = now();
```

## Running Locally

- Use three terminals:

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

- Backend runs on port 3001
- Frontend runs on port 3000

- The Public BFF (frontend) consumes CMS content and operational data from the backend
- The Professional portal authenticates via OpenID Connect and uses HttpOnly cookies

## Module Scaffolding (Backend)

- For each business capability, create a module under /src/modules:
  - Only expose contracts to other modules
  - Use vertical slice features inside /features
  - Communicate across modules via events and Outbox/Inbox pattern
  - Host app contains zero business logic (composition root only)

## Testing & Quality Gates

- Enable ESLint/Prettier in both frontend and backend
- Use the default testing tool from each scaffold:
  - Next.js: the chosen scaffold’s test setup (e.g., Jest/Vitest)
  - NestJS: Jest with @nestjs/testing
- Add a .env.example file with placeholders (no secrets)
- CI should run lint, typecheck, and tests before deploy

## Deployment (Single PaaS Rule)

- Deploy all services under a single provider:
  - Frontend → Next.js app
  - Backend → NestJS modulith
  - CMS → Strapi
  - Database → Supabase Postgres
- No Kubernetes, no early microservices, no multi-cloud

By following these steps, you will have a working tri-service setup (frontend, backend, CMS) backed by Supabase Postgres that adheres to AudiologyLink’s strict modular, event-driven, and compliance-aware architecture.
