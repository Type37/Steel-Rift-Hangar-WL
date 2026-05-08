# Steel Rift Hangar

Army builder for [Steel Rift](https://www.steelrift.com), v1.5 rules.

**Live:** https://type37.github.io/Steel-Rift-Hangar-WL/

Originally built by [Unstoppable Carl](https://github.com/unstoppablecarl) for Death Ray Designs LLC against the v1.0 rules. This is a full v1.5 rebuild by [WarLore](https://linktr.ee/warlore) — see WarLore's mech content at [warlore.neocities.org](https://warlore.neocities.org). MIT license preserved.

---

## What it does

**Force building**
Add HE-Vs at any weight class. Name them manually or generate a callsign from several name pools. Each HE-V tracks tonnage and slots live as you load it out — armor, structure, weapons (with duplicate cost scaling), upgrades, and defensive configs all draw from the same internal budget.

**Faction and perks**
Pick a faction and select perks from its groups. Perks with builder effects are wired in: Advanced Hardpoint Design adds a slot, Top End Hardware expands your tonnage cap, Materiel Stockpiles cuts reinforce cost to 1t, Outrageous Support Budget comps your cheapest qualifying off-table asset. Tech Pirates and Disgraced Trillionaire prompt sub-perk selection. Values changed by an active perk show in amber.

**Teams and agendas**
Teams you qualify for are shown as you build. The Agendas tab shows every secondary agenda your force can field — faction, universal, and team — with live qualification checks. Ones you don't yet qualify for are grayed and separated below.

**Support assets**
Add off-table and on-table support assets up to the mission limit. Full stats and rules are expandable inline. Orbital Stockpiles bumps Limited trait values in amber on any off-table asset you've recruited.

**Mission size**
Recon / Strike / Battle / All-Out War presets, or a custom tonnage cap. The force budget bar updates live.

**Print**
Clean roster printout from the top bar.

---

## Data

`src/data.js` — all game data: HE-Vs, weapons, upgrades, defensive configs, support assets, factions, perks, teams.
`src/glossary.js` — trait definitions surfaced when you click any underlined trait token in the UI.
`src/callsigns.js` — name pools for the callsign generator.

Every entry is annotated with its v1.5 PDF page reference. Fix a number: open the file, find the entry, change it, push.

---

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Deploy

Push to `main`. The workflow at `.github/workflows/static.yml` builds and deploys to GitHub Pages automatically. The Vite base path is `/Steel-Rift-Hangar-WL/` — change it in `vite.config.js` if you fork.

---

## Known gaps

- Some advanced rules aren't modeled: Ultralight HE-Vs as team members, Garrison details, and a few edge-case Support Asset interactions.
- The team eligibility checker is a heuristic. It covers weight class, required weapons, and upgrade constraints but isn't a rules arbiter — always cross-check against the team's printed card.
- Titan-Killers agenda eligibility depends on the opponent's force, so it can't be checked at list-building time.

---

## License

MIT. See [LICENSE](./LICENSE). Original copyright Death Ray Designs LLC.
