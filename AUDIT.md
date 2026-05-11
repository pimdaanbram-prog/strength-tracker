# AUDIT.md — StrengthTracker Fase 0

> Gegenereerd: 2026-05-10 | Branch: `claude/strengthtracker-refactor-1H5GP`
> Status: **READ ONLY** — geen wijzigingen gemaakt

---

## 1. Project Structuur

```
strength-tracker/
├── public/
│   ├── favicon.svg
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── icons.svg
│   ├── manifest.json
│   └── sw.js                        ← handmatige service worker (geen vite-pwa)
├── src/
│   ├── App.tsx                      ← router + install banner (118 regels)
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg                ← ONGEBRUIKT (Vite boilerplate)
│   │   └── vite.svg                 ← ONGEBRUIKT (Vite boilerplate)
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── StatCarousel.tsx         ← 580 regels ⚠️
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ProfileSwitcher.tsx
│   │   ├── ui/
│   │   │   ├── AmbientBackground.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassPill.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── MuscleFigure3D.tsx   ← 574 regels, Three.js 3D model ⚠️
│   │   │   ├── Progress.tsx
│   │   │   ├── SectionLabel.tsx
│   │   │   └── StaggerItem.tsx
│   │   └── workout/
│   │       ├── ExerciseCard.tsx
│   │       ├── MultiPersonExerciseCard.tsx ← 285 regels
│   │       ├── MultiPersonSetLogger.tsx
│   │       ├── RestTimer.tsx
│   │       ├── SamenTrainenSelector.tsx
│   │       ├── SetLogger.tsx
│   │       └── WorkoutBuilder.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── data/
│   │   ├── achievements.ts          ← 278 regels
│   │   ├── exercises.ts             ← 3864 regels ⚠️⚠️⚠️ (150+ oefeningen, statische data)
│   │   ├── themes.ts                ← 562 regels (16 themes)
│   │   └── workoutTemplates.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useExercises.ts
│   │   ├── useGamification.ts
│   │   ├── useLanguage.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePlans.ts
│   │   ├── useProfiles.ts
│   │   ├── useSync.ts               ← 510 regels, custom Supabase sync ⚠️
│   │   ├── useTimer.ts
│   │   ├── useWeekFeedback.ts
│   │   └── useWorkouts.ts           ← 433 regels
│   ├── index.css                    ← design tokens via CSS vars + Tailwind 4 @theme
│   ├── main.tsx
│   ├── pages/
│   │   ├── AchievementsPage.tsx
│   │   ├── Dashboard.tsx            ← 543 regels ⚠️
│   │   ├── ExerciseDetail.tsx       ← 376 regels ⚠️
│   │   ├── ExercisesPage.tsx
│   │   ├── HistoryPage.tsx          ← 280 regels
│   │   ├── MeasurementsPage.tsx     ← 925 regels ⚠️⚠️
│   │   ├── PlanEditPage.tsx
│   │   ├── PlanGeneratorPage.tsx    ← 630 regels ⚠️
│   │   ├── PlansPage.tsx
│   │   ├── ProfileNew.tsx           ← 457 regels ⚠️
│   │   ├── ProfilesPage.tsx
│   │   ├── ProgressPage.tsx         ← 368 regels ⚠️
│   │   ├── SettingsPage.tsx         ← 395 regels ⚠️
│   │   ├── ThemePage.tsx            ← 607 regels ⚠️
│   │   ├── ToolsPage.tsx            ← 991 regels ⚠️⚠️
│   │   ├── WeekFeedback.tsx         ← 311 regels ⚠️
│   │   ├── WorkoutPage.tsx          ← 494 regels ⚠️
│   │   └── auth/
│   │       ├── ForgotPasswordPage.tsx
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── store/
│   │   └── appStore.ts              ← Zustand store (profiles, settings, gamification)
│   └── utils/
│       ├── feedbackEngine.ts
│       ├── localStorage.ts
│       ├── plateCalculator.ts
│       ├── supabase.ts
│       ├── weekUtils.ts
│       └── weightCalculator.ts
├── .gitignore
├── .vercel/                         ← Vercel config (maar app draait op Netlify)
├── APP_SUMMARY.md
├── README.md
├── eslint.config.js
├── index.html
├── netlify.toml
├── package.json
├── package-lock.json
├── server.mjs                       ← Express server? (mogelijk ongebruikt)
├── supabase-schema.sql
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                      ← Vercel redirects (maar app draait op Netlify)
└── vite.config.ts
```

