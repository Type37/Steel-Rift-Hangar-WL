import React from 'react';
import { WC, MISSIONS, RANGED, MELEE, UPGRADES, DEFENSIVE, FACTIONS, TEAMS, UNIVERSAL_AGENDAS, INFANTRY_SQUADS, POWER_SUIT_SQUADS, VEHICLE_WEAPONS, INFANTRY_SHARED_TRAITS } from '../data';
import { calcMech, valForClass, totalWeaponCost, findAsset, findWeapon } from '../calc';
import { GLOSSARY, resolveTraitDefs } from '../glossary';
import { collectTraits } from './ui';

// Find a squad definition (infantry, power-suit) by name.
function findSquadDef(name) {
  return INFANTRY_SQUADS.find(s => s.name === name)
      || POWER_SUIT_SQUADS.find(s => s.name === name);
}

// Look up a vehicle weapon by name (used for sub-unit weapon damage values).
function findVehicleWeapon(name) {
  if (!name || typeof name !== 'string') return null;
  return VEHICLE_WEAPONS.find(w => w.name.toLowerCase() === name.toLowerCase().trim());
}

// Parse a weapon list string ("Autocannon, AG Missiles or Barrage Rockets")
// into an array of {name, alts} where alts is the alternates after "or".
function parseSubunitWeapons(str) {
  if (!str || str === '—' || typeof str !== 'string') return [];
  return str.split(/,\s*/).map(group => {
    const cleaned = group
      .replace(/\s*[×x]\d+$/, '')
      .replace(/\s*\(each\)/i, '')
      .replace(/\s*\(per model\)/i, '')
      .trim();
    const parts = cleaned.split(/\s+or\s+/i).map(p => p.trim()).filter(Boolean);
    return parts.length > 1
      ? { name: parts[0], alts: parts.slice(1) }
      : { name: parts[0], alts: [] };
  }).filter(g => g.name);
}

// Class-specific special-rule text, shared by the HE-V card and the overflow
// estimator so both agree on how much space the rules consume.
const FRAGILE_INTERNALS_TEXT = 'Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, the Unit suffers one additional point of Damage. This does not trigger further Fragile Internals rolls.';
const BACKUP_SYSTEMS_TEXT = 'Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, a point of Damage is ignored and the Structure is not reduced.';

// Resolve a mech's upgrade + defensive configs to their data definitions
// (filtering out ones unavailable to its class).
function resolveMechUpgrades(mech) {
  const cls = mech.weightClass;
  const upgrades = mech.upgrades
    .map(n => UPGRADES.find(u => u.name === n))
    .filter(u => u && valForClass(u.cost, cls) !== '-');
  const defensive = mech.defensive
    .map(n => DEFENSIVE.find(d => d.name === n))
    .filter(d => d && valForClass(d.cost, cls) !== '-');
  return [...upgrades, ...defensive];
}

// Rough height estimates (pt). Used ONLY to decide when a loaded HE-V
// overflows its card face and to paginate the spill across continuation
// cards; not a pixel-accurate layout.
const EST_LINE = 8.6, EST_CPL = 44;
function estimateLines(text, charsPerLine = EST_CPL) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

// Height of the sections that always stay on the primary card:
// name band, class/stats row, armor/structure pips, and the weapons table.
function mechFrontHeight(mech) {
  const cls = mech.weightClass;
  let front = 20 + 30;
  const armorRows = Math.ceil((mech.armor || 0) / 5);
  const structRows = Math.ceil((mech.structure || 0) / 6);
  front += 18 + Math.max(armorRows, structRows, 1) * 12;
  const weaponCount = mech.weapons.filter(w => {
    const wd = findWeapon(w.name);
    return wd && valForClass(wd.cost, cls) !== '-';
  }).length;
  if (weaponCount) front += 16 + weaponCount * 13;
  return front;
}

// The spillable items — each upgrade/defensive config and each class special
// rule — with an estimated height, so they can be packed onto continuation
// cards. Order is preserved (upgrades first, then special rules).
function mechSpillItems(mech) {
  const cls = mech.weightClass;
  const items = [];
  resolveMechUpgrades(mech).forEach(u => {
    const drones = mech.drones || {};
    const droneEntries = Object.entries(drones).filter(([, target]) => target === u.name);
    const suffix = droneEntries.length ? ` [${droneEntries.map(([d]) => d).join(', ')}]` : '';
    items.push({
      kind: 'upgrade',
      name: u.name + suffix,
      rule: u.rule,
      height: estimateLines(`${u.name}: ${u.rule}`) * EST_LINE + 3,
    });
  });
  if (cls === 'Light') {
    items.push({ kind: 'special', name: 'Fragile Internals', rule: FRAGILE_INTERNALS_TEXT, height: estimateLines(FRAGILE_INTERNALS_TEXT) * EST_LINE + 6 });
  }
  if (cls === 'Ultraheavy') {
    items.push({ kind: 'special', name: 'Backup Systems Engage', rule: BACKUP_SYSTEMS_TEXT, height: estimateLines(BACKUP_SYSTEMS_TEXT) * EST_LINE + 6 });
  }
  return items;
}

