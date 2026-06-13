import React from 'react';
import { WC, MISSIONS, RANGED, MELEE, UPGRADES, DEFENSIVE, FACTIONS, TEAMS, UNIVERSAL_AGENDAS, INFANTRY_SQUADS, POWER_SUIT_SQUADS, VEHICLE_WEAPONS } from '../data';
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

// ============================================================
// PRINT VIEW
// 2.5" x 3.5" game cards arranged 3 x 3 per Letter page, matching
// the original Death Ray Designs Hangar layout. After all the cards,
// a reference section prints faction perks, teams, traits, and upgrade
// rules on full-width pages.
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
  const deck = [];
  mechs.forEach((m, i) => deck.push({ kind: 'hev', mech: m, idx: i }));

  // Track which asset names we've already emitted garrison cards for, so
  // duplicate asset entries (taking 2 of the same Outpost) don't emit
  // duplicate garrison cards.
  const garrisonsEmitted = new Set();

  supportAssets.forEach((name) => {
    const a = findAsset(name);
    if (!a) return;

    const hasSubunits = a.subunits && a.subunits.length > 0;
    if (!hasSubunits) {
      // Off-table strike or singular asset: keep the existing one-card
      // summary path.
      deck.push({
        kind: 'support',
        asset: a,
        customName: supportNicknames[name],
        loadout: supportLoadouts[name],
      });
    } else {
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
        deck.push({
          kind: 'subunit',
          parent: a,
          parentName: supportNicknames[name] || a.name,
          sub,
          count,
        });
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
        deck.push({
          kind: 'garrison',
          parent: a,
          parentName: supportNicknames[name] || a.name,
          squad,
          count,
        });
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
          </div>
          <div className="print-preview-toolbar-right">
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
                {slot.kind === 'hev' && <HEVCard mech={slot.mech} index={slot.idx} />}
                {slot.kind === 'support' && <SupportCard asset={slot.asset} customName={slot.customName} loadout={slot.loadout} />}
                {slot.kind === 'subunit' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.sub} count={slot.count} flavor="subunit" />}
                {slot.kind === 'garrison' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.squad} count={slot.count} flavor="garrison" />}
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
            {offTableSupport.map(({ name, asset, nickname }) => (
              <div key={name} className="summary-def summary-support">
                <span className="summary-def-name">{nickname || asset.name}</span>
                <span className="summary-def-src">{asset.kind} · {asset.cost}t</span>
                {asset.fullDesc && <div className="summary-def-text">{asset.fullDesc}</div>}
                <div className="summary-turn-track" aria-label="Turn used">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className={`turn-cell${n === 6 ? ' turn-cell-dim' : ''}`}>
                      <div className="turn-num">{n}</div>
                      <div className="turn-bubble" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {agendas.length > 0 && (
          <section className="summary-sec">
            <h2 className="summary-h2">Secondary Agendas</h2>
            {agendas.map((a, i) => (
              <div key={i} className="summary-def">
                <span className="summary-def-name">{a.name}</span>
                <span className="summary-def-src">{a.source}</span>
                {a.req && <span className="summary-def-req"> — requires {a.req}</span>}
                <div className="summary-def-text">{a.text}</div>
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
function HEVCard({ mech, index }) {
  const wc = WC[mech.weightClass];
  const cls = mech.weightClass;
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
      traits: filterDisplayTraits(w.traits),
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
      {/* Header band */}
      <header className="card-name-band">
        {mech.name || `${cls.toUpperCase()} HE-V`}
      </header>

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
          <div className="card-section-heading">WEAPONS</div>
          <table className="card-weapons-table">
            <thead>
              <tr>
                <th>Weapon</th>
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
                  <td className="card-traits">{w.traits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Upgrades with rule text */}
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
        // Class-specific keyword rules
        if (cls === 'Light') {
          entries.push(
            <div key="fragile" className="card-trait-def-entry">
              <span className="card-trait-def-name">Fragile Internals:</span>{' '}
              Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, the Unit suffers one additional point of Damage. This does not trigger further Fragile Internals rolls.
            </div>
          );
        }
        if (cls === 'Ultraheavy') {
          entries.push(
            <div key="backup" className="card-trait-def-entry">
              <span className="card-trait-def-name">Backup Systems Engage:</span>{' '}
              Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, a point of Damage is ignored and the Structure is not reduced.
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
// SUPPORT CARD (2.5" x 3.5")
// ============================================================
function SupportCard({ asset: a, customName, loadout }) {
  const stats = a.stats || {};
  const traitStr = stats.Traits || stats.traits || '';
  const perModelKey = Object.keys(stats).find(k => /per/i.test(k));
  const perModelVal = perModelKey ? stats[perModelKey] : null;

  // Parse ARM and STR from per-model stat string e.g. "SPD 8\", ARM 3, STR 2"
  const armMatch = perModelVal && perModelVal.match(/ARM\s*(\d+)/i);
  const strMatch = perModelVal && perModelVal.match(/STR\s*(\d+)/i);
  const spdMatch = perModelVal && perModelVal.match(/SPD\s*([^,]+)/i);
  const armVal = armMatch ? parseInt(armMatch[1]) : null;
  const strVal = strMatch ? parseInt(strMatch[1]) : null;
  const spdVal = spdMatch ? spdMatch[1].trim() : null;

  // For off-table assets, pull Damage stat
  const dmgVal = stats.Damage || stats.damage || null;
  const weaponsVal = stats.Weapons || stats.weapons || null;

  // Roll up the loadout
  const loadoutBreakdown = (() => {
    if (!loadout || loadout.length === 0) return null;
    const counts = loadout.reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
    return Object.entries(counts);
  })();

  return (
    <div className="game-card-inner">
      <header className="card-name-band">{customName || a.name}</header>
      <div className="card-row card-row-id">
        <div className="card-class-band">
          {a.kind.toUpperCase()} · {a.cost}t
        </div>
      </div>

      {/* Stats row — SPD + Defend-On for on-table, Damage for off-table */}
      {(spdVal || dmgVal) && (
        <table className="card-stats-table" style={{ marginBottom: 2 }}>
          <thead>
            <tr>
              {spdVal && <th>SPD</th>}
              {dmgVal && <th>DMG</th>}
              {spdVal && <th>Def</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              {spdVal && <td>{spdVal}</td>}
              {dmgVal && <td>{dmgVal}</td>}
              {spdVal && <td>4+</td>}
            </tr>
          </tbody>
        </table>
      )}

      {/* Armor + Structure pips for on-table units */}
      {(armVal || strVal) && (
        <div className="card-row-damage" style={{ marginTop: 4 }}>
          {armVal && (
            <div className="card-armor-col">
              <div className="hp-heading">ARMOR</div>
              <PipBlock kind="armor" total={armVal} />
            </div>
          )}
          {strVal && (
            <div className="card-structure-col">
              <div className="card-structure-stack">
                <div className="hp-heading">STRUCTURE</div>
                <PipBlock kind="structure" total={strVal} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loadout for sub-unit pickers */}
      {loadoutBreakdown && (
        <>
          <div className="card-section-heading">LOADOUT</div>
          <ul className="card-loadout-list">
            {loadoutBreakdown.map(([n, c]) => (
              <li key={n}><strong>{c}×</strong> {n}</li>
            ))}
          </ul>
        </>
      )}

      {/* Weapons */}
      {weaponsVal && (
        <>
          <div className="card-section-heading">WEAPONS</div>
          <div className="card-upgrades-list">{weaponsVal}</div>
        </>
      )}

      {/* Traits */}
      {traitStr && (
        <>
          <div className="card-section-heading">TRAITS</div>
          <div className="card-upgrades-list">{traitStr}</div>
        </>
      )}

      {a.fullDesc && (
        <div className="card-support-rules" style={{ fontSize: '6.5pt', marginTop: 4, color: '#555' }}>
          {a.fullDesc}
        </div>
      )}
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
function UnitSubCard({ parent, parentName, sub, count, flavor }) {
  const armVal = parseInt(sub.arm, 10) || 0;
  const strVal = parseInt(sub.str, 10) || 0;
  const spdVal = sub.spd || '';
  const weaponGroups = parseSubunitWeapons(sub.weapons || '');
  const flavorLabel = flavor === 'garrison' ? 'GARRISON' : (parent?.kind || '').toUpperCase();

  return (
    <div className="game-card-inner">
      <header className="card-name-band">
        {sub.name}
        {count > 1 && (
          <span style={{ marginLeft: 6, color: 'var(--rust)', fontFamily: 'var(--font-mono)', fontSize: '11pt' }}>
            ×{count}
          </span>
        )}
      </header>
      <div className="card-row card-row-id">
        <div className="card-class-band">
          {flavorLabel} · {parentName}
        </div>
      </div>

      {/* Stats line: SPD + Defend-On (Auxiliary units defend on 4+ standard) */}
      <table className="card-stats-table" style={{ marginBottom: 2 }}>
        <thead>
          <tr>
            <th>SPD</th>
            <th>Def</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{spdVal || '—'}</td>
            <td>4+</td>
          </tr>
        </tbody>
      </table>

      {/* Armor + Structure pips */}
      <div className="card-row-damage" style={{ marginTop: 4 }}>
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

      {/* Weapons with damage + traits looked up from VEHICLE_WEAPONS */}
      {weaponGroups.length > 0 && (
        <>
          <div className="card-section-heading">WEAPONS</div>
          <div className="card-upgrades-list">
            {weaponGroups.map((g, i) => {
              const def = findVehicleWeapon(g.name);
              const altDefs = g.alts.map(a => ({ name: a, def: findVehicleWeapon(a) }));
              return (
                <div key={i} style={{ marginBottom: 1 }}>
                  <strong>{g.name}</strong>
                  {def && <span style={{ color: '#555' }}> · DMG {def.dmg}</span>}
                  {def?.traits && <span style={{ color: '#555' }}> · {def.traits}</span>}
                  {altDefs.map((alt, ai) => (
                    <div key={ai} style={{ marginLeft: 8 }}>
                      or <strong>{alt.name}</strong>
                      {alt.def && <span style={{ color: '#555' }}> · DMG {alt.def.dmg}</span>}
                      {alt.def?.traits && <span style={{ color: '#555' }}> · {alt.def.traits}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sub-unit traits */}
      {sub.traits && sub.traits !== '—' && (
        <>
          <div className="card-section-heading">TRAITS</div>
          <div className="card-upgrades-list">{sub.traits}</div>
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
function filterDisplayTraits(traits) {
  if (!traits) return '';
  return traits
    .split(/,\s*/)
    .filter(t => !/Limited\s*\(/i.test(t) && !/Short\s*\(/i.test(t))
    .join(', ');
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
