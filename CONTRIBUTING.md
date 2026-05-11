# Contributing

## Code style

- **TypeScript strict** — geen `any`, geen type assertions tenzij echt nodig
- **Geen comments** — tenzij de *why* niet duidelijk is uit de code zelf
- **Geen onnodige abstracties** — drie vergelijkbare regels zijn beter dan een premature helper
- **Inline styles voor theming** — gebruik CSS custom properties (`var(--theme-*)`) voor thema-gevoelige waarden
- **Tailwind voor layout** — gebruik Tailwind utilities voor spacing, flexbox, grid

## Commit conventie

Gebruik [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <korte beschrijving in het Engels>
```

Types:
- `feat:` — nieuwe functionaliteit
- `fix:` — bugfix
- `perf:` — performance verbetering
- `style:` — opmaak, UI/UX (geen logica)
- `refactor:` — code herstructurering zonder gedragswijziging
- `test:` — tests toevoegen of aanpassen
- `docs:` — documentatie
- `chore:` — build, dependencies, CI

Voorbeelden:
```
feat: add rest timer to workout page
fix: prevent duplicate sync on reconnect
perf: lazy-load recharts charts
docs: update setup instructions in README
```

## Branch flow

```
main
 └── claude/<feature-naam>-<id>   ← feature branches
```

- Maak een branch aan vanaf `main`
- Open een draft PR vroeg
- Squash of rebase voor merge

## Pre-commit hook

Bij elke commit draait automatisch:
1. `eslint --max-warnings 0` op gewijzigde TS/TSX bestanden
2. `tsc -b --noEmit` (volledige typecheck)

Als de hook faalt, fix de fouten en commit opnieuw.

## Tests draaien

```bash
npm test          # eenmalig
npm run test:watch  # watch mode
```

Schrijf tests voor:
- Utility functies in `src/utils/`
- Pure berekeningen zonder UI of React

## Pull request checklist

- [ ] `npm run build` slaagt
- [ ] `npm run typecheck` slaagt  
- [ ] `npm test` slaagt
- [ ] `npm run lint` slaagt zonder warnings
- [ ] Geen functionaliteit verwijderd zonder afstemming
- [ ] PR beschrijving legt uit *waarom*, niet alleen *wat*