---

## 2. Dependencies Audit

### Huidige afhankelijkheden

| Package | Versie | Status |
|---------|--------|--------|
| `@supabase/supabase-js` | ^2.99.3 (latest: 2.105.4) | Kan geüpdatet worden |
| `framer-motion` | ^12.38.0 | Huidig |
| `lucide-react` | ^0.577.0 (latest: 1.14.0) | **Major update beschikbaar** |
| `react` | ^19.2.4 | Huidig |
| `react-dom` | ^19.2.4 | Huidig |
| `react-router-dom` | ^7.13.1 | Huidig |
| `recharts` | ^3.8.0 | Huidig |
| `three` | ^0.184.0 | Huidig |
| `@types/three` | ^0.184.0 | Huidig |
| `zustand` | ^5.0.12 | Huidig |

### Security vulnerabilities (npm audit)

| Severity | Package | Issue |
|----------|---------|-------|
| **High** | `vite` 8.0.0–8.0.4 | Path traversal, arbitrary file read, `server.fs.deny` bypass |
| **High** | `vite` 8.0.0–8.0.4 | WebSocket arbitrary file read |
| Moderate | `postcss` <8.5.10 | XSS via unescaped `</style>` |
| Moderate | `picomatch` | Dependency van postcss |

**Actie:** `npm audit fix` (werkt alleen in dev, niet in productie build — maar vite moet sowieso geüpdatet worden).

### Ongebruikte packages (depcheck)

Depcheck meldt `tailwindcss` en `typescript` als "unused" — dit zijn false positives (beide worden gebruikt als config-level tools, niet in code geïmporteerd). **Geen echte ongebruikte packages gevonden.**

### Opmerkingen

- **Geen dubbele icon libraries** — alleen Lucide React ✅
- **Geen date library** — datum-manipulatie via pure JS/weekUtils ✅
- **Geen form library** — handmatige controlled inputs ⚠️ (Zod + react-hook-form toevoegen in Fase 3)
- **Geen React Query** — custom sync layer ⚠️ (toevoegen in Fase 4)
- **Geen test framework** — Vitest ontbreekt ⚠️
- **`server.mjs`** — Express server in de root; lijkt ongebruikt (app draait via Netlify static) ⚠️
- **`.vercel/` + `vercel.json`** — app draait op Netlify, niet Vercel; deze files zijn verwarrend ⚠️

---

## 3. Code Smells

### `any` types (7 stuks)

| Bestand | Regel | Context |
|---------|-------|---------|
| `components/ui/Button.tsx` | 64 | `{...(props as any)}` |
| `contexts/AuthContext.tsx` | 10–13 | Return types van `signIn`, `signUp`, `signOut`, `resetPassword` |
| `pages/ProgressPage.tsx` | 19 | `CustomTooltip` prop type (`{ active, payload, label }: any`) |
| `pages/ProgressPage.tsx` | 24 | Recharts payload map (`p: any`) |

**Beoordeling:** Laag aantal, goed te fixen. AuthContext any's zijn Supabase return types die gepreciseerd kunnen worden.

### `@ts-ignore` / `@ts-nocheck`: **0** ✅

### `console.log`: **0** ✅ (wel `console.error` in utils — terecht)

### `TODO` / `FIXME` / `HACK`: **0** ✅

### Grote bestanden (>300 regels)

