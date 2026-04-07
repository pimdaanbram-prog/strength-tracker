# Strength Tracker — App Samenvatting

## Wat is het?
Een krachttraining tracking app gebouwd als React PWA. Gebruikers loggen workouts, zien progressie, krijgen wekelijkse AI-feedback en kunnen de app installeren op telefoon of laptop. Data wordt opgeslagen in Supabase (cloud) zodat het werkt op meerdere apparaten.

## Live URL
**https://strengttracker.netlify.app**

## Tech Stack
| Onderdeel | Technologie |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + localStorage |
| Backend/Auth | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting | Netlify (auto-deploy via GitHub) |
| Grafieken | Recharts |
| Routing | React Router v6 |
| PWA | Vite PWA Plugin + Web App Manifest |

---

## Schermen / Pagina's

### Authenticatie (public)
| Route | Bestand | Functie |
|-------|---------|---------|
| `/login` | `src/pages/auth/LoginPage.tsx` | Email + wachtwoord inloggen |
| `/register` | `src/pages/auth/RegisterPage.tsx` | Nieuw account aanmaken |
| `/forgot-password` | `src/pages/auth/ForgotPasswordPage.tsx` | Wachtwoord reset via email |

### App (protected — vereisen inlog)
| Route | Bestand | Functie |
|-------|---------|---------|
| `/` | `src/pages/Dashboard.tsx` | Homescherm: stats, week streak, PRs, suggestie volgende workout |
| `/workout` | `src/pages/WorkoutPage.tsx` | Workout loggen (solo + samen trainen) |
| `/exercises` | `src/pages/ExercisesPage.tsx` | Oefeningen bibliotheek met zoeken en filteren |
| `/exercises/:id` | `src/pages/ExerciseDetail.tsx` | Detail oefening: instructies, tips, aanbevolen gewichten |
| `/history` | `src/pages/HistoryPage.tsx` | Workout geschiedenis per week |
| `/progress` | `src/pages/ProgressPage.tsx` | Analytics: volume grafiek, PR tracker, per oefening |
| `/profiles` | `src/pages/ProfilesPage.tsx` | Profielen beheren (switchen, verwijderen) |
| `/profiles/new` | `src/pages/ProfileNew.tsx` | Nieuw trainingsprofiel aanmaken |
| `/week-feedback` | `src/pages/WeekFeedback.tsx` | AI-gegenereerde wekelijkse feedback |

---

## Kernfuncties

### Multi-profiel
- Meerdere trainingsprofielen per account (bijv. Pim + Lisa)
- Elk profiel heeft eigen workouts, statistieken, PRs en feedback
- Profielen switchen via de header dropdown

### Workout loggen
- **Solo**: 1 persoon logt sets (gewicht, reps, RPE, seconden voor cardio)
- **Samen trainen**: Meerdere profielen tegelijk, elk met eigen sets
- Rust timer tussen sets
- Aanbevolen gewichten op basis van profiel (geslacht, gewicht, niveau)
- Automatische suggestie: Training A of B (wisselt per dag)

### Oefeningen bibliotheek
- 50+ oefeningen, tweetalig (NL + EN)
- Filters op categorie (Borst, Rug, Benen, Schouders, etc.)
- Per oefening: instructies, tips, veelgemaakte fouten, aanbevolen gewichten per niveau

### Progressie
- Persoonlijke records bijgehouden per oefening
- Weekvolume grafiek (totaal gewicht per week)
- Lichaamsdeelfrequentie (welke spiergroepen hoe vaak)
- Per oefening: history grafiek

### Wekelijkse feedback
- Automatisch gegenereerd bij bekijken van feedback pagina
- Vergelijkt huidige week met vorige week
- Status per oefening: verbeterd / gelijk / teruggang / nieuw
- Aanbevelingen voor volgende week
- Sterke punten en verbeterpunten

### PWA
- Installeerbaar op iPhone (Safari → Deel → Zet op beginscherm)
- Installeerbaar op Android/Mac/Windows (Chrome/Edge banner)
- Werkt offline via localStorage

---

## Data Model

### UserProfile
```
id, name, gender, age, weight, height, fitnessLevel, goals[], availableEquipment[], avatar (emoji), color (hex)
```

