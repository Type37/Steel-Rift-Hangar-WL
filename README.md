# Steel Rift: Hangar (v1.5 — The Forge rebuild)

An army builder for [Steel Rift](https://www.steelrift.com), updated to the v1.5 rules.

**Live:** https://type37.github.io/Steel-Rift-Hangar-WL/

## History

Originally created by [Unstoppable Carl](https://github.com/unstoppablecarl) for Death Ray Designs LLC. That version was built against the v1.0 rules. This is a full v1.5 rebuild from scratch (Vite + React) by WarLore with Claude help. The MIT license from the original is preserved.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Deploy

Push to `main`. The workflow at `.github/workflows/static.yml` builds and deploys to GitHub Pages automatically. The base path is set in `vite.config.js` to `/Steel-Rift-Hangar-WL/` — change it if you fork the repo to a different name.

## Editing the data

All Steel Rift data lives in `src/data.js`. Trait definitions are in `src/glossary.js`. Mech callsign pools are in `src/callsigns.js`. Each entry is annotated with the page reference where it was pulled from the v1.5 PDF, so corrections are quick: open the file, find the entry, fix the number, push.

## Icons

Drop SVG or PNG icons into `public/icons/` and reference them by filename in `src/data.js` (each weapon, upgrade, support asset, and HE-V class has an optional `icon` field). The current build falls back to lucide icons when no file is provided.

## What it does

- Add HE-Vs at any weight class. Name them yourself or roll a callsign from one of several name pools (configurable in Options).
- Configure armor, structure, weapons (with duplicate cost scaling), upgrades, and defensive configurations. Slots and tonnage tracked live.
- Pick mission size from Recon / Strike / Battle / All-Out War, or set a custom tonnage.
- Add support assets up to the mission's allowed limit, with full rules and stats expandable before committing.
- Pick a faction and its perks (one per group, max 2).
- See which HE-V Teams your roster qualifies for as you build, with the team-count limits the mission allows surfaced at the top.
- Click any underlined trait token anywhere in the UI to surface its definition in the glossary band.
- Print a clean army roster from the top bar.

## Caveats

- The team eligibility checker is a heuristic, not a rules referee. It checks weight class, required upgrades, and weapon constraints; always cross-check against the team's printed requirements.
- Duplicate weapon costs follow the v1.5 formula: the Nth copy costs `floor(base * (1 + 0.5 * (N - 1)))`. So a 5-ton Autocannon goes 5 → 7 → 10 → 12 → 15.
- Some advanced rules (Ultralight HE-Vs, Squadrons as team members, Garrisons in detail) are not modeled.

## License

MIT, see [LICENSE](./LICENSE). Original copyright Death Ray Designs LLC.