| Bestand | Regels | Probleem |
|---------|--------|---------|
| `data/exercises.ts` | 3864 | Statische oefeningen-data, zou JSON of lazy-loaded module kunnen zijn |
| `pages/ToolsPage.tsx` | 991 | 5 tools (plate calc, 1RM, macro calc, warmup, TDEE) in één bestand |
| `pages/MeasurementsPage.tsx` | 925 | Lichaamsmaten + gewicht + grafieken in één bestand |
| `pages/PlanGeneratorPage.tsx` | 630 | AI plan generator logica + UI gemengd |
| `pages/ThemePage.tsx` | 607 | Theme picker + custom theme builder in één bestand |
| `components/StatCarousel.tsx` | 580 | Dashboard statistieken carousel, veel berekeningen inline |
| `components/ui/MuscleFigure3D.tsx` | 574 | Three.js 3D figuur, volledig inline geometry |
| `data/themes.ts` | 562 | 16 theme-objecten met ~30 CSS vars elk |
| `pages/Dashboard.tsx` | 543 | Dashboard met meerdere secties |
| `hooks/useSync.ts` | 510 | Custom Supabase sync layer |
| `pages/WorkoutPage.tsx` | 494 | Workout logger met solo/multi modus |
| `pages/ProfileNew.tsx` | 457 | Multi-step onboarding form |
| `hooks/useWorkouts.ts` | 433 | Workout CRUD + PR tracking |
| `pages/SettingsPage.tsx` | 395 | Instellingen met gewichtsconfiguratie |
| `pages/ExerciseDetail.tsx` | 376 | Exercise detail + berekeningen |
| `pages/ProgressPage.tsx` | 368 | Analytics met grafieken |
| `pages/WeekFeedback.tsx` | 311 | Wekelijkse AI feedback |

### Dode assets

- `src/assets/react.svg` — Vite boilerplate, ongebruikt
- `src/assets/vite.svg` — Vite boilerplate, ongebruikt

### Mogelijk ongebruikte files

- `server.mjs` — Express server in root; app is een SPA op Netlify, vermoedelijk achtergebleven
- `vercel.json` + `.vercel/` — app draait op Netlify

### Dubbele logica

- `useLocalStorage.ts` hook én `utils/localStorage.ts` util — twee manieren om localStorage te wrappen
- `StatCarousel.tsx` bevat PR-berekeningen die ook in `useWorkouts.ts` gedaan kunnen worden
- Measurements data opgeslagen in `localStorage.getItem('st-measurements')` direct in MeasurementsPage (geen hook), terwijl de rest via `utils/localStorage.ts` gaat

### Inline styles (hoog volume)

- **1034 inline styles** in TSX bestanden
- **465 hardcoded `px` waarden** in TSX
- Vrijwel alle kleuren en spacing gaan via CSS variables (`var(--theme-*)`) — dat is goed — maar de `style={{...}}` props zijn heel talrijk

---

## 4. Supabase

### Database schema

| Tabel | Columns (key) | RLS | Realtime |
|-------|--------------|-----|---------|
| `training_profiles` | id, account_id, name, gender, age, weight, height, fitness_level, goals[], available_equipment[], avatar, color, created_at, updated_at | ✅ Users manage own | ✅ |
| `workout_sessions` | id, account_id, profile_id, date, week_number, year, day_label, workout_name, exercises (JSONB), duration_minutes, notes, completed_at | ✅ Users manage own | ✅ |
| `week_logs` | id, account_id, profile_id, week_number, year, sessions[], feedback_generated, feedback (JSONB) | ✅ Users manage own | ✅ |
| `workout_plans` | id, account_id, name, exercises (JSONB), created_at, last_used_at, updated_at | ✅ Users manage own | ✅ |

**Opmerking:** Metingen (`BodyWeight`, `BodyMeasurement`) worden **niet gesynchroniseerd naar Supabase** — deze worden alleen lokaal opgeslagen in `localStorage`. Dit is een potentieel verlies van data bij wisselen van apparaat.

### RLS Policies

Alle 4 tabellen hebben een enkelvoudige `FOR ALL` policy met `auth.uid() = account_id`. Dit is correct en veilig.

### Queries

Alle Supabase queries zitten in `hooks/useSync.ts`:

| Query | Type | Probleem |
|-------|------|---------|
| `.from('training_profiles').select('*')` | SELECT | Wildcard select — haalt alle kolommen op |
| `.from('workout_sessions').select('*')` | SELECT | Wildcard select |
| `.from('workout_plans').select('*')` | SELECT | Wildcard select |
| `.from('workout_sessions').select('id').limit(1)` | SELECT | Correct |
| `.from('training_profiles').upsert(...)` | UPSERT | OK |
| `.from('workout_sessions').upsert(...)` | UPSERT | OK |
| `.from('workout_plans').upsert(...)` | UPSERT | OK |
| `.from('week_logs').upsert(...)` | UPSERT | OK |
| `.from('training_profiles').delete().eq('id', id)` | DELETE | OK |
| `.from('workout_sessions').delete().eq('id', id)` | DELETE | OK |
| `.from('workout_plans').delete().eq('id', id)` | DELETE | OK |

