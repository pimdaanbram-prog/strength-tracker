# Changelog

## [2.1.0] — 2026-06-10

### Added
- **1RM-module** (`features/tools/utils/oneRepMax.ts`): Epley, Brzycki en Lombardi formules + gemiddelde schatting, inverse berekening en %1RM-tabel
- **Sterkte-standaarden** (`features/tools/utils/strengthStandards.ts`): niveau-classificatie (ongetraind → elite) voor squat/bench/deadlift/OHP/row, gecorrigeerd voor leeftijd, geslacht en lichaamsgewicht — nieuwe toolkaart op de Tools-pagina
- **Geavanceerde set-types** in de set-logger: warm-up, dropset, AMRAP en failure (tik op het setlabel om te wisselen). Warm-up sets tellen niet mee voor PR-detectie. Opslag in bestaand JSONB-veld — geen Supabase-migratie nodig
- **Fuzzy search** (`shared/lib/fuzzySearch.ts`) in de oefeningenbibliotheek: tolerant voor typefouten en afkortingen (rdl, ohp), beste match eerst
- **CSV-export** voor workouts (één rij per set) en metingen + **JSON-backup import** in Instellingen → Data
- **Dashboard-upgrade**: volume-trend grafiek (laatste 8 weken, lazy-loaded Recharts-chunk), week-vs-week volumedelta, PR's-deze-maand, deterministische "Tip van de dag"-engine en een "Snel naar"-grid
- **Alternatieven-engine** (`features/exercises/utils/alternatives.ts`): vervangende oefeningen op basis van gedeelde spiergroepen, gefilterd/gerangschikt op beschikbaar materiaal uit het profiel — zichtbaar op de oefening-detailpagina
- **Voice-over** (`shared/hooks/useSpeech.ts`, Web Speech API): instructies hands-free laten voorlezen op de oefening-detailpagina
- **Rust-timer verbeterd**: geluid + vibratie bij afloop (volgt instellingen), −15s/+30s knoppen tijdens het rusten
- Nieuw premium thema **Royal** (diep violet + goud)
- 56 nieuwe unit tests (totaal 110): oneRepMax, strengthStandards, fuzzySearch, dataExport, dailyTip, alternatives

### Changed
- 1RM-calculator gebruikt nu het gemiddelde van drie formules i.p.v. alleen Epley
- Service worker `v3`: SPA-navigaties krijgen offline een fallback naar de gecachte app-shell, zodat deep links (`/workout`, `/exercises/:id`) offline blijven werken

## [2.0.0] — 2026-05-11

### Added
- Route-level code splitting met `React.lazy()` voor alle 20 pagina's
- `@tanstack/react-virtual` virtual list op ExercisesPage (150+ oefeningen)
- `@fontsource-variable` self-hosted fonts (Space Grotesk, JetBrains Mono, Inter)
- Vitest unit tests: 54 tests voor plateCalculator, weightCalculator, weekUtils, feedbackEngine
- GitHub Actions CI workflow: typecheck → lint → test → build
- Husky + lint-staged pre-commit hook
- `rollup-plugin-visualizer` bundle analyse (`dist/stats.html`)
- `Skeleton` component voor loading states
- `MotionConfig reducedMotion="user"` — Framer Motion respecteert OS-instelling
- Security headers in `netlify.toml`: CSP, X-Content-Type-Options, Permissions-Policy

### Changed
- Vendor chunks gesplitst: recharts, three.js, framer-motion, supabase, react
- Supabase `select('*')` vervangen door expliciete kolomlijsten
- Service worker `v2`: Supabase API calls worden nooit gecached
- PWA manifest: `"any maskable"` gesplitst naar twee aparte icon entries
- `prefers-reduced-motion` CSS media query voor alle animaties
- `npm run typecheck` en `npm run test` scripts toegevoegd
- README volledig herschreven met setup, scripts en architectuur

### Performance
- Main bundle: 103 kB → 14 kB gzip (−86%)
- recharts (106 kB gzip) alleen geladen op chart-pagina's
- three.js (130 kB gzip) alleen geladen op ProgressPage
- Fonts: geen blocking CDN request meer

---

## [1.x] — Pre-refactor

Zie git log voor historische wijzigingen vóór de v2 refactor.
