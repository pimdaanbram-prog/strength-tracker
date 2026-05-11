# Migration Notes — v1.x → v2.0.0

## Overzicht

Deze refactor beslaat fasen 0–9. De app-functionaliteit is ongewijzigd; alleen de technische kwaliteit is verbeterd.

## Nieuwe scripts

| Script | Omschrijving |
|---|---|
| `npm run typecheck` | TypeScript check zonder build output |
| `npm test` | Unit tests eenmalig draaien (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:ui` | Vitest UI openen in browser |

## Performance voor/na

| Metric | v1 | v2 |
|---|---|---|
| Main bundle (gzip) | 103 kB | **14 kB** (−86%) |
| recharts laden | altijd (bij start) | lazy (alleen chart-pagina's) |
| three.js laden | altijd (bij start) | lazy (alleen ProgressPage) |
| Google Fonts CDN | ja (blocking request) | nee (self-hosted) |
| Exercises DOM nodes | 150+ tegelijk | ~15 (virtual list) |

## Breaking changes

Geen — alle functionaliteit is behouden.

## Service worker cache versie

De cache-versie is geüpgraded van `strength-tracker-v1` naar `strength-tracker-v2`. Gebruikers die de PWA geïnstalleerd hebben krijgen bij de eerste bezoek na deploy de nieuwe versie. De oude cache wordt automatisch opgeruimd.

## Supabase queries

`select('*')` is vervangen door expliciete kolomlijsten. Als je in de toekomst kolommen toevoegt aan de Supabase tabellen, moet je ze ook toevoegen aan de queries in `src/hooks/useSync.ts`.

## ESLint

Er zijn 11 pre-existing warnings overgebleven (react-hooks v7 strict rules). Deze zijn als `warn` geconfigureerd en blokkeren de build niet. Ze staan op de backlog voor Fase 10.

## Fonts

De Google Fonts CDN import is verwijderd uit `src/index.css`. Fonts worden nu geladen via `@fontsource-variable/*` pakketten (bundled in de build). Als je een nieuw font wilt toevoegen:

```bash
npm install @fontsource-variable/<font-naam>
```

en importeer het in `src/main.tsx`.