**N+1 patroon:** De sync haalt alles in bulk op (geen N+1). ✅

**Sync architectuur:** De app gebruikt een custom pull/push sync via `useSync` die:
1. Bij inloggen alle data van Supabase naar localStorage trekt
2. Bij elke wijziging direct naar Supabase pusht (geen queue/retry)
3. Geen optimistic updates heeft
4. Geen conflict resolution heeft bij simultaan gebruik

Dit werkt maar is fragiel — zou idealiter vervangen worden door React Query met optimistic updates (Fase 4).

### Ontbrekende indexes

Waarschijnlijk ontbreken indexes op `workout_sessions(account_id)`, `workout_sessions(profile_id)`, etc. — te checken via Supabase dashboard. Niet verifieerbaar zonder live database toegang.

---

## 5. Performance

### Build output

| Chunk | Grootte | Gzip |
|-------|---------|------|
| `MuscleFigure3D-*.js` | 529 kB | 133 kB |
| `index-*.js` | 1,375 kB | 368 kB |
| `index-*.css` | 50 kB | 9.7 kB |
| **Totaal JS gzip** | | **~502 kB** |

**Doel:** < 200 kB gzipped main bundle. Nu is het **2.5× te groot.**

### Grootste bundel-bijdragers (geschat)

1. **`three`** — 3D library, ~400 kB minified. Alleen gebruikt door `MuscleFigure3D.tsx`. Al lazy-loaded op ProgressPage. Maar de Three.js types zijn ook in de main bundle via `@types/three` (alleen dev, dus OK).
2. **`framer-motion`** — animatie library, ~100 kB. Op elke pagina gebruikt.
3. **`recharts`** — grafiek library, ~200 kB. Alleen op ProgressPage en MeasurementsPage.
4. **`exercises.ts`** — 3864 regels statische data, ~150 kB. Altijd ingeladen.
5. **Alle pages eager-loaded** — geen route-level code splitting (behalve MuscleFigure3D).

### Code splitting status

- **Alleen `MuscleFigure3D` is lazy-loaded** via `React.lazy()` op ProgressPage
- Alle 20+ pagina's worden eager-loaded in de main bundle
- Geen `React.lazy()` per route

### Aanbevelingen

