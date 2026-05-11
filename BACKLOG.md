# BACKLOG

Items that zijn geïdentificeerd maar buiten de huidige refactor scope vallen.

## Data & Backend

- **Measurements naar Supabase**: `BodyWeight` en `BodyMeasurement` worden nu alleen lokaal opgeslagen in `localStorage`. Ze gaan verloren bij apparaatwisseling. Oplossing: `measurements` tabel toevoegen aan Supabase schema + migratie schrijven.

## Tooling

- **`server.mjs`**: Lokale HTTPS-server voor PWA testing (service workers vereisen HTTPS). Nuttig voor development maar niet voor productie. Eventueel documenteren in README als dev tool.

## Performance

- **`exercises.ts` als JSON**: 3864 regels statische oefeningen-data. Kan als `exercises.json` worden geëxporteerd en dynamisch geïmporteerd, wat de build verder verkleint.

## Testing

- **Sentry error tracking**: Productie error tracking toevoegen (Fase 7 optioneel).

## Features

- *Geen bekende backlog features*
