# Changelog

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