1. Route-level lazy loading voor alle pagina's (~15 routes)
2. `recharts` lazy loaden (alleen op Progress + Measurements pagina's)
3. `exercises.ts` als JSON exporteren + dynamisch importeren
4. `framer-motion` onderzoeken of `LazyMotion` + features bundel kleiner kan

---

## 6. Styling

### Design system status

**Positief:**
- Design tokens zijn goed opgezet via CSS custom properties (`--theme-*`) in `index.css`
- Tailwind 4 `@theme` blok koppelt tokens aan Tailwind classes ✅
- Alle 16 themes gebruiken dezelfde token-namen ✅
- Geen hardcoded kleuren in Tailwind classes (`text-red-500` e.d.) — alles via `text-accent` etc. ✅

**Problemen:**
- **1034 inline `style={{}}` props** — dit omzeilt Tailwind volledig en maakt theming broos
- **465 hardcoded `px` waarden** in `style={{}}` props (bijv. `style={{ fontSize: '13px', marginTop: '6px' }}`)
- Sommige inline styles hergebruiken CSS vars correct (`style={{ color: 'var(--theme-accent)' }}`), maar anderen gebruiken hardcoded waarden
- Geen Tailwind config file — alles via `@theme` in CSS (Tailwind 4 stijl, correct)
- Fonts laden via Google Fonts CDN (3 families: Space Grotesk, JetBrains Mono, Inter) — geen self-hosting, geen subsetting

### Telfontgrootten (hardcoded in inline styles)

Voorbeelden gevonden: `11px`, `12px`, `13px`, `14px`, `15px`, `16px`, `18px`, `20px`, `24px` etc. — geen systematisch gebruik van Tailwind typography scale.

---

## 7. Themes

### Overzicht (16 themes)

| ID | Naam | Donker? | Bijzonderheden |
|----|------|---------|---------------|
| `default-dark` | Tangerine | ✅ | Default theme, oranje accent |
| `midnight-purple` | Midnight Purple | ✅ | |
| `forest-green` | Forest Green | ✅ | |
| `sunset-orange` | Sunset Orange | ✅ | |
| `ocean-blue` | Ocean Blue | ✅ | |
| `blood-red` | Blood Red | ✅ | |
| `clean-light` | Clean Light | ❌ | Licht theme |
| `cream-light` | Cream Light | ❌ | Licht theme |
| `neon-cyber` | Neon Cyber | ✅ | High contrast |
| `rose-gold` | Rose Gold | ✅ | |
| `arctic-ice` | Arctic Ice | ✅ | |
| `volcano` | Volcano | ✅ | |
| `synthwave` | Synthwave | ✅ | |
| `military` | Military | ✅ | |
| `bubblegum` | Bubblegum | ❌ | Licht theme |
| `gold-premium` | Gold Premium | ✅ | |

**16 themes** — meer dan verwacht. Geen obvious duplicaten.

### Problemen

- Lichte themes (`clean-light`, `cream-light`, `bubblegum`) missen sommige variabelen die de donkere themes wél hebben (bijv. `--theme-accent-hi`, `--theme-glass-hi`) — `applyTheme()` in ThemeContext.tsx heeft workarounds hiervoor
- WCAG AA contrast niet gevalideerd — sommige muted text colors (`rgba(235,235,245,0.45)`) zijn mogelijk te laag contrast
- Custom themes: `MAX_CUSTOM_THEMES = 3` — gebruikers kunnen max 3 eigen themes maken
- ThemePage (607 regels) combineert theme picker + custom theme builder + preview

---

## 8. PWA

### Checklist

| Item | Status | Opmerking |
|------|--------|----------|
| `manifest.json` aanwezig | ✅ | |
| Service worker registratie | ✅ | Via inline script in `index.html` |
| App icons (192px, 512px) | ✅ | PNG formaat |
| Apple touch icon | ✅ | |
| `apple-mobile-web-app-capable` | ✅ | |
| Offline strategie | ⚠️ | Stale-while-revalidate voor alles |
| `display: standalone` | ✅ | |
| Install prompt UX | ✅ | Banner in `App.tsx` met dismiss |
| SW scope / start_url | ✅ | |
| Splash screens | ❌ | Niet geconfigureerd |
| Maskable icon purpose | ⚠️ | Beide icons hebben `"purpose": "any maskable"` — dit is incorrect; `any` en `maskable` moeten aparte entries zijn |
| SW cache versie | ⚠️ | `strength-tracker-v1` — hardcoded, moet bij elke build gebumpt worden |

### Service Worker strategie

De huidige SW gebruikt **stale-while-revalidate** voor alle GET requests:
1. Return cached versie direct (snel)
2. Fetch network op achtergrond
3. Update cache

**Probleem:** Supabase API calls worden ook gecached — dit kan leiden tot verouderde data. Supabase calls zouden **network-first** moeten zijn.

---

## 9. Prioriteitsmatrix

> Impact × Moeite — **P1 = Hoog impact, Laag moeite** (direct doen)

### P1 — Hoog impact, Laag moeite

| # | Item | Fase | Impact | Actie |
|---|------|------|--------|-------|
| 1 | **Vite security vulnerabilities** (2 high, 2 moderate) | Fase 1 | 🔴 Security | `npm audit fix` |
| 2 | **Route-level code splitting** — alle 20 pages eager-loaded | Fase 5 | 🟠 Perf | `React.lazy()` per route |
| 3 | **`recharts` lazy loaden** — zit in main bundle, alleen op 2 pagina's gebruikt | Fase 5 | 🟠 Perf | Dynamic import |
| 4 | **`any` types fixen** (7 stuks, duidelijk te vervangen) | Fase 3 | 🟡 Type safety | Supabase types gebruiken |
| 5 | **Ongebruikte assets verwijderen** (react.svg, vite.svg, .vercel/, vercel.json) | Fase 1 | 🟢 Cleanup | Delete |
| 6 | **PWA manifest icon fix** (`any maskable` splitsen) | Fase 8 | 🟡 PWA score | Manifest aanpassen |

### P2 — Hoog impact, Gemiddelde moeite

| # | Item | Fase | Impact | Actie |
|---|------|------|--------|-------|
| 7 | **Feature-first folder structuur** — alles flat in components/pages/hooks | Fase 2 | 🟡 Onderhoudbaarheid | Reorganiseren |
| 8 | **ToolsPage splitsen** (991 regels, 5 tools) | Fase 2 | 🟡 Leesbaarheid | 5 sub-componenten |
| 9 | **MeasurementsPage splitsen** (925 regels) | Fase 2 | 🟡 Leesbaarheid | WeightSection + MeasurementsSection |
| 10 | **React Query introduceren** — custom sync vervangen | Fase 4 | 🟠 Betrouwbaarheid | TanStack Query |
| 11 | **Inline styles verminderen** (1034 stuks) | Fase 6 | 🟡 Design system | Tailwind classes |
| 12 | **Measurements naar Supabase** — nu alleen lokaal opgeslagen | Fase 4 | 🟠 Data veiligheid | Supabase tabel toevoegen |
| 13 | **SW fix voor Supabase calls** — nu gecached, moet network-first | Fase 8 | 🟠 Data correctheid | SW aanpassen |
| 14 | **exercises.ts als lazy JSON** (3864 regels statische data) | Fase 5 | 🟠 Perf | JSON + dynamic import |

### P3 — Gemiddelde impact, Hoge moeite

| # | Item | Fase | Impact | Actie |
|---|------|------|--------|-------|
| 15 | **Vitest unit tests** | Fase 7 | 🟡 Kwaliteit | Setup + tests schrijven |
| 16 | **Playwright e2e tests** | Fase 7 | 🟡 Kwaliteit | Smoke tests per hoofdflow |
| 17 | **Listenercleanup voor Supabase Realtime** | Fase 4 | 🟡 Memory | Cleanup toevoegen |
| 18 | **Zod form validation** | Fase 3 | 🟡 Robuustheid | Schemas per feature |
| 19 | **List virtualisation** (exercises 150+, history) | Fase 5 | 🟡 Perf mobile | `@tanstack/react-virtual` |
| 20 | **Font self-hosting** | Fase 6 | 🟢 Perf | `@fontsource` of inline |
| 21 | **Husky + lint-staged** CI gate | Fase 7 | 🟡 DX | Pre-commit hook |

---

## 10. Samenvatting Kerncijfers

| Metric | Waarde | Doel |
|--------|--------|------|
| TypeScript `any` types | 7 | 0 |
| `@ts-ignore` | 0 | 0 ✅ |
| `console.log` | 0 | 0 ✅ |
| TODO/FIXME | 0 | 0 ✅ |
| Main bundle (gzip) | ~502 kB | < 200 kB |
| Bestanden >300 regels | 17 | 0 (ideaal), < 5 (realistisch) |
| Inline styles | 1034 | < 100 |
| Code split routes | 1/20 | 20/20 |
| Themes | 16 | 16 (geen verwijderen nodig) |
| Security vulnerabilities | 4 (2 high) | 0 |
| Test coverage | 0% | > 70% utils |
| Supabase wildcard selects | 3 | 0 |
| Meetdata in Supabase | ❌ | ✅ |

---

## 11. Wat er NIET verandert

De volgende dingen werken goed en hoeven niet aangepakt te worden:
- Zustand store voor lokale state — goed geïmplementeerd met `persist` middleware en `merge`
- Design token systeem via CSS vars — solide basis
- RLS policies op Supabase — correct en veilig
- 16 themes — geen duplicaten, geen verwijderen nodig
- Lucide React als enige icon library
- Geen dubbele date libraries
- TypeScript strict mode — al aan (`"strict": true` in tsconfig.app.json)
- `noUnusedLocals` en `noUnusedParameters` — al aan
- PWA install flow — werkt correct
- Multi-profiel architectuur — goed opgezet in Zustand

---

*Klaar voor Fase 1 zodra je akkoord geeft.*
