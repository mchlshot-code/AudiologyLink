# AudiologyLink

AudiologyLink is a full-stack platform for audiology and clinical workflows. It combines:

- A modern **web frontend** (Next.js + TypeScript)
- A **backend API** (NestJS modular monolith)
- A **headless CMS** (Strapi)
- A **Postgres database** (via Supabase)

The goal is to provide a secure, modular foundation for building clinic-facing tools, patient portals, and rich content pages, while keeping clinical logic and content clearly separated.

---

## 1. What You Can Do With AudiologyLink

You can use this project as a base to build:

- **Clinic-facing dashboard**
  - Manage patients, clinicians, appointments, test results
  - Role-based access (e.g. admin, clinician, receptionist)
- **Patient portal**
  - Let patients view appointments, reports, and educational material
  - Collect forms or questionnaires
- **Content-rich public site**
  - Pages for clinics, services, FAQs, blog-style content
  - Managed through the Strapi CMS admin panel
- **Workflow automations**
  - Trigger notifications or follow-up actions when events happen (e.g. appointment booked, report finalized)

The architecture is designed to be **extensible**: adding a new feature usually means adding/modifying a module, not rewriting the whole app.

---

## 2. High-Level Architecture

AudiologyLink is structured as a monorepo. At the top level you will see:

- `apps/` – runnable applications (things you actually start/deploy)
- `modules/` (or similar) – domain modules (reusable building blocks for the backend)
- Shared configuration and tooling (e.g. TypeScript config, linting, etc.)

### 2.1 Apps (Runnables)

Typical apps under `apps/` include:

- **Next.js frontend**
  - User interface (clinic staff, patients, etc.)
  - Fetches data from the backend API and Strapi CMS
  - Written in React + TypeScript

- **NestJS API (modular monolith)**
  - Central backend application
  - Implements core clinical and business logic
  - Exposes REST/GraphQL endpoints to the frontend and other services
  - Organized into feature/domain modules

- **Strapi CMS (`apps/cms`)**
  - Headless CMS for content (pages, FAQs, resources, marketing copy)
  - Provides an admin UI for content editors
  - Exposes content over an API that the frontend consumes

> Apps are **entry points**: each app is an independently runnable server with its own config and startup command.

### 2.2 Modules (Domain Building Blocks)

Modules are **not** standalone apps. They are reusable libraries that represent features or domains, for example:

- Patients
- Appointments
- Clinicians
- Auth / Users / Roles
- Billing / Invoices
- Notifications

Each module typically contains:

- **Entities / models** – how data is stored (DB schema, ORM models)
- **Services** – business logic (e.g. scheduling rules, validation)
- **Controllers / resolvers** – API endpoints that expose the module to clients
- **DTOs / contracts** – the shape of data sent/received (for strong typing and clear interfaces)
- **Events / listeners** – for event-driven communication between modules

The backend app **imports** these modules and wires them together. Modules talk to each other through their **public interfaces**, not by reaching into each other’s internals.

---

## 3. Apps vs Modules

A simple way to think about it:

- **Apps**
  - What you **run/deploy**
  - Own server setup, routing, configuration, and wiring
  - Example: Next.js web app, NestJS API server, Strapi CMS

- **Modules**
  - What you **build features with**
  - Encapsulate domain logic and data for a specific problem area
  - Example: PatientsModule, AppointmentsModule, AuthModule

When you add a new feature (e.g. “Clinic Locations”):

1. You create or extend a **module** that owns that feature (entities, services, controllers).
2. The **backend app** imports that module to expose it via API.
3. The **frontend app** calls the backend API to use that feature.
4. Optionally, the **CMS app** is configured to provide related content (e.g. location descriptions, images).

---

## 4. Data & Infrastructure

- **Database**: Postgres (via Supabase)
  - Persistent storage for clinical and operational data
  - Typically organized with schemas per module to keep boundaries clear

- **CMS (Strapi)**:
  - Stores editorial and marketing content
  - Kept logically separate from clinical data for clarity and compliance

- **Hosting**
  - Designed for single PaaS-style deployment (e.g. a single cloud provider)
  - Focus on privacy and compliance (e.g. NDPA-style requirements)

---

## 5. Local Development Overview

Exact commands depend on the package manager and root `package.json` configuration. The typical workflow is:

### 5.1 Install Dependencies