### WorkoutSession
```
id, profileId, date, weekNumber, year, dayLabel, workoutName, exercises[], durationMinutes, notes, completedAt
```

### Exercise (in session)
```
exerciseId, sets[{ setNumber, weight, reps, seconds, completed, rpe }], notes
```

### WeekLog
```
profileId, weekNumber, year, sessions[], feedbackGenerated, feedback{}
```

---

## Bestandsstructuur

```
src/
├── pages/
│   ├── auth/           — Login, Register, ForgotPassword
│   ├── Dashboard.tsx
│   ├── WorkoutPage.tsx
│   ├── ExercisesPage.tsx
│   ├── ExerciseDetail.tsx
│   ├── HistoryPage.tsx
│   ├── ProgressPage.tsx
│   ├── ProfilesPage.tsx
│   ├── ProfileNew.tsx
│   └── WeekFeedback.tsx
├── components/
│   ├── ui/             — Button, Input, Card, Badge, Modal, Progress
│   ├── layout/         — BottomNav, Header, PageWrapper
│   ├── profile/        — ProfileCard, ProfileForm, ProfileSwitcher
│   ├── workout/        — ExerciseCard, SetLogger, WorkoutBuilder, RestTimer, SamenTrainenSelector
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts      — Supabase auth (login/logout/register)
│   ├── useProfiles.ts  — Trainingsprofielen CRUD
│   ├── useWorkouts.ts  — Sessies + week logs CRUD
│   ├── useExercises.ts — Oefeningen bibliotheek
│   ├── useSync.ts      — Cloud sync naar Supabase
│   ├── useTimer.ts     — Stopwatch + countdown timer
│   ├── useWeekFeedback.ts — Feedback genereren
│   └── useLocalStorage.ts — Generic localStorage hook
├── store/
│   └── appStore.ts     — Zustand store (profielen + activeProfileId)
├── data/
│   ├── exercises.ts    — 50+ oefeningen met alle data
│   └── workoutTemplates.ts — Workout templates (A/B/etc)
├── utils/
│   ├── supabase.ts     — Supabase client
│   ├── localStorage.ts — Storage keys + helpers
│   ├── weekUtils.ts    — Datum/week berekeningen (NL)
│   ├── weightCalculator.ts — Aanbevolen gewicht berekening
│   └── feedbackEngine.ts — Wekelijkse feedback algoritme
└── contexts/
    └── AuthContext.tsx — Auth provider voor hele app
```

---

## Supabase (Backend)

**Project:** Musclebuild
**URL:** https://rmhqaktgmonteffxercz.supabase.co

### Database tabellen
| Tabel | Inhoud |
|-------|--------|
| `training_profiles` | Trainingsprofielen per account |
| `workout_sessions` | Workout sessies met exercises als JSONB |
| `week_logs` | Wekelijkse logs met AI-feedback |

- **Row Level Security** op alle tabellen — users zien alleen eigen data
- **Realtime** ingeschakeld op alle tabellen

### Env variabelen (.env.local)
```
VITE_SUPABASE_URL=https://rmhqaktgmonteffxercz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## Netlify (Hosting)

- **Auto-deploy** bij git push naar main
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Redirects:** alle routes → `index.html` (SPA routing)
- **Environment variables** ingesteld in Netlify dashboard

---

## Wat werkt
- Registreren en inloggen
- Meerdere trainingsprofielen aanmaken
- Workouts loggen (solo + samen)
- Oefeningen bibliotheek browsen
- Workout geschiedenis bekijken
- Progressie grafieken
- Wekelijkse AI-feedback
- PWA installeerbaar
- Live op Netlify

## Wat nog TODO is
- **Data sync nog niet volledig actief**: `useSync.ts` bestaat maar wordt niet overal aangeroepen. Data slaat nu op in `localStorage`, niet automatisch gesynchroniseerd naar Supabase bij elke actie.
- Cross-device sync werkt pas als `pushProfile()`, `pushSession()`, `pushWeekLog()` worden aangeroepen vanuit `useProfiles.ts` en `useWorkouts.ts` bij elke create/update/delete.
