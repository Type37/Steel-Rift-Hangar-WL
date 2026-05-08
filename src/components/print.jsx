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
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const totalTons =
    mechs.reduce((s, m) => s + calcMech(m).totalUsed, 0) +
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

  // Chunk into pages of 9.
  const pages = [];
  for (let i = 0; i < deck.length; i += 9) pages.push(deck.slice(i, i + 9));

  // Collect every trait used in this force for the reference section.
  const traitsUsed = new Set();
  mechs.forEach(m => {
    m.weapons.forEach(w => collectTraits(findWeapon(w)?.traits || '').forEach(t => traitsUsed.add(t)));
  });
  supportAssets.forEach(n => {
    const a = findAsset(n);
    collectTraits(a?.stats?.Traits || '').forEach(t => traitsUsed.add(t));
  });

  return (
    <div className={previewMode ? 'print-preview-mode' : 'print-only'}>
      {previewMode && (
        <div className="print-preview-toolbar no-print">
          <div className="print-preview-toolbar-left">
            <span className="print-preview-toolbar-title">Print Preview</span>
            <span className="print-preview-toolbar-meta">{pages.length + 2} pages</span>
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
      <div className="print-page print-cover">
        <ForceHeader
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
        />
      </div>

      {/* AGENDA PAGE — always page 1 after cover */}
      <AgendaPage mechs={mechs} faction={faction} selectedTeams={selectedTeams} />

      {pages.map((page, pi) => (
        <div key={pi} className="print-page print-cards-page">
          <div className="page-card-grid">
            {page.map((slot, ci) => (
              <div key={ci} className="game-card">
                {slot.kind === 'hev' && <HEVCard mech={slot.mech} index={slot.idx} />}
                {slot.kind === 'support' && <SupportCard asset={slot.asset} customName={slot.customName} loadout={slot.loadout} />}
                {slot.kind === 'subunit' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.sub} count={slot.count} flavor="subunit" />}
                {slot.kind === 'garrison' && <UnitSubCard parent={slot.parent} parentName={slot.parentName} sub={slot.squad} count={slot.count} flavor="garrison" />}
              </div>
            ))}
            {Array.from({ length: 9 - page.length }).map((_, i) => (
              <div key={`pad-${i}`} className="game-card game-card-blank" />
            ))}
          </div>
        </div>
      ))}

      {(traitsUsed.size > 0 || (faction && perks.length > 0) || selectedTeams.length > 0) && (
        <div className="print-page print-ref-page">
          <ReferencePage
            faction={faction}
            perks={perks}
            teams={selectedTeams}
            traits={Array.from(traitsUsed).sort()}
            mechs={mechs}
          />
        </div>
      )}
      </div>
    </div>
  );
}

