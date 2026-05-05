import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { WC, WC_ORDER, RANGED, MELEE, UPGRADES, DEFENSIVE } from '../data';
import { calcMech, valForClass, copyCost, totalWeaponCost, resetMechToClass } from '../calc';
import { SectionTitle, FieldLabel, StepButton, TraitList, RowExpand, InlineTraitGlossary, collectTraits } from './ui';

// ============================================================
// HE-V EDITOR
// ============================================================
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

export function MechEditor({ mech, mechIndex, onChange, onDelete }) {
  const stats = calcMech(mech);
  const cls = mech.weightClass;
  const wc = WC[cls];
  const defLimit = cls === 'Ultraheavy' ? 2 : 1;

  const [tab, setTab] = useState('ranged');
  const [expanded, setExpanded] = useState({});
  const toggleExpanded = (name) => setExpanded(s => ({ ...s, [name]: !s[name] }));

  const update = (patch) => onChange({ ...mech, ...patch });

  const changeClass = (newCls) => {
    if (newCls === cls) return;
    if (mech.weapons.length || mech.upgrades.length || mech.defensive.length) {
      if (!confirm(`Switching to ${newCls} will reset weapons, upgrades, and armor. Continue?`)) return;
    }
    onChange(resetMechToClass(mech, newCls));
  };

  const equipped = (n) => mech.weapons.find(w => w.name === n);
  const addWeapon = (name) => {
    const e = equipped(name);
    if (e) update({ weapons: mech.weapons.map(w => w.name === name ? { ...w, count: w.count + 1 } : w) });
    else update({ weapons: [...mech.weapons, { name, count: 1 }] });
  };
  const removeWeapon = (name) => {
    const e = equipped(name);
    if (!e) return;
    if (e.count <= 1) update({ weapons: mech.weapons.filter(w => w.name !== name) });
    else update({ weapons: mech.weapons.map(w => w.name === name ? { ...w, count: w.count - 1 } : w) });
  };
  const toggleUpgrade = (name) => {
    if (mech.upgrades.includes(name)) update({ upgrades: mech.upgrades.filter(u => u !== name) });
    else update({ upgrades: [...mech.upgrades, name] });
  };
  const toggleDef = (name) => {
    if (mech.defensive.includes(name)) update({ defensive: mech.defensive.filter(d => d !== name) });
    else update({ defensive: [...mech.defensive, name] });
  };

  return (
    <div>
      {/* Identity strip */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 12, marginBottom: 18,
        position: 'relative',
      }}>
        <img src={asset('icons/hev.svg')} aria-hidden="true"
          style={{
            position: 'absolute', right: -20, top: '50%',
            transform: `translateY(-50%) scale(${
              cls === 'Light' ? 1.1 : cls === 'Medium' ? 1.3 : cls === 'Heavy' ? 1.5 : 1.7
            })`,
            height: 56,
            opacity: 0.045,
            pointerEvents: 'none',
            transformOrigin: 'right center',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="roster-num" style={{ fontSize: 14 }}>
            HE-V {String(mechIndex + 1).padStart(2, '0')}
          </span>
          <span className="stencil" style={{
            fontSize: 12, padding: '3px 8px', border: '1.5px solid var(--ink)',
          }}>
            {wc.abbr}
          </span>
        </div>
        <button
          onClick={() => onDelete(mech.id)}
          className="add-btn"
          style={{
            border: '1.5px solid var(--rust)', background: 'transparent',
            color: 'var(--rust)', padding: '5px 12px', cursor: 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          <Trash2 size={12} strokeWidth={2.5} /> Remove
        </button>
      </div>

      {/* Name + description. Empty name falls back to "<CLASS> HE-V". */}
      <input
        value={mech.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder={`${mech.weightClass.toUpperCase()} HE-V`}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '2px solid var(--ink)',
          padding: '4px 0',
          fontFamily: 'var(--font-display)',
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          outline: 'none',
        }}
      />
      {mech.description && (
        <div style={{
          marginTop: 8, fontSize: 14, color: 'var(--ink-2)', fontStyle: 'italic',
          lineHeight: 1.55,
        }}>
          {mech.description}
        </div>
      )}

      {/* Class picker */}
      <div style={{ marginTop: 22, marginBottom: 18 }}>
        <FieldLabel>Weight Class</FieldLabel>
        <div className="class-picker" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
          background: 'var(--ink)', padding: 4,
        }}>
          {WC_ORDER.map(c => {
            const w = WC[c];
            const active = c === cls;
            return (
              <button
                key={c}
                onClick={() => changeClass(c)}
                className="add-btn"
                style={{
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--surface)',
                  border: 'none',
                  padding: '14px 8px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span className="stencil" style={{
                  fontSize: 12,
                  color: active ? 'var(--mute)' : 'rgba(241,234,218,0.5)',
                }}>
                  {c}
                </span>
                <span className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>
                  {w.tons}t
                </span>
                <span className="mono" style={{
                  fontSize: 10.5, letterSpacing: '0.1em',
                  color: active ? 'var(--mute)' : 'rgba(241,234,218,0.45)',
                  textTransform: 'uppercase',
                }}>
                  {w.slots} slots
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <TonBreakdown stats={stats} cls={cls} wc={wc} />

      {/* Armor / structure adjusters. Each Reinforce step adds 2 points
          and costs 2 tons; each Strip step removes 2 points and refunds
          2 tons. (v1.5 rules p. 18.) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22 }}>
        <Adjuster
          kind="armor"
          value={mech.armor}
          base={wc.baseArmor}
          min={Math.max(0, wc.baseArmor - 4)}
          max={wc.baseArmor + 6}
          onChange={(v) => update({ armor: v })}
        />
        <Adjuster
          kind="structure"
          value={mech.structure}
          base={wc.baseStructure}
          min={Math.max(0, wc.baseStructure - 4)}
          max={wc.baseStructure + 6}
          onChange={(v) => update({ structure: v })}
        />
      </div>

      {/* Catalog tabs */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle tag={`${stats.totalSlotsUsed}/${stats.capSlots} slots used`}>
          Loadout
        </SectionTitle>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'ranged', label: 'Ranged' },
            { id: 'melee', label: 'Melee' },
            { id: 'upgrades', label: 'Upgrades' },
            { id: 'defensive', label: 'Defensive' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="add-btn"
              style={{
                background: tab === t.id ? 'var(--ink)' : 'transparent',
                color: tab === t.id ? 'var(--surface)' : 'var(--ink)',
                border: 'none',
                padding: '9px 18px',
                fontFamily: 'var(--font-stencil)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '2px solid var(--ink)' }}>
          {tab === 'ranged' && RANGED.map(w => (
            <WeaponRow key={w.name} weapon={w} mech={mech}
              equipped={equipped(w.name)} onAdd={addWeapon} onRemove={removeWeapon}
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)} />
          ))}
          {tab === 'melee' && MELEE.map(w => (
            <WeaponRow key={w.name} weapon={w} mech={mech}
              equipped={equipped(w.name)} onAdd={addWeapon} onRemove={removeWeapon}
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)} />
          ))}
          {tab === 'upgrades' && UPGRADES.map(u => (
            <UpgradeRow key={u.name} upgrade={u} mech={mech} onToggle={toggleUpgrade}
              expanded={expanded[u.name]} onExpand={() => toggleExpanded(u.name)} />
          ))}
          {tab === 'defensive' && (
            <>
              <div style={{
                padding: '11px 14px', fontSize: 13, color: 'var(--ink-2)',
                background: 'var(--surface-2)', borderBottom: '1px solid var(--rule)',
                lineHeight: 1.5,
              }}>
                Defensive Configurations don't take an Upgrade slot. Lt/Md/Hv may equip 1; Ultraheavy may equip 2.
                <strong style={{ marginLeft: 8 }}>{mech.defensive.length}/{defLimit} equipped.</strong>
              </div>
              {DEFENSIVE.map(d => (
                <DefRow key={d.name} def={d} mech={mech} onToggle={toggleDef}
                  atLimit={mech.defensive.length >= defLimit}
                  expanded={expanded[d.name]} onExpand={() => toggleExpanded(d.name)} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TONNAGE BREAKDOWN
// ============================================================

function TonBreakdown({ stats, cls, wc }) {
  const pct = Math.min(100, (stats.totalUsed / wc.tons) * 100);
  const remaining = wc.tons - stats.totalUsed;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span className="label">{cls} Tonnage</span>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: stats.overTons ? 'var(--rust)' : 'var(--ink)' }}>
          {stats.totalUsed} / {wc.tons}t
          <span style={{ color: 'var(--mute)', marginLeft: 8, fontWeight: 400 }}>
            ({remaining >= 0 ? `${remaining} free` : `${-remaining} over`})
          </span>
        </span>
      </div>
      <div style={{
        height: 16, background: 'var(--surface-2)',
        border: '1.5px solid var(--rule-strong)', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${pct}%`,
          background: stats.overTons ? 'var(--rust)' : 'var(--olive)',
          transition: 'width 180ms ease-out',
        }} />
        {[0.25, 0.5, 0.75].map(p => (
          <div key={p} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${p * 100}%`,
            width: 1, background: 'rgba(0,0,0,0.18)',
          }} />
        ))}
      </div>
      <div className="ton-breakdown" style={{
        marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)',
      }}>
        {[
          { l: 'Armor', v: stats.armor, sub: stats.defensiveArmorBonus > 0 ? `+${stats.defensiveArmorBonus} eff` : null },
          { l: 'Structure', v: stats.structure },
          { l: 'Weapons', v: `${stats.weaponsTons}t`, sub: `${stats.weaponsSlots} slot${stats.weaponsSlots !== 1 ? 's' : ''}` },
          { l: 'Upgrades', v: `${stats.upgradesTons}t`, sub: `${stats.upgradesSlots} slot${stats.upgradesSlots !== 1 ? 's' : ''}` },
          { l: 'Defensive', v: `${stats.defensiveTons}t` },
        ].map((r, i) => (
          <div key={r.l} style={{
            padding: '9px 10px',
            borderRight: i < 4 ? '1px solid var(--rule)' : 'none',
          }}>
            <div className="label" style={{ fontSize: 10, marginBottom: 2 }}>{r.l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
              {r.v}
            </div>
            {r.sub && <div className="mono" style={{ fontSize: 11, color: 'var(--olive)' }}>{r.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ARMOR / STRUCTURE ADJUSTER
// Each step is +/- 2 points and 2 tons, per v1.5 rules.
// Up = "Reinforce", Down = "Strip".
// ============================================================

function Adjuster({ kind, value, base, min, max, onChange }) {
  const delta = value - base;
  const tonsSpent = value; // 1 ton per point of armor/structure equipped
  const isArmor = kind === 'armor';
  const stepLabel = (dir) => dir === 'up' ? 'Reinforce' : 'Strip';
  const canUp = value < max;
  const canDown = value > min;

  return (
    <div style={{
      border: `2px solid ${isArmor ? 'var(--steel)' : 'var(--olive-deep)'}`,
      background: 'var(--surface)',
      padding: '14px 14px 12px',
      position: 'relative',
    }}>
      {/* Heading row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--rule)',
        paddingBottom: 10, marginBottom: 10,
      }}>
        {isArmor ? <ArmorIcon /> : <StructureIcon />}
        <div style={{ flex: 1 }}>
          <div className="stencil" style={{
            fontSize: 14, letterSpacing: '0.14em', color: 'var(--ink)',
          }}>
            {isArmor ? 'Armor' : 'Structure'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--mute)', marginTop: 1 }}>
            base {base}{delta !== 0 && (
              <span style={{ color: delta > 0 ? 'var(--olive)' : 'var(--rust)', fontWeight: 700, marginLeft: 5 }}>
                ({delta > 0 ? '+' : ''}{delta})
              </span>
            )}
          </div>
        </div>
        <div className="mono" style={{
          fontSize: 36, fontWeight: 700, lineHeight: 1, color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </div>
      </div>

      {/* Pip row: visualizes how many points of armor/structure the HE-V has.
          For armor, plain squares. For structure, the M / D / Ø critical
          markers land at the quarter-thresholds (per v1.5 p.37). */}
      <PipRow value={value} structure={!isArmor} accent={isArmor ? 'steel' : 'olive'} />

      {/* Reinforce / Strip controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 2))}
          disabled={!canDown}
          title={canDown ? `Strip ${isArmor ? 'Armor' : 'Structure'}: -2 points, refund 2 tons.` : 'At minimum.'}
          className="add-btn"
          style={adjusterBtn('down', canDown)}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16 }}>−2</span>
          <span>Strip</span>
          <span className="mono" style={{ opacity: 0.7, fontSize: 10 }}>+2t</span>
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 2))}
          disabled={!canUp}
          title={canUp ? `Reinforce ${isArmor ? 'Armor' : 'Structure'}: +2 points, costs 2 tons.` : 'At maximum.'}
          className="add-btn"
          style={adjusterBtn('up', canUp)}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16 }}>+2</span>
          <span>Reinforce</span>
          <span className="mono" style={{ opacity: 0.7, fontSize: 10 }}>-2t</span>
        </button>
      </div>
    </div>
  );
}

// Pip indicator. Armor: shield-shaped pips in rows of 5.
// Structure: circle pips with M/D/Ø critical markers at quarter thresholds.
function chunkArr(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function PipRow({ value, structure, accent }) {
  if (!value) return null;

  const points = [];
  if (structure) {
    const parts = 4;
    const base = Math.floor(value / parts);
    const remainder = value % parts;
    const chunks = Array(parts).fill(base);
    for (let i = 0; i < remainder; i++) chunks[i] += 1;
    const map = ['M', 'D', '\u00D8'];
    chunks.forEach((count, idx) => {
      for (let j = 0; j < count; j++) {
        const isLast = j === count - 1;
        points.push(isLast && map[idx] ? map[idx] : null);
      }
    });
  } else {
    for (let i = 0; i < value; i++) points.push(null);
  }

  const color = accent === 'steel' ? 'var(--steel)' : 'var(--olive-deep)';
  const rowSize = structure ? 6 : 5;
  const rows = chunkArr(points, rowSize);

  return (
    <div style={{
      padding: '6px 0 2px',
      borderTop: '1px dotted var(--rule)',
      borderBottom: '1px dotted var(--rule)',
      marginBottom: 6,
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 3, marginBottom: ri < rows.length - 1 ? 3 : 0 }}>
          {row.map((mark, bi) => (
            <span
              key={bi}
              style={{
                display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                width: structure ? 14 : 13,
                height: structure ? 14 : 15,
                border: `1.25px solid ${color}`,
                borderRadius: structure ? '50%' : '50% 50% 50% 50% / 25% 25% 75% 75%',
                background: mark ? color : 'transparent',
                color: mark ? 'var(--surface)' : 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 8, fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {mark || ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function adjusterBtn(dir, enabled) {
  const isUp = dir === 'up';
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    padding: '8px 6px',
    background: enabled
      ? (isUp ? 'var(--olive)' : 'var(--bg-deep)')
      : 'var(--bg-deep)',
    color: enabled
      ? (isUp ? 'var(--surface)' : 'var(--ink)')
      : 'var(--mute)',
    border: enabled
      ? `1.5px solid ${isUp ? 'var(--olive-deep)' : 'var(--rule-strong)'}`
      : '1.5px solid var(--rule)',
    fontFamily: 'var(--font-stencil)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.5,
  };
}

// Armor icon. Custom inline SVG: a chevron-shield with horizontal armor bands.
// Conveys layered plating better than a generic shield.
function ArmorIcon({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 2 L28 6 L28 16 C28 23 22 28 16 30 C10 28 4 23 4 16 L4 6 Z"
        fill="var(--steel)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 11 L25 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 16 L25 16" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 21 L23 21" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Structure icon. A solid hexagon (game terminology + visual reference).
function StructureIcon({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 3 L27 9 L27 23 L16 29 L5 23 L5 9 Z"
        fill="var(--olive)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9 L22 12 L22 20 L16 23 L10 20 L10 12 Z"
        stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}


// Parse Melee (X/X/X/X) out of a traits string.
// Returns [lt, md, hv, uh] or null if not a melee weapon.
function parseMeleeDmg(traits) {
  const m = traits && traits.match(/Melee\s*\(([\/\d-]+)\)/);
  if (!m) return null;
  return m[1].split('/');
}

const WC_IDX = { Light: 0, Medium: 1, Heavy: 2, Ultraheavy: 3 };
const WC_ABBR = ['LT', 'MD', 'HV', 'UH'];

// Big active value + small per-class row.
// For ranged: reads from dmg array. For melee: parses trait string.
function DmgBadge({ weapon, cls }) {
  const idx = WC_IDX[cls];
  const meleeVals = parseMeleeDmg(weapon.traits);
  const vals = meleeVals
    ? meleeVals
    : weapon.dmg;
  const active = vals[idx];
  if (!active || active === '-') return null;

  const label = meleeVals ? '+DICE' : 'DMG';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'var(--surface-2)',
      border: '1px solid var(--rule)',
      borderRadius: 999,
      padding: '2px 8px 2px 6px',
      gap: 0, flexShrink: 0,
      verticalAlign: 'middle',
    }}>
      <span style={{
        fontSize: 9, color: 'var(--mute)', letterSpacing: '0.08em',
        marginRight: 5, fontFamily: 'var(--font-body)', fontWeight: 600,
        textTransform: 'uppercase',
      }}>{label}</span>
      {vals.map((v, i) => (
        <React.Fragment key={i}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: i === idx ? 22 : 13,
            fontWeight: 700,
            lineHeight: 1,
            color: i === idx ? 'var(--ink)' : 'var(--mute)',
            transition: 'font-size 120ms',
          }}>{v}</span>
          {i < 3 && <span style={{ fontSize: 11, color: 'var(--rule-strong)', margin: '0 1px' }}>/</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

// ============================================================
// CATALOG ROWS
// ============================================================

function WeaponRow({ weapon, mech, equipped, onAdd, onRemove, expanded, onToggle }) {
  const cls = mech.weightClass;
  const base = valForClass(weapon.cost, cls);
  const dmg = valForClass(weapon.dmg, cls);
  const available = base !== '-' && base != null;
  const count = equipped?.count || 0;
  const total = available ? totalWeaponCost(weapon, cls, count) : 0;
  const next = available ? copyCost(base, count + 1) : null;

  const unavailableReason = !available
    ? `${weapon.name} is not available on a ${cls} HE-V (per the per-class cost table).`
    : null;

  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: count > 0 ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.55,
      transition: 'background 100ms',
    }}>
      <div
        title={unavailableReason || undefined}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto auto',
          alignItems: 'center', gap: 12,
          padding: '9px 14px',
        }}
      >
        <RowExpand open={expanded} onClick={onToggle} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{weapon.name}</span>
            <DmgBadge weapon={weapon} cls={cls} />
            {available && (
              <>
                <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>{base}t</span>
              </>
            )}
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Not available at {WC[cls].abbr}
              </span>
            )}
            {count > 1 && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--warn)' }}>
                ×{count} = {total}t (next +{next}t)
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
            <TraitList traits={weapon.traits} />
          </div>
        </div>

        {count > 0 ? (
          <>
            <StepButton direction="down" accent="rust" onClick={() => onRemove(weapon.name)} />
            <span className="mono" style={{
              minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 17, color: 'var(--ink)',
            }}>×{count}</span>
            <StepButton direction="up" onClick={() => onAdd(weapon.name)} disabled={!available} />
          </>
        ) : (
          <>
            <span /><span />
            <StepButton direction="up" onClick={() => onAdd(weapon.name)} disabled={!available} />
          </>
        )}
      </div>

      {expanded && available && <ExpandedWeapon weapon={weapon} cls={cls} />}
    </div>
  );
}

function ExpandedWeapon({ weapon, cls }) {
  const traits = collectTraits(weapon.traits);
  return (
    <div style={{
      padding: '10px 14px 16px 14px',
      background: 'var(--bg-deep)',
      borderTop: '1px dashed var(--rule)',
    }}>
      <div className="label" style={{ marginBottom: 6 }}>Per-Class</div>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12.5, width: '100%', maxWidth: 520 }}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            {WC_ORDER.map(c => (
              <th key={c} style={{ ...thStyle, color: c === cls ? 'var(--rust)' : 'var(--mute)' }}>
                {WC[c].abbr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdLabelStyle}>Damage</td>
            {weapon.dmg.map((d, i) => (
              <td key={i} style={{ ...tdStyle, color: WC_ORDER[i] === cls ? 'var(--ink)' : 'var(--ink-2)', fontWeight: WC_ORDER[i] === cls ? 700 : 400 }}>
                {d}
              </td>
            ))}
          </tr>
          <tr>
            <td style={tdLabelStyle}>Cost (base)</td>
            {weapon.cost.map((c, i) => (
              <td key={i} style={{ ...tdStyle, color: WC_ORDER[i] === cls ? 'var(--rust)' : 'var(--ink-2)', fontWeight: WC_ORDER[i] === cls ? 700 : 400 }}>
                {c === '-' ? '-' : `${c}t`}
              </td>
            ))}
          </tr>
          <tr>
            <td style={tdLabelStyle}>2nd / 3rd copy</td>
            {weapon.cost.map((c, i) => {
              const c2 = c === '-' ? '-' : copyCost(c, 2);
              const c3 = c === '-' ? '-' : copyCost(c, 3);
              return (
                <td key={i} style={{ ...tdStyle, color: 'var(--mute)' }}>
                  {c === '-' ? '-' : `${c2}t / ${c3}t`}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <InlineTraitGlossary traits={traits} />
    </div>
  );
}

function UpgradeRow({ upgrade, mech, onToggle, expanded, onExpand }) {
  const cls = mech.weightClass;
  const cost = valForClass(upgrade.cost, cls);
  const available = cost !== '-' && cost != null;
  const eq = mech.upgrades.includes(upgrade.name);
  const unavailableReason = !available
    ? `${upgrade.name} is not available on a ${cls} HE-V.`
    : null;

  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.55,
      transition: 'background 100ms',
    }}>
      <div
        title={unavailableReason || undefined}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center', gap: 12,
          padding: '9px 14px',
        }}
      >
        <RowExpand open={expanded} onClick={onExpand} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{upgrade.name}</span>
            {available && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>{cost}t</span>
            )}
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Not available at {WC[cls].abbr}
              </span>
            )}
            {upgrade.compact && (
              <span className="stencil" style={{
                fontSize: 10, padding: '1px 6px', background: 'var(--steel)', color: 'var(--surface)',
              }}>
                Compact
              </span>
            )}
          </div>
          {!expanded && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {upgrade.rule}
            </div>
          )}
        </div>

        {available && (
          <button
            onClick={() => onToggle(upgrade.name)}
            title={eq ? `Remove ${upgrade.name}.` : `Add ${upgrade.name} (${cost}t).`}
            className="add-btn"
            style={{
              border: `1.5px solid ${eq ? 'var(--rust)' : 'var(--olive)'}`,
              background: eq ? 'transparent' : 'var(--olive)',
              color: eq ? 'var(--rust)' : 'var(--surface)',
              padding: '7px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            {eq ? 'Remove' : 'Add'}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{
          padding: '4px 14px 16px 14px',
          background: 'var(--bg-deep)',
          borderTop: '1px dashed var(--rule)',
        }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
            {upgrade.rule}
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="label" style={{ marginRight: 6 }}>Cost (Lt/Md/Hv/UH):</span>
            <span className="mono" style={{ fontSize: 13 }}>
              {upgrade.cost.map(c => c === '-' ? '-' : `${c}t`).join(' / ')}
            </span>
          </div>
          <InlineTraitGlossary traits={collectTraits(upgrade.rule)} />
        </div>
      )}
    </div>
  );
}

function DefRow({ def, mech, onToggle, atLimit, expanded, onExpand }) {
  const cls = mech.weightClass;
  const cost = valForClass(def.cost, cls);
  const available = cost !== '-' && cost != null;
  const eq = mech.defensive.includes(def.name);
  const limitMax = cls === 'Ultraheavy' ? 2 : 1;
  const blockedByLimit = !eq && atLimit;
  const reason = !available
    ? `${def.name} is not available on a ${cls} HE-V.`
    : blockedByLimit
      ? `Already at ${limitMax} Defensive Configuration${limitMax > 1 ? 's' : ''}. Remove one to swap.`
      : null;

  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.55,
      transition: 'background 100ms',
    }}>
      <div
        title={reason || undefined}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center', gap: 12,
          padding: '9px 14px',
        }}
      >
        <RowExpand open={expanded} onClick={onExpand} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{def.name}</span>
            {available && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>{cost}t</span>
            )}
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Not available at {WC[cls].abbr}
              </span>
            )}
            {def.mod?.armor && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--olive)' }}>
                +{def.mod.armor} armor
              </span>
            )}
          </div>
          {!expanded && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {def.rule}
            </div>
          )}
        </div>
        {available && (
          <button
            onClick={() => onToggle(def.name)}
            disabled={blockedByLimit}
            title={reason || (eq ? `Remove ${def.name}.` : `Add ${def.name} (${cost}t).`)}
            className="add-btn"
            style={{
              border: `1.5px solid ${eq ? 'var(--rust)' : (blockedByLimit ? 'var(--rule)' : 'var(--olive)')}`,
              background: eq ? 'transparent' : (blockedByLimit ? 'var(--bg-deep)' : 'var(--olive)'),
              color: eq ? 'var(--rust)' : (blockedByLimit ? 'var(--mute)' : 'var(--surface)'),
              padding: '7px 14px', cursor: blockedByLimit ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            {eq ? 'Remove' : 'Add'}
          </button>
        )}
      </div>
      {expanded && (
        <div style={{
          padding: '4px 14px 16px 14px',
          background: 'var(--bg-deep)',
          borderTop: '1px dashed var(--rule)',
        }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{def.rule}</div>
          <div style={{ marginTop: 10 }}>
            <span className="label" style={{ marginRight: 6 }}>Cost (Lt/Md/Hv/UH):</span>
            <span className="mono" style={{ fontSize: 13 }}>
              {def.cost.map(c => c === '-' ? '-' : `${c}t`).join(' / ')}
            </span>
          </div>
          <InlineTraitGlossary traits={collectTraits(def.rule)} />
        </div>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: 'center', padding: '5px 10px',
  fontFamily: 'var(--font-stencil)', fontWeight: 700,
  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
  borderBottom: '1px solid var(--rule)',
};
const tdStyle = { textAlign: 'center', padding: '5px 10px' };
const tdLabelStyle = {
  textAlign: 'left', padding: '5px 10px',
  fontFamily: 'var(--font-stencil)', fontSize: 11, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--mute)', fontWeight: 700,
};
