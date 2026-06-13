# Steel Rift Hangar

Army builder for [Steel Rift](https://www.steelrift.com), v1.5 rules.

**Live:** [type37.github.io/Steel-Rift-Hangar-WL](https://type37.github.io/Steel-Rift-Hangar-WL/)

Originally built by [Unstoppable Carl](https://github.com/unstoppablecarl) for Death Ray Designs LLC against the v1.0 rules. Full v1.5 rebuild by [WarLore](https://linktr.ee/warlore) — mech content at [warlore.neocities.org](https://warlore.neocities.org). MIT license preserved.

---

## Features

**HE-V builder**
Weight class, armor, structure, slots, and tonnage tracked live. Weapons apply duplicate cost scaling. Upgrades handle compact/drone/variant rules. Defensive configs enforce the 1-slot-for-most, 2-slot-Ultraheavy rule. Weapon rows show extracted icons from the official art.

**Callsign generator**
Six pools: Mythic (24), Industrial (24), Beasts (24), Mixed (36), 🎌 (71), Compound (18×18 = 324 combos). Plus a custom pool you type in yourself.

**Factions and perks**
All factions, all perks. Several are wired into the builder: Advanced Hardpoint Design adds a slot, Top End Hardware expands tonnage, Materiel Stockpiles cuts reinforce cost, Outrageous Support Budget comps your cheapest off-table asset. Perk-modified values show in amber. Tech Pirates and Disgraced Trillionaire prompt sub-perk selection.

**Teams**
Add teams up to your mission limit. Eligibility is checked per HE-V — wrong-class mechs are disabled in the assign picker, eligible-but-incomplete mechs show what gear they're missing. Assigned mechs that don't fully qualify are flagged inline.

**Agendas**
All secondary agendas — faction, universal, and team-specific — with live qualification checks. Unqualified agendas are separated and grayed below the qualifying ones.

**Support assets**
Off-table strikes and on-table squadrons/garrisons, up to the mission limit. Full stats and rules expand inline. Squadron and garrison pickers let you assemble the unit sub-type by sub-type, with each sub-unit weapon's damage and traits shown. Bunker garrisons scale to their full squad count. Orbital Stockpiles bumps Limited trait values in amber on qualifying assets.

**Starter lists**
One-click load of pre-built forces from the boxed sets — Authority, Freelance, and Corporate rulebook starters, plus the Cerberus Gunslinger and Akamatsu Assassination team boxes. Each loads the full force: faction, perks, mechs, team assignments, support, and the faction logo.

**Mission sizes**
Recon / Strike / Battle / All-Out War presets set tonnage, support cap, agenda count, and team allowances. Custom tonnage cap available.

**Print — tabletop-ready cards**
The deck prints first, every time: one game card per HE-V, support sub-unit, and garrison squad, in Poker (2.5×3.5″, 9-up) or Tarot (2.75×4.75″, 4-up) sizes for standard sleeves (toggle in the print bar).

- A heavily-loaded unit that won't fit one face **spills onto a continuation card** rather than clipping.
- Every **Limited (X)** weapon, upgrade, and off-table strike prints **tick-off bubbles** for in-game use tracking; team and perk bonuses (Berserker Nitro Boost, Fire Support Cluster Rockets, Orbital Stockpiles) adjust the counts.
- Off-table strikes get a **per-turn usage tracker** and a full-text rules explainer.
- HE-V cards show their **team membership**; sub-unit cards spell out **every trait** (with the shared infantry/vehicle set explained once on the back).
- A stack of identical support sub-units prints as **one card with a numbered HP row per model**.
- The back **reference page** collects force identity, agendas (with a "pick N" reminder and a pick bubble each, sized to the mission), faction perks, team benefits, upgrade rules, and the trait glossary — flowing onto extra pages for large forces.

**Loadout catalog**
Search by name across the active tab. Sort weapons by cost or name.

---

## Data files

| File | Contents |
|---|---|
| `src/data.js` | All game data — weapons, upgrades, defensive configs, support assets, factions, perks, teams, agendas |
| `src/glossary.js` | Trait definitions, surfaced on click in the UI |
| `src/callsigns.js` | Name pools for the callsign generator |
| `src/calc.js` | All derived stats and eligibility logic |

Every entry is annotated with its v1.5 PDF page reference. To fix a data error: open the file, find the entry, fix it, push.

---

## Run locally

```bash
npm install
npm run dev
```

Dev server opens at http://localhost:5173.

## Deploy

Push to `main`. The workflow at `.github/workflows/static.yml` builds and deploys to GitHub Pages. Vite base path is `/Steel-Rift-Hangar-WL/` — change it in `vite.config.js` if you fork.

---

## Known gaps

- Ultralight HE-Vs as team members aren't modeled.
- Team eligibility covers weight class, required weapons, and upgrade constraints but isn't exhaustive — cross-check against the printed team card.
- Titan-Killers agenda eligibility depends on the opponent's list, so it can't be checked at build time.

---

## License

MIT. See [LICENSE](./LICENSE). Original copyright Death Ray Designs LLC.
