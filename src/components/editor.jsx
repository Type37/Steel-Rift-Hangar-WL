import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { WC, WC_ORDER, RANGED, MELEE, UPGRADES, DEFENSIVE } from '../data';
import { calcMech, valForClass, copyCost, totalWeaponCost, resetMechToClass } from '../calc';
import { SectionTitle, FieldLabel, StepButton, TraitList, TraitToken, RowExpand, InlineTraitGlossary, collectTraits } from './ui';

// ============================================================
// HE-V EDITOR
// ============================================================
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

export function MechEditor({ mech, mechIndex, weaponSort = "cost", onChange, onDelete }) {
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
  const assignDrone = (droneName, targetName) => {
    const next = { ...(mech.drones || {}) };
    if (targetName === null) {
      delete next[droneName];
    } else {
      next[droneName] = targetName;
    }
    update({ drones: next });
  };

  const toggleUpgrade = (name) => {
    if (mech.upgrades.includes(name)) {
      update({ upgrades: mech.upgrades.filter(u => u !== name) });
    } else {
      // Compact upgrades: max 1 per HE-V
      const def = UPGRADES.find(u => u.name === name);
      if (def?.compact) {
        const alreadyHasCompact = mech.upgrades.some(u => {
          const d = UPGRADES.find(x => x.name === u);
          return d?.compact;
        });
        if (alreadyHasCompact) {
          alert('Only one Compact upgrade per HE-V (rules p.25).');
          return;
        }
      }
      update({ upgrades: [...mech.upgrades, name] });
    }
  };
  const toggleDef = (name) => {
    if (mech.defensive.includes(name)) update({ defensive: mech.defensive.filter(d => d !== name) });
    else update({ defensive: [...mech.defensive, name] });
  };

  const sortByAvail = (items, isAvail) => {
    const cls_ = mech.weightClass;
    return [...items].sort((a, b) => {
      const aOk = isAvail(a), bOk = isAvail(b);
      if (aOk !== bOk) return aOk ? -1 : 1;
      if (weaponSort === 'cost') {
        const ac = valForClass(a.cost, cls_), bc = valForClass(b.cost, cls_);
        const an = typeof ac === 'number' ? ac : 999;
        const bn = typeof bc === 'number' ? bc : 999;
        if (an !== bn) return an - bn;
      }
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <div>
      {/* Identity strip: name input + remove button on same line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative' }}>
        <img src={asset('icons/hev.svg')} aria-hidden="true"
          style={{
            position: 'absolute', right: -20, top: '50%',
            transform: `translateY(-50%) scale(${
              cls === 'Light' ? 1.1 : cls === 'Medium' ? 1.3 : cls === 'Heavy' ? 1.5 : 1.7
            })`,
            height: 56, opacity: 0.045,
            pointerEvents: 'none', transformOrigin: 'right center',
          }}
        />
        <input
          value={mech.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={`${mech.weightClass.toUpperCase()} HE-V`}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none',
            borderBottom: '2px solid var(--ink)',
            padding: '4px 0',
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--ink)', outline: 'none',
          }}
        />
        <button
          onClick={() => onDelete(mech.id)}
          className="add-btn"
          title="Remove this HE-V"
          style={{
            border: '1.5px solid var(--rust)', background: 'transparent',
            color: 'var(--rust)', padding: '4px 8px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            flexShrink: 0,
          }}
        >
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      </div>
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

      {/* Light / Ultraheavy structure rules reminder */}
      {(cls === 'Light' || cls === 'Ultraheavy') && (
        <div style={{
          margin: '6px 0 0',
          padding: '7px 12px',
          background: 'var(--surface-2)',
          border: '1px solid var(--rule)',
          fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5,
        }}>
          {cls === 'Light' && (
            <><strong>Fragile Internals:</strong> Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, the Unit suffers one additional point of Damage. This does not trigger further Fragile Internals rolls.</>
          )}
          {cls === 'Ultraheavy' && (
            <><strong>Backup Systems Engage:</strong> Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, a point of Damage is ignored and the Structure is not reduced.</>
          )}
        </div>
      )}


      {/* Tonnage range — dot on line. Intentionally calm; spending everything is not required. */}
      {(() => {
        const pct = Math.min(1, stats.totalUsed / stats.capTons);
        const near = pct >= 0.85 && !stats.overTons;
        const dotColor = stats.overTons ? 'var(--rust)' : near ? '#b97a1a' : 'var(--ink)';
        const slotsFree = stats.capSlots - stats.totalSlotsUsed;
        return (
          <div style={{ margin: '20px 0 0', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--rule)' }}>
            {/* Line + dot */}
            <div style={{ position: 'relative', height: 18, marginBottom: 4 }}>
              <div style={{
                position: 'absolute', top: '50%', left: 0, right: 0,
                height: 1.5, background: 'var(--rule-strong)', transform: 'translateY(-50%)',
              }} />
              <div style={{
                position: 'absolute', top: '50%',
                left: `${Math.min(98, pct * 100)}%`,
                width: 10, height: 10, borderRadius: '50%',
                background: dotColor,
                transform: 'translate(-50%, -50%)',
                transition: 'left 150ms ease, background 150ms',
                flexShrink: 0,
              }} />
            </div>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: 13, color: stats.overTons ? 'var(--rust)' : near ? '#b97a1a' : 'var(--ink-2)' }}>
                {stats.totalUsed}t
                {stats.overTons && <span style={{ marginLeft: 6, fontSize: 11 }}>over by {stats.totalUsed - stats.capTons}t</span>}
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>
                {stats.capTons}t · {slotsFree < 0 ? `${-slotsFree} slots over` : `${slotsFree} slot${slotsFree !== 1 ? 's' : ''} free`}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Catalog tabs */}
      <div style={{ marginTop: 16 }}>
        <SectionTitle>Loadout</SectionTitle>
        <div style={{ display: 'flex', gap: 4 }}>
          {(() => {
            const defCount = mech.defensive.length;
            const motiveEquipped = UPGRADES.filter(u => u.variant && mech.upgrades.includes(u.name)).length;
            const weaponCount = mech.weapons.reduce((s, w) => s + w.count, 0);
            const upgradeCount = mech.upgrades.filter(n => !UPGRADES.find(u => u.name === n)?.variant).length;
            const tabs = [
              { id: 'ranged', label: 'Ranged', count: mech.weapons.filter(w => RANGED.find(r => r.name === w.name)).reduce((s,w) => s+w.count, 0) },
              { id: 'melee', label: 'Melee', count: mech.weapons.filter(w => MELEE.find(m => m.name === w.name)).reduce((s,w) => s+w.count, 0) },
              { id: 'upgrades', label: 'Upgrades', count: upgradeCount },
              { id: 'defensive', label: 'Defensive', count: defCount, noSlots: true },
              { id: 'motive', label: 'Motive', count: motiveEquipped, noSlots: true },
            ];
            return tabs.map(t => {
              const active = tab === t.id;
              const accent = t.noSlots ? 'var(--teal)' : 'var(--rust)';
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="add-btn"
                  style={{
                    background: active ? accent : 'var(--surface)',
                    color: active ? 'var(--surface)' : (t.noSlots ? 'var(--teal)' : 'var(--ink)'),
                    border: `1.5px solid ${active ? accent : (t.noSlots ? 'var(--teal)' : 'var(--rule-strong)')}`,
                    padding: '7px 11px',
                    fontFamily: 'var(--font-stencil)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 100ms, color 100ms',
                    flexShrink: 0,
                  }}
                >
                  {t.label}{t.count > 0 ? ` (${t.count})` : ''}
                </button>
              );
            });
          })()}
        </div>

        <div style={{ borderTop: '2px solid var(--ink)', minHeight: 400 }}>
          {tab === 'ranged' && sortByAvail(RANGED, w => valForClass(w.cost, cls) !== '-' && valForClass(w.cost, cls) != null).map(w => (
            <WeaponRow key={w.name} weapon={w} mech={mech}
              equipped={equipped(w.name)} onAdd={addWeapon} onRemove={removeWeapon}
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)} />
          ))}
          {tab === 'melee' && sortByAvail(MELEE, w => valForClass(w.cost, cls) !== '-' && valForClass(w.cost, cls) != null).map(w => (
            <WeaponRow key={w.name} weapon={w} mech={mech}
              equipped={equipped(w.name)} onAdd={addWeapon} onRemove={removeWeapon}
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)} />
          ))}
          {tab === 'upgrades' && (() => {
            const regular = sortByAvail(
              UPGRADES.filter(u => !u.variant && !u.drone),
              u => { const c = valForClass(u.cost, cls); return c !== '-' && c != null && c !== undefined; }
            );
            const drones = sortByAvail(
              UPGRADES.filter(u => u.drone),
              u => { const c = valForClass(u.cost, cls); return c !== '-' && c != null; }
            );
            return (
              <>
                {regular.map(u => (
                  <UpgradeRow key={u.name} upgrade={u} mech={mech} onToggle={toggleUpgrade} onAssignDrone={assignDrone}
                    expanded={expanded[u.name]} onExpand={() => toggleExpanded(u.name)} />
                ))}
                <div style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--mute)',
                  borderTop: '2px solid var(--rule)', borderBottom: '1px solid var(--rule)',
                  background: 'var(--bg)',
                }}>
                  AI Companion Drones <span style={{ fontWeight: 400 }}>· Compact · assign to a weapon or upgrade</span>
                </div>
                {drones.map(u => (
                  <UpgradeRow key={u.name} upgrade={u} mech={mech} onToggle={toggleUpgrade} onAssignDrone={assignDrone}
                    expanded={expanded[u.name]} onExpand={() => toggleExpanded(u.name)} />
                ))}
              </>
            );
          })()}

          {/* Motive tab: variant motive types */}
          {tab === 'motive' && (() => {
            const variants = UPGRADES.filter(u => u.variant);
            return (
              <>
                <div style={{
                  padding: '10px 14px 8px', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55,
                  borderBottom: '1px solid var(--rule)', background: 'var(--bg)',
                }}>
                  One per HE-V. Cost 0t. Mutually exclusive.
                </div>
                {variants.map(u => (
                  <UpgradeRow key={u.name} upgrade={u} mech={mech} onToggle={toggleUpgrade} onAssignDrone={assignDrone}
                    expanded={expanded[u.name]} onExpand={() => toggleExpanded(u.name)} />
                ))}
              </>
            );
          })()}
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
              {sortByAvail(DEFENSIVE, d => { const c = valForClass(d.cost, cls); return c !== "-" && c != null; }).map(d => (
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
      padding: '8px 10px 8px',
      position: 'relative',
    }}>
      {/* Compact heading row: icon + label + value + strip/reinforce inline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {isArmor ? <ArmorIcon /> : <StructureIcon />}
        <span className="stencil" style={{ fontSize: 12, letterSpacing: '0.12em', color: 'var(--ink)', flex: 1 }}>
          {isArmor ? 'Armor' : 'Structure'}
        </span>
        {delta !== 0 && (
          <span className="mono" style={{ fontSize: 10, color: delta > 0 ? 'var(--olive)' : 'var(--rust)', fontWeight: 700 }}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
        <div className="mono" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: 'right' }}>
          {value}
        </div>
      </div>

      <PipRow value={value} structure={!isArmor} accent={isArmor ? 'steel' : 'olive'} />

      {/* Inline strip / reinforce */}
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 2))}
          disabled={!canDown}
          title={canDown ? `Strip: -2 points, refund 2t` : 'At minimum.'}
          className="add-btn"
          style={{ ...adjusterBtn('down', canDown), flex: 1, flexDirection: 'row', padding: '5px 8px', gap: 6 }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>−2</span>
          <span style={{ fontSize: 11 }}>Strip</span>
          <span className="mono" style={{ opacity: 0.65, fontSize: 10, marginLeft: 'auto' }}>+2t</span>
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 2))}
          disabled={!canUp}
          title={canUp ? `Reinforce: +2 points, costs 2t` : 'At maximum.'}
          className="add-btn"
          style={{ ...adjusterBtn('up', canUp), flex: 1, flexDirection: 'row', padding: '5px 8px', gap: 6 }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>+2</span>
          <span style={{ fontSize: 11 }}>Reinforce</span>
          <span className="mono" style={{ opacity: 0.65, fontSize: 10, marginLeft: 'auto' }}>−2t</span>
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
      padding: '5px 0 2px',
      borderTop: '1px dotted var(--rule)',
      borderBottom: '1px dotted var(--rule)',
      marginBottom: 6,
      display: 'flex', flexWrap: 'wrap', gap: '3px 6px',
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {row.map((mark, bi) => (
            <span
              key={bi}
              style={{
                display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                width: structure ? 12 : 11,
                height: structure ? 12 : 13,
                border: `1px solid ${color}`,
                borderRadius: structure ? '50%' : '50% 50% 50% 50% / 25% 25% 75% 75%',
                background: mark ? color : 'transparent',
                color: mark ? 'var(--surface)' : 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 7, fontWeight: 700,
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
          gridTemplateColumns: 'auto 1fr auto auto auto auto',
          alignItems: 'center', gap: 12,
          padding: '9px 14px',
        }}
      >
        <RowExpand open={expanded} onClick={onToggle} />

        {/* Name + DMG */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{weapon.name}</span>
            <DmgBadge weapon={weapon} cls={cls} />
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                N/A at {cls.slice(0,2).toUpperCase()}
              </span>
            )}
            {count > 1 && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--warn)' }}>
                ×{count} = {total}t
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
            <TraitList traits={weapon.traits} />
          </div>
        </div>

        {/* Cost columns — header row + costs, active class highlighted */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 0 }}>
            {WC_ABBR.map((abbr, i) => {
              const v = weapon.cost[i];
              const isActive = i === WC_IDX[cls];
              const isNA = v === '-' || v == null;
              return (
                <span key={i} style={{
                  width: 32, textAlign: 'center',
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--ink)' : 'var(--mute)',
                  fontFamily: 'var(--font-body)',
                  opacity: isNA ? 0.3 : 1,
                }}>{abbr}</span>
              );
            })}
          </div>
          {/* Cost row */}
          <div style={{ display: 'flex', gap: 0 }}>
            {weapon.cost.map((v, i) => {
              const isActive = i === WC_IDX[cls];
              const isNA = v === '-' || v == null;
              return (
                <span key={i} style={{
                  width: 32, textAlign: 'center',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 22,
                  background: isActive && !isNA ? 'var(--rust)' : 'transparent',
                  borderRadius: isActive ? 4 : 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: isActive ? 13 : 12,
                  fontWeight: 700,
                  color: isActive && !isNA ? 'var(--surface)' : isNA ? 'var(--rule-strong)' : 'var(--mute)',
                }}>
                  {isNA ? '–' : `${v}t`}
                </span>
              );
            })}
          </div>
        </div>

        {count > 0 ? (
          <>
            <StepButton direction="down" accent="rust" onClick={() => onRemove(weapon.name)} />
            <span className="mono" style={{
              minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 17, color: 'var(--ink)',
            }}>×{count}</span>
            <StepButton direction="up" onClick={() => onAdd(weapon.name)} disabled={!available} />
          </>
        ) : (
          <>
            <span />{available && <span />}
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
  const imgSlug = weapon.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const imgSrc = `${BASE}weapons/${imgSlug}.png`;
  return (
    <div style={{
      padding: '10px 14px 16px 14px',
      background: 'var(--bg-deep)',
      borderTop: '1px dashed var(--rule)',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 16,
      alignItems: 'start',
    }}>
    <div>
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
    {/* Weapon art */}
    <img
      src={imgSrc}
      alt=""
      onError={e => { e.target.style.display = 'none'; }}
      style={{
        width: 160, maxHeight: 100,
        objectFit: 'contain',
        opacity: 0.65,
        filter: 'sepia(0.2)',
        alignSelf: 'center',
      }}
    />
    </div>
  );
}

function UpgradeRow({ upgrade, mech, onToggle, expanded, onExpand, onAssignDrone }) {
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
            {upgrade.compact && (
              <TraitToken token="compact" />
            )}
            {available && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>{cost}t</span>
            )}
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Not available at {WC[cls].abbr}
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


      {/* Drone assignment: show target picker when this drone is equipped */}
      {eq && def.drone && onAssignDrone && (() => {
        const drones = mech.drones || {};
        const assigned = drones[def.name] || '';
        // Build list of eligible targets
        const isMineDirector = def.name.includes('Mine Director');
        const eligibleWeapons = isMineDirector
          ? mech.upgrades.filter(n => n === 'Mine Drone Carrier System')
          : mech.weapons.map(w => w.name);
        const eligibleUpgrades = isMineDirector
          ? []
          : mech.upgrades.filter(n => n !== def.name && !(['Targeting Support Drone','Tactical Awareness Drone','Mine Director Drone'].includes(n)));
        const options = [...eligibleWeapons, ...eligibleUpgrades];
        return (
          <div style={{
            padding: '8px 14px 12px',
            background: 'var(--surface-2)',
            borderTop: '1px solid var(--rule)',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Assigned to
            </span>
            <select
              value={assigned}
              onChange={e => onAssignDrone && onAssignDrone(def.name, e.target.value || null)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13, padding: '4px 8px',
                border: assigned ? '1.5px solid var(--teal)' : '1.5px dashed var(--rule-strong)',
                background: 'var(--surface)',
                color: assigned ? 'var(--ink)' : 'var(--mute)',
                cursor: 'pointer',
              }}
            >
              <option value="">— unassigned —</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {assigned && (
              <span style={{ fontSize: 11, color: 'var(--teal)' }}>✓</span>
            )}
            {!assigned && (
              <span style={{ fontSize: 11, color: 'var(--rust)' }}>Unassigned — select a target</span>
            )}
          </div>
        );
      })()}
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

      {/* Drone assignment: show target picker when this drone is equipped */}
      {eq && def.drone && onAssignDrone && (() => {
        const drones = mech.drones || {};
        const assigned = drones[def.name] || '';
        // Build list of eligible targets
        const isMineDirector = def.name.includes('Mine Director');
        const eligibleWeapons = isMineDirector
          ? mech.upgrades.filter(n => n === 'Mine Drone Carrier System')
          : mech.weapons.map(w => w.name);
        const eligibleUpgrades = isMineDirector
          ? []
          : mech.upgrades.filter(n => n !== def.name && !(['Targeting Support Drone','Tactical Awareness Drone','Mine Director Drone'].includes(n)));
        const options = [...eligibleWeapons, ...eligibleUpgrades];
        return (
          <div style={{
            padding: '8px 14px 12px',
            background: 'var(--surface-2)',
            borderTop: '1px solid var(--rule)',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Assigned to
            </span>
            <select
              value={assigned}
              onChange={e => onAssignDrone && onAssignDrone(def.name, e.target.value || null)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13, padding: '4px 8px',
                border: assigned ? '1.5px solid var(--teal)' : '1.5px dashed var(--rule-strong)',
                background: 'var(--surface)',
                color: assigned ? 'var(--ink)' : 'var(--mute)',
                cursor: 'pointer',
              }}
            >
              <option value="">— unassigned —</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {assigned && (
              <span style={{ fontSize: 11, color: 'var(--teal)' }}>✓</span>
            )}
            {!assigned && (
              <span style={{ fontSize: 11, color: 'var(--rust)' }}>Unassigned — select a target</span>
            )}
          </div>
        );
      })()}
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