From the repo root:

```bash
# Use the package manager configured for the project
npm install
# or
yarn install
# or
pnpm install
```

Check the root `package.json` to confirm which one is expected.

### 5.2 Environment Configuration

1. Copy the example environment file(s) if present:
   - `.env.example` → `.env`
   - Or similar files for each app (e.g. `apps/*/.env`)

2. Configure:
   - Database connection (Supabase/Postgres URL, credentials)
   - Auth secrets (JWT secrets, OAuth keys, etc.)
   - Strapi configuration (admin credentials, URL)
   - Any external services (email, logging, etc.)

> Never commit real secrets. Keep them only in your local `.env` files or secure secret stores.

### 5.3 Running Apps

Look in the root `package.json` for scripts such as:

- `dev` – start the full dev stack
- `dev:web` or similar – start the frontend app
- `dev:api` or similar – start the backend API
- `dev:cms` – start Strapi

Typical pattern (adjust names to match your scripts):

```bash
# Start backend API (NestJS)
npm run dev:api

# Start frontend (Next.js)
npm run dev:web

# Start CMS (Strapi)
npm run dev:cms
```

Then:

- Frontend might run at something like `http://localhost:3000`
- API might run at something like `http://localhost:4000`
- CMS admin might run at something like `http://localhost:1337/admin`

Always confirm ports and URLs in the respective app configs.

---

## 6. How a Request Flows Through the System

Example: “Show upcoming appointments for a patient”.

1. **User** opens the frontend and navigates to the patient page.
2. **Frontend (Next.js)** calls the backend API (e.g. `GET /api/patients/:id/appointments`).
3. **Backend (NestJS)** routes this to the `AppointmentsModule` controller.
4. The controller calls a service in `AppointmentsModule`, which:
   - Checks patient validity via `PatientsModule`
   - Queries the database for upcoming appointments
5. The service returns DTOs (typed response objects).
6. The controller sends the response as JSON.
7. The **frontend** receives the JSON and renders the appointments list.

If content is needed (e.g. an info banner about appointment policies):

- The frontend also calls the **Strapi CMS API** to fetch that content and renders it alongside the appointments list.

---

## 7. Extending the System (Beginner Roadmap)

If you’re new and want to extend this project:

1. **Explore the apps**
   - Look under `apps/` to see the frontend, backend, and CMS apps.
   - Run them locally and click around to understand what exists.

2. **Explore modules**
   - Look under the modules directory (often `modules/` or `apps/api/src/modules`).
   - Identify a module that interests you (e.g. `patients`, `appointments`).
   - Open it and see:
     - Entity/model file
     - Service file
     - Controller file

3. **Make a small change**
   - Add a field to a DTO and render it in the frontend.
   - Add a simple new endpoint (e.g. `GET /health` or a filtered list).
   - Add or modify a CMS content type and use it in a frontend page.

4. **Respect boundaries**
   - Keep domain logic inside modules.
   - Let apps focus on wiring, configuration, and presentation.

---

## 8. Project Conventions

- **TypeScript everywhere** for strong typing and safer refactors.
- **Modular monolith backend**:
  - Strict domain boundaries
  - Modules communicate via public interfaces and events
  - Database often organized per-module (schema-per-module) to reduce coupling
- **Headless CMS**:
  - Used only for content
  - Clinical data stays in the main database

---

## 9. Glossary (Beginner-Friendly)

- **App**: A runnable program (frontend, backend, or CMS server).
- **Module**: A feature/domain package inside the backend app (patients, appointments, etc.).
- **Monorepo**: One repository that contains many apps and libraries.
- **Headless CMS**: A content management system that exposes content via API instead of rendering pages directly.
- **DTO (Data Transfer Object)**: A TypeScript type/class that defines exactly what data is sent/received over the network.
- **Domain logic**: Rules specific to the business (e.g. “no overlapping appointments”).

---

## 10. Getting Help

If you’re new to these technologies, useful docs are:

- Next.js: https://nextjs.org/docs
- NestJS: https://docs.nestjs.com/
- Strapi: https://docs.strapi.io/
- Supabase: https://supabase.com/docs

Start by understanding how **requests flow** through the system (frontend → backend modules → database) and how **content flows** from Strapi to the frontend. Once that mental model is clear, the rest of the codebase will make much more sense.