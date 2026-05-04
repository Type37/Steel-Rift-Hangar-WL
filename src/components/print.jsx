import React from 'react';
import { WC, MISSIONS, RANGED, MELEE, UPGRADES, DEFENSIVE, FACTIONS, TEAMS } from '../data';
import { calcMech, valForClass, totalWeaponCost, findAsset, findWeapon } from '../calc';
import { GLOSSARY } from '../glossary';

// ============================================================
// PRINT VIEW
// One game card per HE-V with HP/Armor track boxes for play.
// Reference page after with traits, factions, teams, support assets.
// ============================================================

export function PrintView({
  forceName, mission, customTons, mechs,
  supportAssets, faction, perks, selectedTeams, simpleMode,
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const totalTons =
    mechs.reduce((s, m) => s + calcMech(m).totalUsed, 0) +
    supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0);

  return (
    <div className="print-only" style={{
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      color: '#000',
      fontSize: 11.5,
      lineHeight: 1.45,
    }}>
      {/* Page 1: Force header + game cards */}
      <div className="print-page">
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
        />

        {mechs.map((m, i) => (
          <HEVCard key={m.id} mech={m} index={i} />
        ))}

        {supportAssets.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h2 style={cardSectionTitle}>Support Assets</h2>
            {supportAssets.map(n => {
              const a = findAsset(n);
              if (!a) return null;
              return <SupportCard key={n} asset={a} />;
            })}
          </div>
        )}
      </div>

      {/* Page 2: reference sheet */}
      <div className="print-page">
        <ReferenceSheet
          faction={faction}
          perks={perks}
          teams={selectedTeams}
          mechs={mechs}
          simpleMode={simpleMode}
        />
      </div>
    </div>
  );
}