// ============================================================
// FORCE HEADER (cover sheet)
// ============================================================
function ForceHeader({
  forceName, mission, useCustom, cap, totalTons,
  mechCount, supportCount, faction, perks, teams, factionLogo,
}) {
  return (
    <div className="print-cover-inner">
      {factionLogo && (
        <img src={factionLogo} alt="" className="print-faction-logo" />
      )}
      <div className="print-force-id">
        <div className="print-force-eyebrow">FORCE ROSTER</div>
        <div className="print-force-name">
          {forceName || 'Unnamed Force'}
        </div>
        <div className="print-force-meta">
          {mission}{useCustom ? '' : ' Mission'} · {totalTons} / {cap} tons · {mechCount} HE-V{mechCount === 1 ? '' : 's'} · {supportCount} support
        </div>
      </div>

      {faction && (
        <div className="print-block">
          <div className="print-block-label">Faction</div>
          <div className="print-block-value">{faction}</div>
          {perks.length > 0 && (
            <div className="print-block-sub">
              Perks: {perks.join(' · ')}
            </div>
          )}
          {FACTIONS[faction]?.agenda && (
            <div className="print-block-sub print-italic">
              Agenda: {FACTIONS[faction].agenda}
            </div>
          )}
        </div>
      )}

      {teams.length > 0 && (
        <div className="print-block">
          <div className="print-block-label">HE-V Teams</div>
          <div className="print-block-value">{teams.join(' · ')}</div>
        </div>
      )}
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

  const weapons = mech.weapons.map(name => {
    const w = findWeapon(name);
    if (!w) return null;
    const dmg = valForClass(w.dmg, cls);
    const cost = valForClass(w.cost, cls);
    if (cost === '-') return null;
    const range = inferRange(w.traits);
    return {
      name,
      dmg: w.kind === 'melee' ? meleeDamage(w, cls) : `${dmg}`,
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

  return (
    <div className="game-card-inner">
      {/* Header band */}
      <header className="card-name-band">
        {mech.name || `${cls.toUpperCase()} HE-V`}
      </header>

      {/* Class + stats row, two columns */}
      <div className="card-row card-row-id">
        <div className="card-class-band">{cls.toUpperCase()} HE-V</div>
        <table className="card-stats-table">
          <thead>
            <tr><th>Tng</th><th>Mov</th><th>Jmp</th><th>Def</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{wc.baseTons}</td>
              <td>{move}"</td>
              <td>{jumpVal != null ? `${jumpVal}"` : '—'}</td>
              <td>{def}+</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Damage row: ARMOR (col-5) | STRUCTURE + CRIT legend (col-7) */}
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
              <td>{w.name}</td>
              <td className="num">{w.dmg}</td>
              <td className="num">{w.range}</td>
              <td className="card-traits">{w.traits}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Per-weapon trait explanations with resolved X values */}
      {(() => {
        // Collect all unique trait strings across all weapons
        const allTraits = weapons.map(w => w.traits).filter(Boolean).join(', ');
        if (!allTraits) return null;
        const defs = resolveTraitDefs(allTraits);
        if (!defs.length) return null;
        return (
          <div className="card-trait-defs">
            {defs.map(d => (
              <div key={d.key || d.title} className="card-trait-def-entry">
                <span className="card-trait-def-name">{d.title}:</span>{' '}
                {d.text}
              </div>
            ))}
          </div>
        );
      })()}

      {(upgrades.length > 0 || defensive.length > 0) && (
        <>
          <div className="card-section-heading">UPGRADES</div>
          <div className="card-upgrades-list">
            {[...upgrades, ...defensive].map(u => {
              const drones = mech.drones || {};
              // If a drone is assigned to this upgrade, show the target
              const droneEntries = Object.entries(drones).filter(([,target]) => target === u.name);
              const suffix = droneEntries.length > 0 ? ` [${droneEntries.map(([d]) => d).join(', ')}]` : '';
              return u.name + suffix;
            }).join(' · ')}
          </div>
          {/* Show drones and their targets */}
          {Object.keys(mech.drones || {}).length > 0 && (
            <div className="card-upgrades-list" style={{ marginTop: 2, fontStyle: 'italic', fontSize: '6.5pt' }}>
              {Object.entries(mech.drones).map(([drone, target]) => (
                <span key={drone}>{drone}{target ? ` → ${target}` : ' (unassigned)'} · </span>
              ))}
            </div>
          )}
        </>
      )}
      {/* Light: Fragile Internals reminder */}
      {cls === 'Light' && (
        <div className="card-section-heading" style={{ marginTop: 4 }}>FRAGILE INTERNALS</div>
      )}
      {cls === 'Light' && (
        <div className="card-upgrades-list" style={{ fontSize: '6pt', lineHeight: 1.4 }}>
          Roll 1D6 per point of Structure Damage lost. On 5+, suffer 1 additional point of Damage. This does not trigger further Fragile Internals rolls.
        </div>
      )}

      {/* Ultraheavy: Backup Systems Engage reminder */}
      {cls === 'Ultraheavy' && (
        <div className="card-section-heading" style={{ marginTop: 4 }}>BACKUP SYSTEMS ENGAGE</div>
      )}
      {cls === 'Ultraheavy' && (
        <div className="card-upgrades-list" style={{ fontSize: '6pt', lineHeight: 1.4 }}>
          Roll 1D6 per point of Structure Damage lost. On 5+, a point of Damage is ignored and the Structure is not reduced.
        </div>
      )}
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

// ============================================================
// REFERENCE PAGE
// ============================================================
function ReferencePage({ faction, perks, teams, traits, mechs }) {
  const upgradesUsed = new Set();
  mechs.forEach(m => m.upgrades.forEach(u => upgradesUsed.add(u)));
  const upgradeDefs = Array.from(upgradesUsed)
    .map(name => UPGRADES.find(u => u.name === name))
    .filter(Boolean);

  const teamDefs = teams
    .map(name => TEAMS.find(t => t.name === name))
    .filter(Boolean);

  const factionData = faction ? FACTIONS[faction] : null;

  return (
    <div className="print-ref">
      <h1 className="print-ref-h1">Reference</h1>

      {factionData && perks.length > 0 && (
        <section className="print-ref-section">
          <h2 className="print-ref-h2">{faction} Perks</h2>
          <dl className="print-ref-dl">
            {perks.map(perkName => {
              const perkDef = findPerk(factionData, perkName);
              if (!perkDef) return null;
              return (
                <React.Fragment key={perkName}>
                  <dt>{perkName}</dt>
                  <dd>{perkDef.text}</dd>
                </React.Fragment>
              );
            })}
          </dl>
        </section>
      )}

      {teamDefs.length > 0 && (
        <section className="print-ref-section">
          <h2 className="print-ref-h2">HE-V Teams</h2>
          {teamDefs.map(t => (
            <div key={t.name} className="print-ref-team">
              <div className="print-ref-team-name">{t.name}</div>
              <div className="print-ref-team-blurb">{t.blurb}</div>
            </div>
          ))}
        </section>
      )}

      {upgradeDefs.length > 0 && (
        <section className="print-ref-section">
          <h2 className="print-ref-h2">Upgrade Rules</h2>
          <dl className="print-ref-dl">
            {upgradeDefs.map(u => (
              <React.Fragment key={u.name}>
                <dt>{u.name}</dt>
                <dd>{u.rule}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      )}

      {traits.length > 0 && (
        <section className="print-ref-section">
          <h2 className="print-ref-h2">Traits in Play</h2>
          <dl className="print-ref-dl print-ref-dl-2col">
            {traits.map(t => {
              const def = GLOSSARY[t];
              if (!def) return null;
              return (
                <React.Fragment key={t}>
                  <dt>{def.title}</dt>
                  <dd>{def.text}</dd>
                </React.Fragment>
              );
            })}
          </dl>
        </section>
      )}
    </div>
  );
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
  if (!traits) return 'std';
  const m = traits.match(/Short\s*\(([^)]+)\)/i);
  if (m) return m[1];
  if (/Melee/i.test(traits)) return 'melee';
  return 'std';
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
// AGENDA PAGE — page 1 after cover
// Shows every secondary agenda the force qualifies for,
// with full verbatim text. No summaries.
// ============================================================

function AgendaPage({ mechs, faction, selectedTeams }) {
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
  TEAMS.forEach(t => {
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

  if (qualified.length === 0) return null;

  return (
    <div className="print-page print-agenda-page">
      <div className="agenda-page-header">
        <div className="agenda-page-title">Secondary Agendas</div>
        <div className="agenda-page-sub">{qualified.length} available for this force</div>
      </div>
      <div className="agenda-list">
        {qualified.map((a, i) => (
          <div key={i} className="agenda-entry">
            <div className="agenda-entry-head">
              <span className="agenda-entry-name">{a.name}</span>
              <span className="agenda-entry-source">{a.source}</span>
            </div>
            {a.req && (
              <div className="agenda-entry-req">Requires: {a.req}</div>
            )}
            <div className="agenda-entry-text">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
