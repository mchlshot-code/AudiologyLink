# AudiologyLink — Developer Guide
## Solo Developer Edition · MVP Phase 1

You are building a healthcare platform for Nigerian audiology.
You are one developer. Build accordingly — simple, secure, and shippable.

---

## The Stack (Don't Change This)

| Layer | Technology |
|---|---|
| Frontend | Next.js (TypeScript), TailwindCSS, shadcn/ui |
| Backend | NestJS (Modular Monolith) |
| Database | PostgreSQL via Supabase |
| CMS | Strapi (Headless) |
| Sessions | Redis via Railway |
| Storage | Supabase Storage |
| Hosting | Vercel (frontend), Railway (backend + CMS) |

No Docker in production. No VPS. No self-hosted anything.

---

## The Three Rules That Actually Matter

These three rules protect patient data and keep the codebase from becoming a mess. Everything else is guidance, not gospel.

### Rule 1 — RLS on every database table. Always.
Every table you create must have Row Level Security enabled before you write any application code against it. No exceptions. This is your NDPA compliance foundation.

```sql
-- Do this immediately after CREATE TABLE
ALTER TABLE education.your_table ENABLE ROW LEVEL SECURITY;
-- Then write the policy before writing any app code
```

### Rule 2 — The frontend never touches the database directly.
All data access goes through the NestJS backend. No Supabase client in the frontend. No anon key exposed. The service role key lives only in your backend `.env`.

### Rule 3 — CMS content and clinical data never mix.
Strapi holds course content, articles, and public resources.
NestJS holds student progress, quiz scores, patient records, and anything health-related.
Never put health data in Strapi. Never call Strapi from the backend.

---

## Project Structure

```
/apps
  /frontend     → Next.js (Vercel)
  /backend      → NestJS (Railway)
  /cms          → Strapi (Railway)
```

### Backend Module Structure
Every feature lives in its own module folder. Keep this shape:

```
/modules/ModuleName
  /contracts      ← DTOs, interfaces, events (what other modules can see)
  /domain         ← business logic, repository interface
  /infrastructure ← database queries, external adapters
  /features       ← one folder per endpoint
    /FeatureName
      endpoint.ts
      handler.ts
      validator.ts  (optional)
```

**The one import rule:** Other modules may only import from a module's `/contracts` folder. Never import from `/domain` or `/infrastructure` of another module.

---

## Current Build State

### ✅ Done
- Auth module — login, register, refresh, logout, me
- JWT via HTTP-only cookies (access + refresh)
- Roles: `admin`, `student`, `patient`, `clinician`, `receptionist`
- Education module — student_profiles, course_enrollments, lesson_progress, quiz_attempts tables (all with RLS)
- Education endpoints: RegisterStudent, VerifyStudent, EnrollInCourse, TrackLessonProgress, SubmitQuizAttempt, GetStudentProgress
- Strapi content types: Category, Resource, Course, Lesson, Quiz
- Frontend pages wired to real APIs: `/resources`, `/courses`, `/hub`, lesson player, quiz engine
- EventEmitter2 event bus running in app.module.ts

### 🔨 Build Next (in this order)
1. **Notification module** — email on student registration + verification approval
2. **Fix quiz scoring** — move answer evaluation to the backend (currently client-computes score, which is a security gap)
3. **Noise Monitoring module** — after Education Hub is stable
4. **PTM Tinnitus module** — after Noise Monitoring

### 🚫 Do Not Build Yet
- Clinician dashboard (Phase 2)
- Patient roster management (Phase 2)
- Appointment booking (not in MVP scope)
- Live classes, forums, SCORM player (not in MVP scope)

---

## Authentication Rules

Tokens live in HTTP-only cookies. That's it.

```typescript
// ✅ Correct — reading cookies in a Next.js server component
import { cookies } from 'next/headers'

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education/progress/overview`, {
  headers: { Cookie: cookies().toString() },
  cache: 'no-store'
})

// ❌ Wrong — credentials: 'include' only works in browser fetch, not server components
```

Never store a token in localStorage. Never return a token in a JSON response body.

---

## Frontend Data Fetching Pattern

Two sources, never mixed in a single call:

```typescript
// Public pages → Strapi only, with ISR caching
const content = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/courses`, {
  next: { revalidate: 3600 }
})

// Protected pages → Strapi for content + NestJS for progress, merged in component
const [content, progress] = await Promise.all([
  fetch(`${CMS_URL}/api/courses?filters[slug]=${slug}`, { next: { revalidate: 3600 } }),
  fetch(`${API_URL}/api/education/progress/overview`, {
    headers: { Cookie: cookies().toString() },
    cache: 'no-store'
  })
])
```

Always handle errors and loading states. Never let an unhandled rejection crash the page.

---

## Database Rules

- One Supabase project per environment (dev, production)
- Each module owns its own PostgreSQL schema — `education.*`, `notification.*`, etc.
- No SQL joins across schemas
- Service role key: backend `.env` only, never committed, never in frontend
- Anon key: never used

---

## Brand & UI

Colours are defined as CSS custom properties in `globals.css`. Use the tokens, not hex values.

| Token | Colour | Use For |
|---|---|---|
| `--primary` | Deep navy `#1B3A5C` | Headings, trust elements |
| `--brand-cyan` | Cyan `#00B4D8` | Active states, links |
| `--destructive` | Coral `#E63946` | Errors, warnings |
| `--success` | Green `#16A34A` | Health indicators |

Use shadcn/ui components. Don't invent new UI patterns when an existing component works.

MVP sidebar navigation: **Education Hub, Noise Monitor, Settings** only.
Do not add Patients, Appointments, or Clinicians to the sidebar — those are Phase 2.

---

## Known Technical Debt (Fix Before Public Launch)

- **Quiz scoring is client-computed.** A student can fake their score by modifying the request. Fix by sending raw answers to the backend and evaluating there.
- **education.repository.ts is a shared horizontal repository.** Works for now, but ideally each feature slice owns its own data access. Low priority.
- **No email notifications yet.** Students register into a void. Notification module is the next build task.

---

## Environment Variables

Keep `.env.example` updated whenever you add a new variable. Never commit `.env`.

```
# Backend
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
REDIS_URL=
CORS_ORIGIN=
AUTH_SEED_EMAIL=
AUTH_SEED_PASSWORD=
AUTH_SEED_ROLES=

# Email (Notification module)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CMS_URL=
```

---

## Local Development

Three terminals:

```bash
# Terminal 1
cd apps/backend && npm run start:dev   # → port 3001

# Terminal 2
cd apps/frontend && npm run dev        # → port 3000

# Terminal 3
cd apps/cms && npm run develop         # → port 1337
```

No Docker. Database is your live Supabase project via `DATABASE_URL`.

---

## NDPA Compliance Checklist

- [ ] Supabase DPA signed and stored at `docs/legal/supabase-dpa.pdf`
- [ ] DPIA completed before first real patient onboarded — `docs/legal/dpia.md`
- [ ] Patient onboarding consent mentions cross-border data processing
- [ ] RLS enabled on every table
- [ ] No direct database access from frontend or CMS

---

## When You're Unsure What to Do

1. Does this new feature belong in an existing module? Put it there.
2. Does it need its own schema? Create a new module.
3. Is it content or clinical data? Content → Strapi. Clinical → NestJS backend.
4. Is it Phase 2? Don't build it now. Add it to the "Do Not Build Yet" list above.

Build the thing that helps real Nigerian audiology patients first.
Keep it simple. Keep it secure. Ship it.