// ----- Force header -----
function ForceHeader({ forceName, mission, useCustom, cap, totalTons, mechCount, supportCount, faction, perks, teams }) {
  return (
    <div style={{
      borderBottom: '3px double #000',
      paddingBottom: 8,
      marginBottom: 14,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    }}>
      <div>
        <div style={{
          fontFamily: "'Chakra Petch', sans-serif",
          fontSize: 28, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {forceName || 'Unnamed Force'}
        </div>
        <div className="mono" style={{ fontSize: 10, color: '#444', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          THE FORGE · v1.5 · {new Date().toLocaleDateString()}
        </div>
        {(faction || teams.length > 0) && (
          <div style={{ fontSize: 11, marginTop: 6 }}>
            {faction && (
              <span><strong>{faction}</strong>{perks.length > 0 && ` — ${perks.join(' · ')}`}</span>
            )}
            {teams.length > 0 && <span> · <strong>Teams:</strong> {teams.join(', ')}</span>}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="stencil" style={{
          fontSize: 13, letterSpacing: '0.18em', fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          {useCustom ? 'CUSTOM' : mission}
        </div>
        <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
          {totalTons} / {cap}t
        </div>
        <div className="mono" style={{ fontSize: 10, color: '#444' }}>
          {mechCount} HE-V · {supportCount} support
        </div>
      </div>
    </div>
  );
}

// ----- HE-V game card -----
function HEVCard({ mech, index }) {
  const stats = calcMech(mech);
  const wc = WC[mech.weightClass];
  const armor = stats.effectiveArmor;
  const structure = mech.structure;
  const baseArmor = mech.armor;
  const extraArmor = stats.defensiveArmorBonus;

  return (
    <div className="game-card">
      {/* Card header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '1.5px solid #000', paddingBottom: 6, marginBottom: 8,
      }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: '#666', letterSpacing: '0.18em' }}>
            {String(index + 1).padStart(2, '0')} · {mech.weightClass.toUpperCase()} · {wc.tons}t
          </div>
          <div style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
            marginTop: 2,
          }}>
            {mech.name || 'Unnamed'}
          </div>
          {mech.description && (
            <div style={{ fontSize: 10.5, fontStyle: 'italic', color: '#555', marginTop: 2 }}>
              {mech.description}
            </div>
          )}
        </div>
        <div className="mono" style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
          {stats.totalUsed}/{wc.tons}t
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
        border: '1px solid #000',
        marginBottom: 8,
      }}>
        <Stat label="Armor" value={armor} />
        <Stat label="Structure" value={structure} />
        <Stat label="Slots" value={`${stats.totalSlotsUsed}/${stats.capSlots}`} />
        <Stat label="Move" value={moveForClass(mech.weightClass)} last />
      </div>

      {/* HP track */}
      <div style={{ marginBottom: 8 }}>
        <div className="stencil" style={{ fontSize: 10, marginBottom: 3, letterSpacing: '0.18em' }}>
          ARMOR ({armor})
        </div>
        <div className="hp-row">
          {Array.from({ length: baseArmor }, (_, i) => (
            <span key={`a${i}`} className="hp-box armor" />
          ))}
          {Array.from({ length: extraArmor }, (_, i) => (
            <span key={`xa${i}`} className="hp-box extra-armor" title="Extra armor" />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div className="stencil" style={{ fontSize: 10, marginBottom: 3, letterSpacing: '0.18em' }}>
          STRUCTURE ({structure})
        </div>
        <div className="hp-row">
          {Array.from({ length: structure }, (_, i) => (
            <span key={`s${i}`} className="hp-box structure" />
          ))}
        </div>
        <div style={{ fontSize: 9.5, color: '#666', marginTop: 3, fontStyle: 'italic' }}>
          {mech.weightClass === 'Light' && 'Fragile Internals: structure damage applies +1 (page reference: HE-V class table).'}
          {mech.weightClass === 'Ultraheavy' && 'Backup Systems: roll vs Critical Damage when structure depleted.'}
        </div>
      </div>

      {/* Weapons */}
      {mech.weapons.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <h3 style={cardSectionTitle}>Weapons</h3>
          <table style={cardTable}>
            <thead>
              <tr>
                <th style={cardTh}>Name</th>
                <th style={cardTh}>Dmg</th>
                <th style={cardTh}>Cost</th>
                <th style={{ ...cardTh, textAlign: 'left' }}>Traits</th>
              </tr>
            </thead>
            <tbody>
              {mech.weapons.flatMap(w => {
                const def = findWeapon(w.name);
                if (!def) return [];
                const dmg = valForClass(def.dmg, mech.weightClass);
                const total = totalWeaponCost(def, mech.weightClass, w.count);
                return [{
                  key: w.name,
                  name: w.count > 1 ? `${w.name} ×${w.count}` : w.name,
                  dmg,
                  cost: `${total}t`,
                  traits: def.traits,
                }];
              }).map(r => (
                <tr key={r.key}>
                  <td style={cardTd}>{r.name}</td>
                  <td style={{ ...cardTd, textAlign: 'center', fontFamily: 'monospace' }}>{r.dmg}</td>
                  <td style={{ ...cardTd, textAlign: 'center', fontFamily: 'monospace' }}>{r.cost}</td>
                  <td style={{ ...cardTd, fontSize: 10 }}>{r.traits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upgrades + Defensive in two columns */}
      {(mech.upgrades.length > 0 || mech.defensive.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {mech.upgrades.length > 0 && (
            <div>
              <h3 style={cardSectionTitle}>Upgrades</h3>
              {mech.upgrades.map(u => {
                const def = UPGRADES.find(x => x.name === u);
                if (!def) return null;
                const c = valForClass(def.cost, mech.weightClass);
                return (
                  <div key={u} style={{ marginBottom: 5 }}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>
                      {u} <span className="mono" style={{ color: '#666' }}>({c}t{def.compact ? ', compact' : ''})</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#222', lineHeight: 1.4 }}>{def.rule}</div>
                  </div>
                );
              })}
            </div>
          )}
          {mech.defensive.length > 0 && (
            <div>
              <h3 style={cardSectionTitle}>Defensive</h3>
              {mech.defensive.map(d => {
                const def = DEFENSIVE.find(x => x.name === d);
                if (!def) return null;
                const c = valForClass(def.cost, mech.weightClass);
                return (
                  <div key={d} style={{ marginBottom: 5 }}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>
                      {d} <span className="mono" style={{ color: '#666' }}>({c}t)</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#222', lineHeight: 1.4 }}>{def.rule}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, last }) {
  return (
    <div style={{
      padding: '6px 8px',
      borderRight: last ? 'none' : '1px solid #000',
      textAlign: 'center',
    }}>
      <div className="stencil" style={{ fontSize: 9, letterSpacing: '0.16em', color: '#555' }}>{label}</div>
      <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// Approximation — full rules have movement per upgrade. This is the base.
function moveForClass(cls) {
  return { Light: '8"', Medium: '6"', Heavy: '5"', Ultraheavy: '4"' }[cls] || '—';
}

// ----- Support card -----
function SupportCard({ asset }) {
  return (
    <div className="game-card" style={{ padding: '6mm 7mm' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="stencil" style={{ fontSize: 14, letterSpacing: '0.06em' }}>
          {asset.name}
        </div>
        <div className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
          {asset.cost}t · {asset.kind}
        </div>
      </div>
      <div style={{ fontSize: 10.5, marginTop: 4, lineHeight: 1.5 }}>{asset.fullDesc}</div>
      {asset.stats && (
        <table style={{ ...cardTable, marginTop: 6 }}>
          <tbody>
            {Object.entries(asset.stats).map(([k, v]) => (
              <tr key={k}>
                <td style={{ ...cardTd, fontWeight: 700, width: '30%' }}>{k}</td>
                <td style={{ ...cardTd, fontFamily: 'monospace' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ----- Reference sheet -----
function ReferenceSheet({ faction, perks, teams, mechs, simpleMode }) {
  // Collect every unique trait actually used in this list
  const usedTraits = new Set();
  mechs.forEach(m => {
    m.weapons.forEach(w => {
      const def = findWeapon(w.name);
      if (!def) return;
      def.traits.split(/,\s*/).forEach(t => {
        const m2 = t.match(/^([A-Za-z\-]+)/);
        if (m2) usedTraits.add(m2[1].toLowerCase());
      });
    });
  });

  const factionData = faction ? FACTIONS[faction] : null;
  const teamObjs = teams.map(t => TEAMS.find(td => td.name === t)).filter(Boolean);

  return (
    <div>
      <h2 style={{
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        borderBottom: '3px double #000', paddingBottom: 6, marginBottom: 14,
      }}>
        Reference
      </h2>

      {factionData && !simpleMode && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={cardSectionTitle}>Faction · {faction}</h3>
          <div style={{ fontSize: 11, marginBottom: 4 }}>
            <strong>Faction Agenda:</strong> {factionData.agenda}
          </div>
          {perks.length > 0 && perks.map(pn => {
            // Find perk text
            for (const opts of Object.values(factionData.perks)) {
              const p = opts.find(o => o.name === pn);
              if (p) return (
                <div key={pn} style={{ marginTop: 4, fontSize: 11 }}>
                  <strong>{p.name}:</strong> {p.text}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {teamObjs.length > 0 && !simpleMode && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={cardSectionTitle}>Teams</h3>
          {teamObjs.map(t => (
            <div key={t.name} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px dotted #999' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: 10.5, marginTop: 2 }}><em>Benefits.</em> {t.benefits}</div>
              <div style={{ fontSize: 10.5, marginTop: 2 }}><em>Agenda.</em> {t.agenda}</div>
            </div>
          ))}
        </div>
      )}

      {usedTraits.size > 0 && (
        <div>
          <h3 style={cardSectionTitle}>Trait Reference</h3>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px',
          }}>
            {[...usedTraits].sort().map(t => {
              const def = GLOSSARY[t];
              if (!def) return null;
              return (
                <div key={t} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="stencil" style={{ fontSize: 11, marginBottom: 2 }}>{def.title}</div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.4 }}>{def.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Shared print styles
const cardSectionTitle = {
  fontFamily: "'Schibsted Grotesk', sans-serif",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  margin: '0 0 5px',
  paddingBottom: 2,
  borderBottom: '1px solid #000',
};

const cardTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 10.5,
};
const cardTh = {
  textAlign: 'left',
  padding: '3px 6px',
  borderBottom: '1px solid #000',
  fontFamily: "'Schibsted Grotesk', sans-serif",
  fontSize: 9.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
};
const cardTd = {
  padding: '3px 6px',
  borderBottom: '1px solid #ccc',
  verticalAlign: 'top',
};