// The full trait string a sub-unit / garrison card should explain: its own
// traits, the shared traits it inherits (infantry squads share a fixed set;
// vehicle/air sub-units inherit the parent asset's), and its weapons' traits.
function subunitTraitString(sub, parent, flavor) {
  const weaponGroups = parseSubunitWeapons(sub.weapons || '');
  const sharedTraits = flavor === 'garrison'
    ? INFANTRY_SHARED_TRAITS
    : (parent?.stats?.Traits || '');
  return [
    sharedTraits,
    sub.traits && sub.traits !== '—' ? sub.traits : '',
    ...weaponGroups.map(g => findVehicleWeapon(g.name)?.traits || ''),
  ].filter(Boolean).join(', ');
}

// The DISTINCTIVE traits of a sub-unit (its own + its weapons') — i.e. not the
// shared traits every squad/sub-unit of its kind has. These get spelled out on
// the card; the shared traits are listed by name and explained once on the
// summary's "Traits in Play" so they don't repeat across every squad's cards.
function subunitDistinctiveTraitString(sub) {
  const weaponGroups = parseSubunitWeapons(sub.weapons || '');
  return [
    sub.traits && sub.traits !== '—' ? sub.traits : '',
    ...weaponGroups.map(g => findVehicleWeapon(g.name)?.traits || ''),
  ].filter(Boolean).join(', ');
}

// Resolved, deduped definitions for the distinctive traits, each with an
// estimated height so they can be paginated across continuation cards.
function subunitTraitItems(sub) {
  return resolveTraitDefs(subunitDistinctiveTraitString(sub)).map(d => ({
    ...d,
    height: estimateLines(`${d.title}: ${d.text}`) * EST_LINE + 3,
  }));
}

// Height of the always-on-front sections of a sub-unit card (name, stats,
// pips, weapons table, and the full trait-names line).
function subunitFrontHeight(sub, parent, flavor) {
  let h = 20 + 30;
  const arm = parseInt(sub.arm, 10) || 0;
  const str = parseInt(sub.str, 10) || 0;
  if (arm > 0 || str > 0) h += 18 + Math.max(Math.ceil(arm / 5), Math.ceil(str / 6), 1) * 12;
  const rows = parseSubunitWeapons(sub.weapons || '').reduce((n, g) => n + 1 + g.alts.length, 0);
  if (rows) h += 16 + rows * 13;
  h += 14 + estimateLines(subunitTraitString(sub, parent, flavor), EST_CPL) * EST_LINE; // TRAITS heading + names line
  return h;
}

// Push a sub-unit / garrison card to the deck, splitting onto continuation
// cards when its trait definitions overflow one face (mirrors the HE-V split).
function pushUnitCard(deck, base, sub, parent, flavor, cardCapacity) {
  const items = subunitTraitItems(sub);
  const front = subunitFrontHeight(sub, parent, flavor);
  const spill = items.reduce((s, it) => s + it.height, 0) + (items.length ? 14 : 0);
  if (items.length === 0 || front + spill <= cardCapacity) {
    deck.push({ ...base, part: 'full', traitItems: items });
    return;
  }
  deck.push({ ...base, part: 'front' });
  const contCap = cardCapacity - 30;
  let page = [], used = 0;
  items.forEach(it => {
    if (page.length && used + it.height > contCap) {
      deck.push({ ...base, part: 'cont', traitItems: page });
      page = []; used = 0;
    }
    page.push(it);
    used += it.height;
  });
  if (page.length) deck.push({ ...base, part: 'cont', traitItems: page });
}

// ============================================================
// PRINT VIEW
// 2.5" x 3.5" game cards arranged 3 x 3 per Letter page, matching
// the original Death Ray Designs Hangar layout. Heavily-loaded HE-Vs that
// don't fit on one face spill their upgrades + special rules onto a
// continuation card in the next slot. After all the cards, a single combined
// reference page prints agendas, perks, teams, traits, and upgrade rules.
// ============================================================

