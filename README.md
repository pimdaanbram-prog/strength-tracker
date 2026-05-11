# Strength Tracker

Een progressieve web-app (PWA) voor het bijhouden van krachttreinen, meten van voortgang en sterker worden.

## Wat doet de app

- **Training loggen** — sets, gewichten en reps per oefening vastleggen
- **Voortgang volgen** — grafieken van gewichtsprogressie per oefening, PR-overzicht
- **Plannen beheren** — trainingsplannen aanmaken en hergebruiken
- **Week feedback** — automatische analyse van trainingsweek met aanbevelingen
- **Metingen bijhouden** — lichaamsgewicht en andere maten
- **Multi-profiel** — meerdere profielen per account (gezin, atleten)
- **Cloud sync** — data wordt gesynchroniseerd via Supabase
- **Offline-first** — werkt zonder internetverbinding als PWA

## Tech stack

| Laag | Technologie |
|---|---|
| Framework | React 19 |
| Taal | TypeScript 5.9 |
| Build | Vite 8 + Rolldown |
| Styling | Tailwind CSS 4 |
| Animaties | Framer Motion 12 |
| Backend | Supabase (Auth + PostgreSQL) |
| State | Zustand 5 |
| Routing | React Router 7 |
| Charts | Recharts 3 |
| 3D | Three.js |
| Tests | Vitest 4 |
| Deploy | Netlify |

## Setup

### Vereisten
- Node.js ≥ 20
- npm ≥ 10
- Een Supabase project ([supabase.com](https://supabase.com))

### 1. Clone

```bash
git clone https://github.com/pimdaanbram-prog/strength-tracker.git
cd strength-tracker
```

### 2. Installeer dependencies

```bash
npm install
```

### 3. Maak `.env.local` aan

```bash
cp .env.example .env.local
```

Vul in:

```env
VITE_SUPABASE_URL=https://<jouw-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<jouw-anon-key>
```

### 4. Supabase tabellen aanmaken

Voer het SQL script uit in de Supabase SQL Editor:

```sql
-- training_profiles
create table training_profiles (
  id text primary key,
  account_id uuid references auth.users not null,
  name text,
  gender text,
  age integer,
  weight numeric,
  height numeric,
  fitness_level text,
  goals text[],
  available_equipment text[],
  created_at timestamptz default now(),
  avatar text,
  color text
);
alter table training_profiles enable row level security;
create policy "Own profiles" on training_profiles using (auth.uid() = account_id);

-- workout_sessions
create table workout_sessions (
  id text primary key,
  account_id uuid references auth.users not null,
  profile_id text,
  date date,
  week_number integer,
  year integer,
  day_label text,
  workout_name text,
  exercises jsonb default '[]',
  duration_minutes integer,
  notes text,
  completed_at timestamptz
);
alter table workout_sessions enable row level security;
create policy "Own sessions" on workout_sessions using (auth.uid() = account_id);

-- week_logs
create table week_logs (
  id bigserial primary key,
  account_id uuid references auth.users not null,
  profile_id text,
  week_number integer,
  year integer,
  sessions text[],
  feedback_generated boolean default false,
  feedback jsonb
);
alter table week_logs enable row level security;
create policy "Own week logs" on week_logs using (auth.uid() = account_id);

-- workout_plans
create table workout_plans (
  id text primary key,
  account_id uuid references auth.users not null,
  name text,
  exercises jsonb default '[]',
  created_at timestamptz default now(),
  last_used_at timestamptz
);
alter table workout_plans enable row level security;
create policy "Own plans" on workout_plans using (auth.uid() = account_id);
```

### 5. Start de dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script | Omschrijving |
|---|---|
| `npm run dev` | Dev server starten |
| `npm run build` | Productie build |
| `npm run preview` | Productie build lokaal bekijken |
| `npm run lint` | ESLint uitvoeren |
| `npm run typecheck` | TypeScript check zonder build |
| `npm test` | Unit tests uitvoeren |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:ui` | Vitest UI in browser |

## Deployment

De app wordt automatisch gedeployed naar Netlify bij een push naar `main`.

Stel de environment variables in via Netlify → Site settings → Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Architectuur

```
src/
├── App.tsx              # Router + providers + lazy routes
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind + CSS tokens
├── components/
│   ├── layout/          # Header, BottomNav, PageWrapper
│   └── ui/              # Button, Card, Skeleton, Modal, ...
├── contexts/            # AuthContext, ThemeContext, ToastContext
├── data/                # exercises.ts, themes.ts, achievements.ts
├── hooks/               # useSync, useWorkouts, useExercises, ...
├── pages/               # 20 pagina's (lazy-loaded per route)
│   └── auth/            # LoginPage, RegisterPage, ForgotPasswordPage
├── store/               # appStore.ts (Zustand)
├── test/                # Vitest setup
└── utils/               # plateCalculator, weightCalculator, weekUtils, feedbackEngine
```
