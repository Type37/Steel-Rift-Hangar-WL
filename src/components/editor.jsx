import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { WC, WC_ORDER, RANGED, MELEE, UPGRADES, DEFENSIVE } from '../data';
import { calcMech, valForClass, copyCost, totalWeaponCost, resetMechToClass } from '../calc';
import { SectionTitle, FieldLabel, StepButton, TraitList, TraitToken, RowExpand, InlineTraitGlossary, RulesText, collectTraits, BuyButton } from './ui';

// ============================================================
// HE-V EDITOR
// ============================================================
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

export function MechEditor({ mech, mechIndex, weaponSort = "cost", setWeaponSort, onChange, onDelete, activePerks = [] }) {
  const stats = calcMech(mech, activePerks);
  // Loadout catalog search — filters weapons/gear by name across the active tab.
  const [search, setSearch] = useState('');
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

  // Fly-bauble queue. Each entry has src (button rect), dest (equipped row
  // rect), and a unique id so React can key the animations.
  const addWeapon = (name) => {
    const e = equipped(name);
    if (e) update({ weapons: mech.weapons.map(w => w.name === name ? { ...w, count: w.count + 1 } : w) });
    else update({ weapons: [...mech.weapons, { name, count: 1 }] });

    // Flash the equipped-summary row after React commits the state update.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dest = document.querySelector(`[data-equipped-name="${CSS.escape(name)}"]`);
      if (!dest) return;
      dest.classList.add('fly-target-pulse');
      setTimeout(() => dest.classList.remove('fly-target-pulse'), 620);
    }));
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
    const q = search.trim().toLowerCase();
    return [...items].filter(it => !q || it.name.toLowerCase().includes(q)).sort((a, b) => {
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
                  fontSize: 13,
                  color: active ? 'var(--mute)' : 'rgba(236,236,234,0.5)',
                }}>
                  {c}
                </span>
                <span className="display" style={{ fontSize: 30, lineHeight: 1.05 }}>
                  {w.tons}t
                </span>
                <span className="mono" style={{
                  fontSize: 10.5, letterSpacing: '0.1em',
                  color: active ? 'var(--mute)' : 'rgba(236,236,234,0.45)',
                  textTransform: 'uppercase',
                }}>
                  {w.slots} slots
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Armor / structure adjusters. Each Reinforce step adds 2 points
          and costs 2 tons; each Strip step removes 2 points and refunds
          2 tons. (v1.5 rules p. 18.) Light and Ultraheavy weight classes
          have a special structure rule (Fragile Internals / Backup
          Systems) which sits beside the adjusters when there's room. */}
      <div className={`adjuster-grid ${(cls === 'Light' || cls === 'Ultraheavy') ? 'adjuster-grid--with-rule' : ''}`}>
        <Adjuster
          kind="armor"
          reinforceCost={stats.reinforceCost}
          value={mech.armor}
          base={wc.baseArmor}
          min={wc.baseArmor - 2}
          max={wc.baseArmor + 2}
          onChange={(v) => update({ armor: v })}
        />
        <Adjuster
          kind="structure"
          reinforceCost={stats.reinforceCost}
          value={mech.structure}
          base={wc.baseStructure}
          min={wc.baseStructure - 2}
          max={wc.baseStructure + 2}
          onChange={(v) => update({ structure: v })}
        />
        {cls === 'Light' && (
          <div className="adjuster-rule-card">
            <div className="adjuster-rule-card-title">Fragile Internals</div>
            <div className="adjuster-rule-card-body">
              Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, the Unit suffers one additional point of Damage. This does not trigger further Fragile Internals rolls.
            </div>
          </div>
        )}
        {cls === 'Ultraheavy' && (
          <div className="adjuster-rule-card">
            <div className="adjuster-rule-card-title">Backup Systems Engage</div>
            <div className="adjuster-rule-card-body">
              Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, a point of Damage is ignored and the Structure is not reduced.
            </div>
          </div>
        )}
      </div>


      {/* Currently equipped weapons + upgrades, in detail. Sits between
          the armor block and the catalog so you can see what's mounted
          without scanning the per-tab catalogs below. */}
      <EquippedSummary mech={mech} cls={cls} />

      {/* Catalog tabs + tonnage + slots all on one row */}
      <div style={{ marginTop: 16 }}>
        {/* LOADOUT title row with inline tonnage bar */}
        <LoadoutHeader stats={stats} wc={wc} activePerks={activePerks} />
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
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
                    padding: '10px 14px',
                    fontFamily: 'var(--font-stencil)',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 100ms, color 100ms',
                    flexShrink: 0,
                  }}
                >
                  {t.label}
                  <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '1.6em', display: 'inline-block', textAlign: 'center', opacity: t.count > 0 ? 1 : 0, fontSize: 11 }}>{t.count > 0 ? `(${t.count})` : '(0)'}</span>
                </button>
              );
            });
          })()}

        </div>

        {/* Loadout controls: live catalog search + weapon sort order
            (sort lives here on the loadout screen, not buried in Options). */}
        <div className="loadout-controls">
          <input
            className="loadout-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search weapons & gear…"
            aria-label="Search loadout catalog"
          />
          {search && (
            <button className="loadout-search-clear" onClick={() => setSearch('')} title="Clear search" aria-label="Clear search">×</button>
          )}
          <div className="loadout-sort" role="group" aria-label="Sort order">
            <span className="loadout-sort-label">Sort</span>
            {[{ id: 'cost', label: 'Cost' }, { id: 'alpha', label: 'A–Z' }].map(opt => (
              <button
                key={opt.id}
                onClick={() => setWeaponSort && setWeaponSort(opt.id)}
                className={`loadout-sort-btn${weaponSort === opt.id ? ' is-active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
                    expanded={true} onExpand={() => toggleExpanded(u.name)} />
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
                    expanded={true} onExpand={() => toggleExpanded(u.name)} />
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
                  />
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

function LoadoutHeader({ stats, wc }) {
  if (!stats || !wc) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '2px solid var(--ink)', paddingBottom: 5, marginBottom: 14,
    }}>
      <h2 style={{ fontFamily: 'var(--font-stencil)', fontSize: 19, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
        Loadout
      </h2>
    </div>
  );

  const total      = wc.tons;
  const armorPct   = (stats.armor / total) * 100;
  const structPct  = (stats.structure / total) * 100;
  const weaponPct  = (stats.weaponsTons / total) * 100;
  const upgradePct = ((stats.upgradesTons + stats.defensiveTons) / total) * 100;
  const over       = stats.overTons;
  const near       = !over && (stats.totalUsed / total) >= 0.85;
  const statusColor = over ? 'var(--rust)' : near ? '#b97a1a' : 'var(--ink)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '2px solid var(--ink)', paddingBottom: 5, marginBottom: 14,
    }}>
      <h2 style={{
        fontFamily: 'var(--font-stencil)', fontSize: 19, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, flexShrink: 0,
      }}>
        Loadout
      </h2>

      {/* Segmented bar — fills remaining width */}
      <div style={{
        flex: 1, height: 10, borderRadius: 2,
        background: 'rgba(255,255,255,0.55)',
        overflow: 'hidden', display: 'flex',
        outline: over ? '1.5px solid var(--rust)' : '1px solid var(--rule-strong)',
        outlineOffset: 1,
        minWidth: 60,
      }}>
        <div style={{ width: `${armorPct}%`,   background: 'var(--teal)',  transition: 'width 150ms' }} />
        <div style={{ width: `${structPct}%`,  background: '#8fa66e',      transition: 'width 150ms', borderLeft: '1px solid rgba(255,255,255,0.35)' }} />
        <div style={{ width: `${weaponPct}%`,  background: 'var(--olive)', transition: 'width 150ms', borderLeft: weaponPct > 0 ? '1px solid rgba(255,255,255,0.35)' : 'none' }} />
        <div style={{ width: `${upgradePct}%`, background: '#b97a1a',      transition: 'width 150ms', borderLeft: upgradePct > 0 ? '1px solid rgba(255,255,255,0.35)' : 'none' }} />
      </div>

      {/* Slot pips */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {Array.from({ length: stats.capSlots }).map((_, i) => {
          const filled = i < stats.totalSlotsUsed;
          const over = stats.overSlots && filled;
          return (
            <span
              key={`pip-${i}-${filled ? 'f' : 'e'}`}
              className={`slot-pip${filled ? ' slot-pip-filled' : ''}`}
              style={{
                width: 10, height: 10,
                background: filled
                  ? (over ? 'var(--rust)' : 'var(--teal)')
                  : 'rgba(255,255,255,0.55)',
                border: `2px solid ${filled
                  ? (over ? 'var(--rust)' : 'var(--teal)')
                  : 'var(--rule-strong)'}`,
              }}
            />
          );
        })}
      </div>

      {/* Ton count */}
      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: statusColor, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {over ? `${stats.totalUsed}t OVER` : `${stats.totalUsed} / ${total}t`}
      </span>
    </div>
  );
}

// ============================================================
// ARMOR / STRUCTURE ADJUSTER
// Each step is +/- 2 points and 2 tons, per v1.5 rules.
// Up = "Reinforce", Down = "Strip".
// ============================================================

function Adjuster({ kind, value, base, min, max, onChange, reinforceCost = 2 }) {
  const delta = value - base;
  const isArmor = kind === 'armor';
  const canUp = value < max;
  const canDown = value > min;

  return (
    <div style={{
      border: `2px solid ${isArmor ? 'var(--steel)' : 'var(--olive-deep)'}`,
      background: 'var(--surface)',
      padding: '8px 10px 8px',
      position: 'relative',
    }}>
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
          title={canUp ? `Reinforce: +2 points, costs ${reinforceCost}t` : 'At maximum.'}
          className="add-btn"
          style={{ ...adjusterBtn('up', canUp), flex: 1, flexDirection: 'row', padding: '5px 8px', gap: 6 }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>+2</span>
          <span style={{ fontSize: 11 }}>Reinforce</span>
          <span className="mono" style={{ opacity: reinforceCost < 2 ? 1 : 0.65, fontSize: 10, marginLeft: 'auto', color: reinforceCost < 2 ? 'var(--perk)' : 'inherit', fontWeight: reinforceCost < 2 ? 700 : 400 }}>−{reinforceCost}t</span>
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

  const label = 'DMG';

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
            color: i === idx ? 'var(--ink)' : 'var(--rule-strong)',
            transition: 'font-size 120ms',
          }}>{v}</span>
          {i < 3 && <span style={{ fontSize: 11, color: 'var(--rule-strong)', margin: '0 1px' }}>/</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

// ============================================================
// EQUIPPED SUMMARY
// Shows everything currently mounted on the mech in detail. Sits
// between the armor block and the catalog so you don't have to scan
// each tab to see what's on the chassis. Read-only by design — adds
// and removes still happen through the catalog rows below.
// ============================================================

function EquippedSummary({ mech, cls }) {
  // Resolve weapon attachments to their definitions
  const weapons = mech.weapons.map(w => {
    const def = [...RANGED, ...MELEE].find(d => d.name === w.name);
    return def ? { def, count: w.count } : null;
  }).filter(Boolean);

  const upgradeDefs = (mech.upgrades || [])
    .map(name => UPGRADES.find(u => u.name === name))
    .filter(Boolean);
  const regularUpgrades = upgradeDefs.filter(u => !u.variant);
  const motive = upgradeDefs.find(u => u.variant);

  const defensive = (mech.defensive || [])
    .map(name => DEFENSIVE.find(d => d.name === name))
    .filter(Boolean);

  const isEmpty =
    weapons.length === 0 &&
    regularUpgrades.length === 0 &&
    defensive.length === 0 &&
    !motive;

  if (isEmpty) {
    return (
      <div className="equipped-summary equipped-summary--empty">
        Nothing mounted yet. Pick weapons and gear from the catalogs below.
      </div>
    );
  }

  return (
    <div className="equipped-summary">
      <div className="equipped-summary-head">Equipped</div>

      {weapons.length > 0 && (
        <div className="equipped-block">
          <div className="equipped-block-label">Weapons</div>
          {weapons.map(({ def, count }) => (
            <EquippedWeaponRow key={def.name} def={def} count={count} cls={cls} />
          ))}
        </div>
      )}

      {regularUpgrades.length > 0 && (
        <div className="equipped-block">
          <div className="equipped-block-label">Upgrades</div>
          {regularUpgrades.map(u => (
            <EquippedRuleRow key={u.name} name={u.name} text={u.rule} />
          ))}
        </div>
      )}

      {defensive.length > 0 && (
        <div className="equipped-block">
          <div className="equipped-block-label">Defensive Configuration</div>
          {defensive.map(d => (
            <EquippedRuleRow key={d.name} name={d.name} text={d.rule} />
          ))}
        </div>
      )}

      {motive && (
        <div className="equipped-block">
          <div className="equipped-block-label">Motive System</div>
          <EquippedRuleRow name={motive.name} text={motive.rule} />
        </div>
      )}
    </div>
  );
}

function EquippedWeaponRow({ def, count, cls }) {
  const traits = collectTraits(def.traits || '');
  return (
    <div className="equipped-weapon-row" data-equipped-name={def.name}>
      <div className="equipped-name">
        {def.name}
        {count > 1 && <span className="equipped-count">×{count}</span>}
      </div>
      <DmgBadge weapon={def} cls={cls} />
      <div className="equipped-traits">
        {traits.length > 0 ? <TraitList traits={def.traits} /> : <span style={{ color: 'var(--mute)' }}>—</span>}
      </div>
    </div>
  );
}

function EquippedRuleRow({ name, text }) {
  return (
    <div className="equipped-rule-row">
      <div className="equipped-name">{name}</div>
      <div className="equipped-rule-text">{text}</div>
    </div>
  );
}

// ============================================================
// CATALOG ROWS
// ============================================================

const WEAPON_ICONS = {
  'Rotary Cannon':    'p10_01_Rotary_Cannon.png',
  'Autocannon':       'p10_02_Autocannon.png',
  'Harpoon Gun':      'p10_03_Harpoon_Gun.png',
  'Laser':            'p10_04_Laser.png',
  'Arc Gun':          'p10_05_Arc_Gun.png',
  'Rail Gun':         'p10_06_Rail_Gun.png',
  'Particle Cannon':  'p10_07_Particle_Cannon.png',
  'Submunitions':     'p10_08_Submunitions.png',
  'Mag Tether':       'p10_09_Mag_Tether.png',
  'Shot Cannon':      'p10_10_Shot_Cannon.png',
  'Howitzer':         'p10_11_Howitzer.png',
  'Shock Net':        'p10_12_Shock_Net.png',
  'Pulse Salvo':      'p10_13_Pulse_Salvo.png',
  'AA Missiles':      'p10_14_Lens.png',
  'Cluster Rockets':  'p10_15_Rockets.png',
  'Rocket Pack':      'p10_15_Rockets.png',
  'Missiles':         'p10_16_Missiles.png',
  'Mega Glaive':      'p11_01_Mega_Glaive.png',
  'Demolition Cutter':'p11_03_Demolition_Cutter.png',
  'Combat Blade':     'p11_04_Combat_Blade.png',
  'Mass Tetsubo':     'p11_05_Mass_Tetsubo.png',
  'Plasma Blade':     'p11_06_Plasma_Blade.png',
  'Impact Hammer':    'p11_07_Impact_Hammer.png',
};

function WeaponRow({ weapon, mech, equipped, onAdd, onRemove, expanded, onToggle }) {
  const cls = mech.weightClass;
  const base = valForClass(weapon.cost, cls);
  const dmg = valForClass(weapon.dmg, cls);
  const available = base !== '-' && base != null;
  const count = equipped?.count || 0;
  const iconFile = WEAPON_ICONS[weapon.name];
  const iconSrc = iconFile ? asset(`weapon-icons/${iconFile}`) : null;
  const total = available ? totalWeaponCost(weapon, cls, count) : 0;
  const next = available ? copyCost(base, count + 1) : null;

  const unavailableReason = !available
    ? `${weapon.name} is not available on a ${cls} HE-V (per the per-class cost table).`
    : null;

  // Cost column shared between desktop grid and mobile flex row
  const CostColumns = () => (
    <div className="weapon-row-cost" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
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
              color: isActive && !isNA ? 'var(--surface)' : 'var(--rule-strong)',
            }}>
              {isNA ? '–' : `${v}t`}
            </span>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: count > 0 ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.55,
      transition: 'background 100ms',
    }}>
      <div className="weapon-row-main" title={unavailableReason || undefined}>

        {/* Expand toggle — always first */}
        <RowExpand open={expanded} onClick={onToggle} />

        {/* Name + DMG + traits */}
        <div className="weapon-row-name-block" style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{weapon.name}</span>
              <DmgBadge weapon={weapon} cls={cls} />
              {!available && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  N/A at {cls.slice(0,2).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              <TraitList traits={weapon.traits} />
            </div>
          </div>
          {iconSrc && (
            <img
              src={iconSrc}
              alt=""
              style={{ height: 40, width: 40, objectFit: 'contain', opacity: 0.35, flexShrink: 0, mixBlendMode: 'multiply' }}
            />
          )}
        </div>

        {/* Cost + controls: display:contents on desktop so they slot into the 7-col grid.
            On mobile the CSS switches this to display:flex so they form a single row. */}
        <div className="weapon-row-bottom">
          <CostColumns />
          {count > 0 ? (
            <StepButton direction="down" accent="rust" onClick={() => onRemove(weapon.name)} title="Remove one copy" />
          ) : <span style={{ width: 32 }} />}
          <span className="mono" style={{
            width: 28, textAlign: 'center', fontWeight: 700, fontSize: 17, color: 'var(--ink)',
            visibility: count > 0 ? 'visible' : 'hidden',
          }}>×{count}</span>
          <StepButton
            direction="up"
            onClick={(e) => {
              onAdd(weapon.name);
            }}
            disabled={!available}
            label={available && next != null ? `${next}t` : null}
            floatLabel={available && next != null ? `+${next}t` : undefined}
            title={available ? `Add for ${next}t` : unavailableReason}
          />
        </div>
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
      <InlineTraitGlossary traitStr={weapon.traits} cls={cls} />
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
          gridTemplateColumns: 'auto 1fr 128px auto',
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
            {!available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                N/A at {cls.slice(0,2).toUpperCase()}
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

        {/* Pricing grid — same layout as weapons */}
        <div style={{ width: 128, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {WC_ABBR.map((abbr, i) => (
              <span key={i} style={{
                width: 32, textAlign: 'center', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.06em', color: i === WC_IDX[cls] ? 'var(--ink)' : 'var(--rule-strong)',
                fontFamily: 'var(--font-body)',
              }}>{abbr}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {upgrade.cost.map((v, i) => {
              const isActive = i === WC_IDX[cls];
              const isNA = v === '-' || v == null;
              return (
                <span key={i} style={{
                  width: 32, textAlign: 'center',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 22,
                  background: isActive && !isNA ? (eq ? 'var(--rust)' : 'var(--olive)') : 'transparent',
                  borderRadius: isActive ? 4 : 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: isActive ? 13 : 12, fontWeight: 700,
                  color: isActive && !isNA ? 'var(--surface)' : 'var(--rule-strong)',
                }}>
                  {isNA ? '–' : `${v}t`}
                </span>
              );
            })}
          </div>
        </div>

        {available && (
          <BuyButton
            onClick={() => onToggle(upgrade.name)}
            floatLabel={!eq ? `+${cost}t` : undefined}
            title={eq ? `Remove ${upgrade.name}.` : `Add ${upgrade.name} (${cost}t).`}
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
          </BuyButton>
        )}
      </div>


      {/* Drone assignment: show target picker when this drone is equipped */}
      {eq && upgrade.drone && onAssignDrone && (() => {
        const drones = mech.drones || {};
        const assigned = drones[upgrade.name] || '';
        // Build list of eligible targets
        const isMineDirector = upgrade.name.includes('Mine Director');
        const eligibleWeapons = isMineDirector
          ? mech.upgrades.filter(n => n === 'Mine Drone Carrier System')
          : mech.weapons.map(w => w.name);
        const eligibleUpgrades = isMineDirector
          ? []
          : mech.upgrades.filter(n => n !== upgrade.name && !(['Targeting Support Drone','Tactical Awareness Drone','Mine Director Drone'].includes(n)));
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
              onChange={e => onAssignDrone && onAssignDrone(upgrade.name, e.target.value || null)}
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
          <RulesText text={upgrade.rule} size={13.5} />
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

function DefRow({ def, mech, onToggle, atLimit }) {
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
          gridTemplateColumns: '1fr 128px auto',
          alignItems: 'center', gap: 12,
          padding: '9px 14px',
        }}
      >
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
            {blockedByLimit && (
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--rust)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Slot full — remove one to swap
              </span>
            )}
            {def.mod?.armor && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--olive)' }}>
                +{def.mod.armor} armor
              </span>
            )}
          </div>
          <div style={{ marginTop: 2 }}><RulesText text={def.rule} size={12.5} /></div>
        </div>
        {available && (
          <BuyButton
            onClick={() => onToggle(def.name)}
            disabled={blockedByLimit}
            floatLabel={!eq && !blockedByLimit ? `+${cost}t` : undefined}
            title={reason || (eq ? `Remove ${def.name}.` : `Add ${def.name} (${cost}t).`)}
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
          </BuyButton>
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