export function PrintView({
  forceName, mission, customTons, mechs,
  supportAssets, faction, perks, selectedTeams, simpleMode,
  factionLogo, supportNicknames = {}, supportLoadouts = {}, activePerks = [],
  garrisonLoadouts = {},
  previewMode = false, onClosePreview,
}) {
  // Card size: 'poker' = 2.5x3.5" (9 per Letter sheet), 'tarot' = 2.75x4.75"
  // (4 per sheet, fits standard tarot sleeves and gives loaded mechs more room).
  const [cardSize, setCardSize] = React.useState('poker');
  const perPage = cardSize === 'tarot' ? 4 : 9;

  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const totalTons =
    mechs.reduce((s, m) => s + WC[m.weightClass].tons, 0) +
    supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0);

  // Build the deck: HE-V cards first, then for each support asset either
  // its standalone card (off-table strikes) or one card per unique
  // sub-unit type (vehicle squadrons, air squadrons, etc.) plus one card
  // per unique garrison squad type held inside that asset.
  //
  // A heavily-loaded HE-V whose content won't fit on one face spills its
  // upgrades + special rules onto a continuation card placed in the next
  // slot ("front" + "cont"); everything else prints as a single "full" card.
  const cardCapacity = cardSize === 'tarot' ? 340 : 248;
  const deck = [];
  mechs.forEach((m, i) => {
    const front = mechFrontHeight(m);
    const items = mechSpillItems(m);
    const spill = items.reduce((s, it) => s + it.height, 0) + (items.length ? 14 : 0);
    // Fits on one face → single card.
    if (spill <= 24 || front + spill <= cardCapacity) {
      deck.push({ kind: 'hev', mech: m, idx: i, part: 'full' });
      return;
    }
    // Overflows → primary card with stats/weapons, then pack the upgrade/rule
    // items onto as many continuation cards as it takes.
    deck.push({ kind: 'hev', mech: m, idx: i, part: 'front' });
    const contCap = cardCapacity - 30; // name band + section heading allowance
    let page = [], used = 0;
    items.forEach(it => {
      if (page.length && used + it.height > contCap) {
        deck.push({ kind: 'hev', mech: m, idx: i, part: 'cont', items: page });
        page = []; used = 0;
      }
      page.push(it);
      used += it.height;
    });
    if (page.length) deck.push({ kind: 'hev', mech: m, idx: i, part: 'cont', items: page });
  });

  // Track which asset names we've already emitted garrison cards for, so
  // duplicate asset entries (taking 2 of the same Outpost) don't emit
  // duplicate garrison cards.
  const garrisonsEmitted = new Set();

  supportAssets.forEach((name) => {
    const a = findAsset(name);
    if (!a) return;

    const hasSubunits = a.subunits && a.subunits.length > 0;
    // Off-table / no-subunit assets get NO deck card — they print as a
    // full-text explainer with a turn tracker on the summary page instead.
    if (hasSubunits) {
      // On-table squadron: one card per unique sub-unit type that's
      // actually picked, with the count badge on the card.
      const loadout = supportLoadouts[name] || [];
      const counts = {};
      loadout.forEach(n => {
        if (typeof n !== 'string') return;
        counts[n] = (counts[n] || 0) + 1;
      });
      Object.entries(counts).forEach(([subName, count]) => {
        const sub = a.subunits.find(s => s.name === subName);
        if (!sub) return;
        pushUnitCard(deck, {
          kind: 'subunit',
          parent: a,
          parentName: supportNicknames[name] || a.name,
          sub,
          count,
        }, sub, a, 'subunit', cardCapacity);
      });
    }

    // Garrison squads inside this asset: one card per squad type, deduped
    // across multiple instances of the same asset.
    const garrison = garrisonLoadouts[name];
    if (garrison && garrison.length > 0 && !garrisonsEmitted.has(name)) {
      garrisonsEmitted.add(name);
      const squadCounts = {};
      garrison.forEach(squadName => {
        if (typeof squadName !== 'string') return;
        squadCounts[squadName] = (squadCounts[squadName] || 0) + 1;
      });
      Object.entries(squadCounts).forEach(([squadName, count]) => {
        const squad = findSquadDef(squadName);
        if (!squad) return;
        pushUnitCard(deck, {
          kind: 'garrison',
          parent: a,
          parentName: supportNicknames[name] || a.name,
          squad,
          count,
        }, squad, a, 'garrison', cardCapacity);
      });
    }
  });

  // Chunk into pages (9 poker / 4 tarot per Letter sheet).
  const pages = [];
  for (let i = 0; i < deck.length; i += perPage) pages.push(deck.slice(i, i + perPage));

  // Collect every trait used in this force for the reference section.
  const traitsUsed = new Set();
  mechs.forEach(m => {
    m.weapons.forEach(w => collectTraits(findWeapon(w.name)?.traits || '').forEach(t => traitsUsed.add(t)));
  });
  supportAssets.forEach(n => {
    const a = findAsset(n);
    collectTraits(a?.stats?.Traits || '').forEach(t => traitsUsed.add(t));
  });
  // Sub-unit / garrison traits (incl. the shared infantry/vehicle set) so the
  // summary's Traits in Play explains them once instead of on every squad card.
  deck.forEach(slot => {
    if (slot.kind !== 'subunit' && slot.kind !== 'garrison') return;
    const u = slot.sub || slot.squad;
    if (u) collectTraits(subunitTraitString(u, slot.parent, slot.kind === 'garrison' ? 'garrison' : 'subunit'))
      .forEach(t => traitsUsed.add(t));
  });

  // Everything that isn't a card lives on a single combined page at the very
  // end. Work out up front whether there's anything to show there.
  const agendaList = computeQualifiedAgendas(mechs, faction, selectedTeams);
  const upgradesUsed = new Set();
  mechs.forEach(m => m.upgrades.forEach(u => upgradesUsed.add(u)));

  // Off-table support assets (no sub-units) get a full-text explainer plus a
  // per-turn usage tracker on the summary page rather than a deck card.
  const offTableSupport = supportAssets
    .map(name => ({ name, asset: findAsset(name), nickname: supportNicknames[name] }))
    .filter(x => x.asset && (!x.asset.subunits || x.asset.subunits.length === 0));

  const hasSummary =
    agendaList.length > 0 ||
    (faction && perks.length > 0) ||
    selectedTeams.length > 0 ||
    traitsUsed.size > 0 ||
    upgradesUsed.size > 0 ||
    offTableSupport.length > 0;

  return (
    <div className={previewMode ? 'print-preview-mode' : 'print-only'}>
      {previewMode && (
        <div className="print-preview-toolbar no-print">
          <div className="print-preview-toolbar-left">
            <span className="print-preview-toolbar-title">Print Preview</span>
            <span className="print-preview-toolbar-meta">{pages.length + (hasSummary ? 1 : 0)} pages</span>
          </div>
          <div className="print-preview-toolbar-right">
            <div className="print-size-toggle" role="group" aria-label="Card size">
              <button
                className={cardSize === 'poker' ? 'is-active' : ''}
                onClick={() => setCardSize('poker')}
              >
                Poker · 9/pg
              </button>
              <button
                className={cardSize === 'tarot' ? 'is-active' : ''}
                onClick={() => setCardSize('tarot')}
              >
                Tarot · 4/pg
              </button>
            </div>
            <button className="add-btn" onClick={() => window.print()}>
              Print
            </button>
            <button className="add-btn" onClick={onClosePreview}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className={previewMode ? 'print-preview-pages' : ''}>
      {/* CARDS FIRST — the printed deck always leads. */}
      {pages.map((page, pi) => (
        <div key={pi} className="print-page print-cards-page">
          <div className={`page-card-grid ${cardSize === 'tarot' ? 'tarot' : ''}`}>
            {page.map((slot, ci) => (
              <div key={ci} className="game-card">
                {slot.kind === 'hev' && <HEVCard mech={slot.mech} index={slot.idx} part={slot.part} items={slot.items} />}
                {slot.kind === 'subunit' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.sub} count={slot.count} flavor="subunit" part={slot.part} traitItems={slot.traitItems} />}
                {slot.kind === 'garrison' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.squad} count={slot.count} flavor="garrison" part={slot.part} traitItems={slot.traitItems} />}
              </div>
            ))}
            {Array.from({ length: perPage - page.length }).map((_, i) => (
              <div key={`pad-${i}`} className="game-card game-card-blank" />
            ))}
          </div>
        </div>
      ))}

      {/* Everything else — force identity, agendas, faction rules, teams,
          upgrades, traits — packed onto a single reference page at the end. */}
      {hasSummary && (
        <SummaryPage
          forceName={forceName}
          mission={mission}
          useCustom={useCustom}
          cap={cap}
          totalTons={totalTons}
          mechCount={mechs.length}
          supportCount={supportAssets.length}
          faction={faction}
          perks={perks}
          teams={selectedTeams}
          factionLogo={factionLogo}
          mechs={mechs}
          agendas={agendaList}
          offTableSupport={offTableSupport}
          traits={Array.from(traitsUsed).sort()}
        />
      )}
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY PAGE (single combined back page)
// Force identity + agendas + faction perks + teams + upgrades + traits,
// all packed onto one Letter page in a dense two-column flow.
// ============================================================
function SummaryPage({
  forceName, mission, useCustom, cap, totalTons, mechCount, supportCount,
  faction, perks, teams, factionLogo, mechs, agendas, offTableSupport = [], traits,
}) {
  const factionData = faction ? FACTIONS[faction] : null;

  const teamDefs = teams
    .map(name => TEAMS.find(t => t.name === name))
    .filter(Boolean);

  const upgradesUsed = new Set();
  mechs.forEach(m => m.upgrades.forEach(u => upgradesUsed.add(u)));
  const upgradeDefs = Array.from(upgradesUsed)
    .map(name => UPGRADES.find(u => u.name === name))
    .filter(Boolean);

  return (
    <div className="print-page print-summary-page">
      {/* Force identity banner */}
      <div className="summary-head">
        {factionLogo && (
          <img src={factionLogo} alt="" className="summary-logo" />
        )}
        <div className="summary-head-text">
          <div className="summary-eyebrow">FORCE ROSTER</div>
          <div className="summary-name">{forceName || 'Unnamed Force'}</div>
          <div className="summary-meta">
            {mission}{useCustom ? '' : ' Mission'} · {totalTons} / {cap}t · {mechCount} HE-V{mechCount === 1 ? '' : 's'} · {supportCount} support
            {faction ? ` · ${faction}` : ''}
          </div>
        </div>
      </div>

      <div className="summary-cols">
        {offTableSupport.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">Off-Table Support</h2>
            {offTableSupport.map(({ name, asset, nickname }) => {
              // Off-table assets are Limited (3), usable once per turn — bumped
              // to 4 by the Orbital Stockpiles perk.
              const baseLimited = limitedCount(asset.stats?.Traits) || 3;
              const lim = baseLimited + (perks.includes('Orbital Stockpiles') ? 1 : 0);
              return (
                <div key={name} className="summary-def summary-support">
                  <span className="summary-def-name">{nickname || asset.name}</span>
                  <span className="summary-def-src">{asset.kind} · {asset.cost}t</span>
                  {asset.fullDesc && <div className="summary-def-text">{asset.fullDesc}</div>}
                  <div className="summary-limited-note">
                    Limited ({lim}), usable once per turn{perks.includes('Orbital Stockpiles') ? ' (Orbital Stockpiles)' : ''}
                  </div>
                  <div className="summary-turn-track" aria-label="Turn used">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <div key={n} className={`turn-cell${n === 6 ? ' turn-cell-dim' : ''}`}>
                        <div className="turn-num">{n}</div>
                        <div className="turn-bubble" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {agendas.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">
              Secondary Agendas
              {!useCustom && MISSIONS[mission]?.agendas != null && (
                <span className="summary-h2-note">pick {MISSIONS[mission].agendas}</span>
              )}
            </h2>
            {agendas.map((a, i) => (
              <div key={i} className="summary-def summary-agenda-row">
                <span className="agenda-pick-bubble" aria-hidden="true" />
                <div className="summary-agenda-body">
                  <span className="summary-def-name">{a.name}</span>
                  <span className="summary-def-src">{a.source}</span>
                  {a.req && <span className="summary-def-req"> — requires {a.req}</span>}
                  <div className="summary-def-text">{a.text}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {factionData && perks.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">{faction} Perks</h2>
            {perks.map(perkName => {
              const def = findPerk(factionData, perkName);
              if (!def) return null;
              return (
                <div key={perkName} className="summary-def">
                  <span className="summary-def-name">{perkName}</span>
                  <div className="summary-def-text">{def.text}</div>
                </div>
              );
            })}
          </section>
        )}

        {teamDefs.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">HE-V Teams</h2>
            {teamDefs.map(t => (
              <div key={t.name} className="summary-def">
                <span className="summary-def-name">{t.name}</span>
                {t.blurb && <div className="summary-def-text summary-def-italic">{t.blurb}</div>}
                {t.benefitsList ? (
                  <ul className="summary-benefit-list">
                    {t.benefitsList.map((g, i) => (
                      <li key={i}>
                        <span className="summary-benefit-gate">{g.gate}</span>{' '}
                        {g.items.join('; ')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  t.benefits && <div className="summary-def-text">{t.benefits}</div>
                )}
              </div>
            ))}
          </section>
        )}

        {upgradeDefs.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">Upgrade Rules</h2>
            {upgradeDefs.map(u => (
              <div key={u.name} className="summary-def">
                <span className="summary-def-name">{u.name}</span>
                <div className="summary-def-text">{u.rule}</div>
              </div>
            ))}
          </section>
        )}

        {traits.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">Traits in Play</h2>
            {traits.map(t => {
              const def = GLOSSARY[t];
              if (!def) return null;
              return (
                <div key={t} className="summary-def">
                  <span className="summary-def-name">{def.title}</span>
                  <div className="summary-def-text">{def.text}</div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HE-V CARD (2.5" x 3.5")
// ============================================================
function HEVCard({ mech, index, part = 'full', items = [] }) {
  const wc = WC[mech.weightClass];
  const cls = mech.weightClass;
  const isCont = part === 'cont';   // continuation card: a slice of upgrades/rules
  const isFront = part === 'front';  // primary card of a split: no upgrades/rules
  const move = movDefault(cls);
  const jumpVal = jumpDefault(cls, mech);
  const def = defDefault(cls);

  // Detect melee weapons by membership in MELEE array (no .kind property on data)
  const meleeNames = new Set(MELEE.map(m => m.name));

  // mech.weapons is [{name, count}] — was wrongly passing the whole object to findWeapon
  const weapons = mech.weapons.map(({ name, count }) => {
    const w = findWeapon(name);
    if (!w) return null;
    const dmg = valForClass(w.dmg, cls);
    const cost = valForClass(w.cost, cls);
    if (cost === '-') return null;
    const range = inferRange(w.traits);
    const isMelee = meleeNames.has(name);
    return {
      name,
      count,
      dmg: isMelee ? meleeDamage(w, cls) : `${dmg}`,
      range,
      traits: filterDisplayTraits(w.traits, cls),
      limited: limitedCount(w.traits, cls) * (count || 1),
    };
  }).filter(Boolean);

  const upgrades = mech.upgrades
    .map(n => UPGRADES.find(u => u.name === n))
    .filter(u => u && valForClass(u.cost, cls) !== '-');
  const defensive = mech.defensive
    .map(n => DEFENSIVE.find(d => d.name === n))
    .filter(d => d && valForClass(d.cost, cls) !== '-');

  // Equipped tonnage = base class cost (weapons/upgrades are within that envelope)
  const equippedTons = wc.tons;

  return (
    <div className="game-card-inner">
      {/* Header band — continuation cards flag themselves so the pair reads
          as one unit. */}
      <header className="card-name-band">
        {mech.name || `${cls.toUpperCase()} HE-V`}
        {isCont && <span className="card-cont-flag">CONT'D</span>}
      </header>

      {!isCont && (
        <>
          {/* Class + stats row */}
          <div className="card-row card-row-id">
            <div className="card-class-band">{cls.toUpperCase()} HE-V</div>
            <table className="card-stats-table">
              <thead>
                <tr><th>Tng</th><th>Mov</th><th>Jmp</th><th>Def</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{equippedTons}t</td>
                  <td>{move}"</td>
                  <td>{jumpVal != null ? `${jumpVal}"` : '—'}</td>
                  <td>{def}+</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Damage row: ARMOR | STRUCTURE + CRIT legend */}
          <div className="card-row-damage">
            <div className="card-armor-col">
              <div className="hp-heading">ARMOR</div>
              <PipBlock kind="armor" total={mech.armor} />
            </div>
            <div className="card-structure-col">
              <div className="card-structure-stack">
                <div className="hp-heading">STRUCTURE</div>
                <PipBlock kind="structure" total={mech.structure} />
              </div>
              <div className="card-crit">
                <div className="card-crit-heading">CRIT</div>
                <table className="table-crit">
                  <tbody>
                    <tr><td><strong>(M)</strong>ove</td><td className="num">-1</td></tr>
                    <tr><td><strong>(D)</strong>mg</td><td className="num">-1</td></tr>
                    <tr><td><strong>(Ø)</strong>rders</td><td className="num">-1</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Weapons table */}
          {weapons.length > 0 && (
            <>
              <table className="card-weapons-table">
                <thead>
                  <tr>
                    <th className="card-weapons-th">WEAPONS</th>
                    <th className="num">Dmg</th>
                    <th className="num">Rng</th>
                    <th>Traits</th>
                  </tr>
                </thead>
                <tbody>
                  {weapons.map((w, i) => (
                    <tr key={i}>
                      <td>{w.count > 1 ? `${w.name} ×${w.count}` : w.name}</td>
                      <td className="num">{w.dmg}</td>
                      <td className="num">{w.range}</td>
                      <td className="card-traits">
                        {w.traits}
                        <LimitedBubbles count={w.limited} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* When the upgrades/rules have spilled to a continuation card, leave
              a pointer so the player knows to grab the next card. */}
          {isFront && (
            <div className="card-cont-note">▸ Upgrades &amp; special rules on next card</div>
          )}
        </>
      )}

      {/* Full (un-split) card: all upgrades + special rules inline. */}
      {part === 'full' && (
        <>
          {(upgrades.length > 0 || defensive.length > 0) && (
            <>
              <div className="card-section-heading">UPGRADES</div>
              <div className="card-upgrade-defs">
                {[...upgrades, ...defensive].map(u => {
                  const drones = mech.drones || {};
                  const droneEntries = Object.entries(drones).filter(([, target]) => target === u.name);
                  const suffix = droneEntries.length > 0 ? ` [${droneEntries.map(([d]) => d).join(', ')}]` : '';
                  return (
                    <div key={u.name} className="card-upgrade-def-entry">
                      <span className="card-trait-def-name">{u.name}{suffix}:</span>{' '}
                      <span className="card-upgrade-def-rule">{u.rule}</span>
                      <LimitedBubbles count={limitedCount(u.rule, cls)} />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SPECIAL RULES: class-specific unit keywords only (Fragile Internals,
              Backup Systems Engage). The weapon-trait glossary (Smart, Blast, AP…)
              is intentionally NOT repeated here — it lives once on the reference
              sheet so loaded cards don't overflow. Per-weapon values (e.g.
              AP (1/1/2/3)) still print inline in the weapons table above. */}
          {(() => {
            const entries = [];
            if (cls === 'Light') {
              entries.push(
                <div key="fragile" className="card-trait-def-entry">
                  <span className="card-trait-def-name">Fragile Internals:</span>{' '}
                  {FRAGILE_INTERNALS_TEXT}
                </div>
              );
            }
            if (cls === 'Ultraheavy') {
              entries.push(
                <div key="backup" className="card-trait-def-entry">
                  <span className="card-trait-def-name">Backup Systems Engage:</span>{' '}
                  {BACKUP_SYSTEMS_TEXT}
                </div>
              );
            }
            if (entries.length === 0) return null;
            return (
              <>
                <div className="card-section-heading">SPECIAL RULES</div>
                <div className="card-trait-defs">{entries}</div>
              </>
            );
          })()}
        </>
      )}

      {/* Continuation card: just the slice of upgrade/special items packed
          onto this face by the deck builder. */}
      {isCont && (() => {
        const ups = items.filter(it => it.kind === 'upgrade');
        const specials = items.filter(it => it.kind === 'special');
        return (
          <>
            {ups.length > 0 && (
              <>
                <div className="card-section-heading">UPGRADES</div>
                <div className="card-upgrade-defs">
                  {ups.map(u => (
                    <div key={u.name} className="card-upgrade-def-entry">
                      <span className="card-trait-def-name">{u.name}:</span>{' '}
                      <span className="card-upgrade-def-rule">{u.rule}</span>
                      <LimitedBubbles count={limitedCount(u.rule, cls)} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {specials.length > 0 && (
              <>
                <div className="card-section-heading">SPECIAL RULES</div>
                <div className="card-trait-defs">
                  {specials.map(s => (
                    <div key={s.name} className="card-trait-def-entry">
                      <span className="card-trait-def-name">{s.name}:</span> {s.rule}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}
    </div>
  );
}

// Pill (armor) or circle (structure) pip block. Critical markers M/D/Ø
// land at the quarter-thresholds for structure.
function PipBlock({ kind, total }) {
  if (!total) return null;
  const isStructure = kind === 'structure';
  const points = [];
  if (isStructure) {
    const parts = 4;
    const base = Math.floor(total / parts);
    const remainder = total % parts;
    const chunks = Array(parts).fill(base);
    for (let i = 0; i < remainder; i++) chunks[i] += 1;
    const map = ['M', 'D', 'Ø'];
    chunks.forEach((count, idx) => {
      for (let j = 0; j < count; j++) {
        const isLast = j === count - 1;
        points.push(isLast && map[idx] ? map[idx] : null);
      }
    });
  } else {
    for (let i = 0; i < total; i++) points.push(null);
  }

  // Wrap into rows of 5 for armor, 6 for structure.
  const rowSize = isStructure ? 6 : 5;
  const rows = chunk(points, rowSize);

  return (
    <div className="hp-container">
      {rows.map((row, ri) => (
        <div key={ri} className="hp-row">
          {row.map((mark, bi) => (
            <span key={bi} className={`hp ${isStructure ? 'hp-structure' : 'hp-armor'}`}>
              {mark || ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// UNIT SUB-CARD
// One card per sub-unit type (vehicle in a squadron, infantry squad
// in a garrison, etc.). Same physical card size and structure as the
// HE-V cards, with the parent asset name in the class band so the
// player knows which support stack the unit belongs to.
// ============================================================
function UnitSubCard({ parent, parentName, sub, count, flavor, part = 'full', traitItems = [] }) {
  const isCont = part === 'cont';   // continuation card: a slice of trait defs
  const isFront = part === 'front';  // primary card: stats/weapons, no trait defs
  const armVal = parseInt(sub.arm, 10) || 0;
  const strVal = parseInt(sub.str, 10) || 0;
  const spdVal = sub.spd || '';
  const weaponGroups = parseSubunitWeapons(sub.weapons || '');
  const flavorLabel = flavor === 'garrison' ? 'GARRISON' : (parent?.kind || '').toUpperCase();
  const nameSuffix = flavor === 'garrison' && INFANTRY_SQUADS.some(s => s.name === sub.name) ? ' Infantry Squad' : '';
  const traitNames = subunitTraitString(sub, parent, flavor);

  // Flatten to weapon rows for the standard 4-column table, mirroring the
  // HE-V card. Alternates ("X or Y") become their own indented "or" rows.
  const weaponRows = [];
  weaponGroups.forEach(g => {
    const def = findVehicleWeapon(g.name);
    weaponRows.push({
      name: g.name,
      dmg: def?.dmg || '—',
      range: inferRange(def?.traits),
      traits: filterDisplayTraits(def?.traits),
      limited: limitedCount(def?.traits),
    });
    g.alts.forEach(altName => {
      const adef = findVehicleWeapon(altName);
      weaponRows.push({
        name: `or ${altName}`,
        dmg: adef?.dmg || '—',
        range: inferRange(adef?.traits),
        traits: filterDisplayTraits(adef?.traits),
        limited: limitedCount(adef?.traits),
      });
    });
  });

  return (
    <div className="game-card-inner">
      <header className="card-name-band">
        {sub.name}{nameSuffix}
        {isCont && <span className="card-cont-flag">CONT'D</span>}
        {count > 1 && !isCont && (
          <span style={{ marginLeft: 6, color: 'var(--rust)', fontFamily: 'var(--font-mono)', fontSize: '11pt' }}>
            ×{count}
          </span>
        )}
      </header>

      {!isCont && (
        <>
          {/* Class + stats row — same structure as the HE-V card so the stats
              table doesn't stretch to fill the whole card. */}
          <div className="card-row card-row-id">
            <div className="card-class-band">{flavorLabel} · {parentName}</div>
            <table className="card-stats-table">
              <thead>
                <tr><th>SPD</th><th>Def</th></tr>
              </thead>
              <tbody>
                <tr><td>{spdVal || '—'}</td><td>4+</td></tr>
              </tbody>
            </table>
          </div>

          {/* Armor + Structure pips */}
          {(armVal > 0 || strVal > 0) && (
            <div className="card-row-damage">
              {armVal > 0 && (
                <div className="card-armor-col">
                  <div className="hp-heading">ARMOR</div>
                  <PipBlock kind="armor" total={armVal} />
                </div>
              )}
              {strVal > 0 && (
                <div className="card-structure-col">
                  <div className="card-structure-stack">
                    <div className="hp-heading">STRUCTURE</div>
                    <PipBlock kind="structure" total={strVal} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weapons — identical table format to the HE-V card. */}
          {weaponRows.length > 0 && (
            <table className="card-weapons-table">
              <thead>
                <tr>
                  <th className="card-weapons-th">WEAPONS</th>
                  <th className="num">Dmg</th>
                  <th className="num">Rng</th>
                  <th>Traits</th>
                </tr>
              </thead>
              <tbody>
                {weaponRows.map((w, i) => (
                  <tr key={i}>
                    <td>{w.name}</td>
                    <td className="num">{w.dmg}</td>
                    <td className="num">{w.range}</td>
                    <td className="card-traits">
                      {w.traits}
                      <LimitedBubbles count={w.limited} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TRAITS: every trait the unit has, by name (shared ones are
              explained once on the summary's Traits in Play), then full
              definitions for its distinctive traits. */}
          <div className="card-section-heading">TRAITS</div>
          {traitNames && <div className="card-trait-names">{traitNames}</div>}
          {part === 'full' && traitItems.length > 0 && (
            <div className="card-trait-defs">
              {traitItems.map(d => (
                <div key={d.key} className="card-trait-def-entry">
                  <span className="card-trait-def-name">{d.title}:</span> {d.text}
                </div>
              ))}
            </div>
          )}
          {isFront && (
            <div className="card-cont-note">▸ Trait rules on next card</div>
          )}
        </>
      )}

      {/* Continuation face: the next slice of distinctive trait definitions. */}
      {isCont && traitItems.length > 0 && (
        <>
          <div className="card-section-heading">TRAITS</div>
          <div className="card-trait-defs">
            {traitItems.map(d => (
              <div key={d.key} className="card-trait-def-entry">
                <span className="card-trait-def-name">{d.title}:</span> {d.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Splits an array into rows of N items.
function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}


function findPerk(factionData, name) {
  for (const group of Object.values(factionData.perks || {})) {
    const found = group.find(p => p.name === name);
    if (found) return found;
  }
  return null;
}

// Helpers
function movDefault(cls) {
  return { Light: 8, Medium: 6, Heavy: 5, Ultraheavy: 4 }[cls] || 6;
}
function jumpDefault(cls, mech) {
  if (!mech.upgrades.includes('Jump Jets')) return null;
  return { Light: 6, Medium: 5, Heavy: 4, Ultraheavy: 3 }[cls] || 4;
}
function defDefault(cls) {
  return { Light: 4, Medium: 5, Heavy: 6, Ultraheavy: 6 }[cls] || 5;
}
function inferRange(traits) {
  if (!traits) return '∞';
  const m = traits.match(/Short\s*\(([^)]+)\)/i);
  if (m) return m[1];
  if (/Melee/i.test(traits)) return 'melee';
  return '∞';
}
function meleeDamage(w, cls) {
  const m = (w.traits || '').match(/Melee\s*\(([^)]+)\)/i);
  if (!m) return '—';
  const parts = m[1].split('/');
  const idx = ['Light', 'Medium', 'Heavy', 'Ultraheavy'].indexOf(cls);
  return parts[idx] || parts[0];
}
// Build the traits string for a weapon on a specific class's card. Per-class
// slashed values like "Melee (3/3/4/4)" or "Reach (1/2/2/3)" are collapsed to
// the single value for this class ("Melee (4)", "Reach (2)"); a "-" value drops
// the trait entirely. Limited and Short are omitted (Short feeds the Rng column).
function filterDisplayTraits(traits, cls) {
  if (!traits) return '';
  const idx = ['Light', 'Medium', 'Heavy', 'Ultraheavy'].indexOf(cls);
  return traits
    .split(/,\s*/)
    .filter(t => !/Limited\s*\(/i.test(t) && !/Short\s*\(/i.test(t))
    .map(t => {
      let dropped = false;
      const resolved = t.replace(/\(([^)]*)\)/g, (m, inner) => {
        if (!inner.includes('/')) return m; // single value — leave as-is
        const parts = inner.split('/');
        const val = (idx >= 0 && parts[idx] != null ? parts[idx] : parts[0]).trim();
        if (val === '-' || val === '') dropped = true;
        return `(${val})`;
      });
      return dropped ? null : resolved;
    })
    .filter(Boolean)
    .join(', ');
}

// Extract the Limited (X) value from a trait/rule string, resolved per class
// (e.g. Mine Drone Carrier's "Limited (1/2/3/3)"). Returns 0 if none.
function limitedCount(text, cls) {
  if (!text) return 0;
  const m = text.match(/Limited\s*\(([^)]+)\)/i);
  if (!m) return 0;
  const inner = m[1].trim();
  if (inner.includes('/')) {
    const idx = ['Light', 'Medium', 'Heavy', 'Ultraheavy'].indexOf(cls);
    const v = parseInt((idx >= 0 ? inner.split('/')[idx] : inner.split('/')[0]), 10);
    return isNaN(v) ? 0 : v;
  }
  const v = parseInt(inner, 10);
  return isNaN(v) ? 0 : v;
}

// A row of N open bubbles for ticking off uses of a Limited (X) item in play.
function LimitedBubbles({ count }) {
  if (!count || count < 1) return null;
  return (
    <span className="limited-bubbles" aria-label={`Limited ${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="limited-bubble" />
      ))}
    </span>
  );
}

// ============================================================
// AGENDAS — every secondary agenda the force qualifies for, with full
// verbatim text. Computation only; rendering happens on the SummaryPage.
// ============================================================
function computeQualifiedAgendas(mechs, faction, selectedTeams) {
  const lightCount  = mechs.filter(m => m.weightClass === 'Light').length;
  const mediumCount = mechs.filter(m => m.weightClass === 'Medium').length;
  const heavyCount  = mechs.filter(m => m.weightClass === 'Heavy').length;

  const qualified = [];

  // 1. Faction agenda
  if (faction) {
    const fdata = FACTIONS[faction];
    const raw = fdata?.agenda || '';
    const colon = raw.indexOf(':');
    qualified.push({
      name: colon > -1 ? raw.slice(0, colon).trim() : faction,
      source: faction,
      req: null,
      text: colon > -1 ? raw.slice(colon + 1).trim() : raw,
    });
  }

  // 2. Universal agendas (check force composition)
  const uQual = {
    'Stalkers':      lightCount  >= 2,
    'Brawlers':      mediumCount >= 2,
    'Enforcers':     heavyCount  >= 2,
    'Titan-Killers': true, // opponent-dependent; include always
  };
  UNIVERSAL_AGENDAS.forEach(a => {
    if (uQual[a.name]) qualified.push({ name: a.name, source: 'Universal', req: a.req, text: a.text });
  });

  // 3. Team agendas for selected teams
  [...TEAMS].sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
    if (!t.agenda || !selectedTeams.includes(t.name)) return;
    const raw = t.agenda;
    const colon = raw.indexOf(':');
    qualified.push({
      name: colon > -1 ? raw.slice(0, colon).trim() : t.name,
      source: t.name,
      req: null,
      text: colon > -1 ? raw.slice(colon + 1).trim() : raw,
    });
  });

  return qualified;
}
