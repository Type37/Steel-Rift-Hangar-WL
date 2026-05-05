import React from 'react';
import { WC, MISSIONS, RANGED, MELEE, UPGRADES, DEFENSIVE, FACTIONS, TEAMS } from '../data';
import { calcMech, valForClass, totalWeaponCost, findAsset, findWeapon } from '../calc';
import { GLOSSARY } from '../glossary';
import { collectTraits } from './ui';

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
  factionLogo, supportNicknames = {}, supportLoadouts = {},
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const totalTons =
    mechs.reduce((s, m) => s + calcMech(m).totalUsed, 0) +
    supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0);

  // Build the deck: HE-V cards first, then a card per support asset.
  const deck = [];
  mechs.forEach((m, i) => deck.push({ kind: 'hev', mech: m, idx: i }));
  supportAssets.forEach((name) => {
    const a = findAsset(name);
    if (a) deck.push({
      kind: 'support',
      asset: a,
      customName: supportNicknames[name],
      loadout: supportLoadouts[name],
    });
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
    <div className="print-only">
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

      {pages.map((page, pi) => (
        <div key={pi} className="print-page print-cards-page">
          <div className="page-card-grid">
            {page.map((slot, ci) => (
              <div key={ci} className="game-card">
                {slot.kind === 'hev'
                  ? <HEVCard mech={slot.mech} index={slot.idx} />
                  : <SupportCard asset={slot.asset} customName={slot.customName} loadout={slot.loadout} />}
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

      {(upgrades.length > 0 || defensive.length > 0) && (
        <>
          <div className="card-section-heading">UPGRADES</div>
          <div className="card-upgrades-list">
            {[...upgrades, ...defensive].map(u => u.name).join(' · ')}
          </div>
        </>
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
  const traits = stats.Traits || stats.traits || '';
  const statEntries = Object.entries(stats).filter(([k]) =>
    !/Trait|trait|Description|description/i.test(k)
  );

  // Roll up the loadout into "N x SubName" lines.
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
        {customName && (
          <div className="card-class-band" style={{ flex: 1, fontStyle: 'italic', fontSize: '6.5pt', color: '#555' }}>
            ({a.name})
          </div>
        )}
      </div>

      {a.summary && (
        <div className="card-support-summary">{a.summary}</div>
      )}

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

      {statEntries.length > 0 && (
        <>
          <div className="card-section-heading">STATS</div>
          <table className="card-support-stats">
            <tbody>
              {statEntries.map(([k, v]) => (
                <tr key={k}>
                  <th>{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {traits && (
        <>
          <div className="card-section-heading">TRAITS</div>
          <div className="card-upgrades-list">{traits}</div>
        </>
      )}

      {a.fullDesc && (
        <div className="card-support-rules">{a.fullDesc}</div>
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
