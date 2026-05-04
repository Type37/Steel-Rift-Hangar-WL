import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight, Shield, Activity } from 'lucide-react';
import { WC, WC_ORDER, RANGED, MELEE, UPGRADES, DEFENSIVE } from '../data';
import { calcMech, valForClass, isAvailable, copyCost, totalWeaponCost, resetMechToClass } from '../calc';
import { SectionTitle, FieldLabel, GhostButton, StepButton, TextButton, TraitList, Chip } from './ui';

// ============================================================
// HE-V EDITOR
// ============================================================

export function MechEditor({ mech, mechIndex, onChange, onDelete, activeToken, onToken }) {
  const stats = calcMech(mech);
  const cls = mech.weightClass;
  const wc = WC[cls];
  const defLimit = cls === 'Ultraheavy' ? 2 : 1;

  const [tab, setTab] = useState('ranged');
  const [expanded, setExpanded] = useState({}); // row name → bool
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
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="stencil" style={{ fontSize: 13 }}>
            HE-V {String(mechIndex + 1).padStart(2, '0')}
          </span>
          <span className="display" style={{
            fontSize: 11, padding: '3px 7px', border: '1.5px solid var(--ink)',
            letterSpacing: '0.18em',
          }}>
            {wc.abbr}
          </span>
        </div>
        <button
          onClick={() => onDelete(mech.id)}
          style={{
            border: '1px solid var(--rust)', background: 'transparent',
            color: 'var(--rust)', padding: '4px 10px', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          <Trash2 size={11} strokeWidth={2.5} /> Remove
        </button>
      </div>

      {/* Name + description */}
      <input
        value={mech.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Unnamed HE-V"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '2px solid var(--ink)',
          padding: '4px 0',
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          outline: 'none',
        }}
      />
      {mech.description && (
        <div style={{
          marginTop: 6, fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic',
          fontFamily: 'var(--font-body)', lineHeight: 1.5,
        }}>
          {mech.description}
        </div>
      )}

      {/* Class picker — runs wider, with a clear data row showing tons / armor / structure / slots */}
      <div style={{ marginTop: 22, marginBottom: 18 }}>
        <FieldLabel>Weight Class</FieldLabel>
        <div style={{
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
                style={{
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--surface)',
                  border: 'none',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span className="display" style={{
                  fontSize: 11, letterSpacing: '0.16em',
                  color: active ? 'var(--mute)' : 'rgba(241,234,218,0.5)',
                }}>
                  {c}
                </span>
                <span className="display" style={{ fontSize: 28, lineHeight: 1.1 }}>
                  {w.tons}t
                </span>
                <span className="mono" style={{
                  fontSize: 9.5, letterSpacing: '0.12em',
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

      {/* Tonnage breakdown — varied layout, not a card grid */}
      <TonBreakdown stats={stats} cls={cls} wc={wc} />

      {/* Armor / structure adjusters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
        <Adjuster
          label="Armor"
          value={mech.armor}
          base={wc.baseArmor}
          min={Math.max(0, wc.baseArmor - 4)}
          max={wc.baseArmor + 6}
          onChange={(v) => update({ armor: v })}
          icon={Shield}
        />
        <Adjuster
          label="Structure"
          value={mech.structure}
          base={wc.baseStructure}
          min={Math.max(0, wc.baseStructure - 4)}
          max={wc.baseStructure + 6}
          onChange={(v) => update({ structure: v })}
          icon={Activity}
        />
      </div>

      {/* Catalog tabs */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle tag={`${stats.totalSlotsUsed}/${stats.capSlots} slots used`}>
          Loadout Catalog
        </SectionTitle>
        <div style={{ display: 'flex', gap: 4, marginBottom: 0 }}>
          {[
            { id: 'ranged', label: 'Ranged' },
            { id: 'melee', label: 'Melee' },
            { id: 'upgrades', label: 'Upgrades' },
            { id: 'defensive', label: 'Defensive' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? 'var(--ink)' : 'transparent',
                color: tab === t.id ? 'var(--surface)' : 'var(--ink)',
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.16em',
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
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)}
              activeToken={activeToken} onToken={onToken} />
          ))}
          {tab === 'melee' && MELEE.map(w => (
            <WeaponRow key={w.name} weapon={w} mech={mech}
              equipped={equipped(w.name)} onAdd={addWeapon} onRemove={removeWeapon}
              expanded={expanded[w.name]} onToggle={() => toggleExpanded(w.name)}
              activeToken={activeToken} onToken={onToken} />
          ))}
          {tab === 'upgrades' && UPGRADES.map(u => (
            <UpgradeRow key={u.name} upgrade={u} mech={mech} onToggle={toggleUpgrade}
              expanded={expanded[u.name]} onExpand={() => toggleExpanded(u.name)}
              activeToken={activeToken} onToken={onToken} />
          ))}
          {tab === 'defensive' && (
            <>
              <div style={{
                padding: '10px 14px', fontSize: 12, color: 'var(--ink-2)',
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
// TONNAGE BREAKDOWN — data table style, not a card grid
// ============================================================

function TonBreakdown({ stats, cls, wc }) {
  const pct = Math.min(100, (stats.totalUsed / wc.tons) * 100);
  const remaining = wc.tons - stats.totalUsed;
  return (
    <div style={{ marginTop: 22 }}>
      {/* Top rule + label row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span className="label">{cls} Tonnage</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: stats.overTons ? 'var(--rust)' : 'var(--ink)' }}>
          {stats.totalUsed} / {wc.tons}t
          <span style={{ color: 'var(--mute)', marginLeft: 8, fontWeight: 400 }}>
            ({remaining >= 0 ? `${remaining} free` : `${-remaining} over`})
          </span>
        </span>
      </div>
      {/* Bar */}
      <div style={{
        height: 14, background: 'var(--surface-2)',
        border: '1.5px solid var(--rule-strong)', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${pct}%`,
          background: stats.overTons ? 'var(--rust)' : 'var(--olive)',
          transition: 'width 180ms ease-out',
        }} />
        {/* Mile markers at 25/50/75% */}
        {[0.25, 0.5, 0.75].map(p => (
          <div key={p} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${p * 100}%`,
            width: 1, background: 'rgba(0,0,0,0.18)',
          }} />
        ))}
      </div>
      {/* Stat data row, like a tech datasheet */}
      <div style={{
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
            padding: '8px 10px',
            borderRight: i < 4 ? '1px solid var(--rule)' : 'none',
          }}>
            <div className="label" style={{ fontSize: 9.5, marginBottom: 2 }}>{r.l}</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
              {r.v}
            </div>
            {r.sub && <div className="mono" style={{ fontSize: 10, color: 'var(--olive)' }}>{r.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ARMOR / STRUCTURE ADJUSTER
// ============================================================

function Adjuster({ label, value, base, min, max, onChange, icon: Icon, step = 2 }) {
  const delta = value - base;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px',
      border: '1px solid var(--rule)',
      background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && <Icon size={18} color="var(--steel)" strokeWidth={2} />}
        <div>
          <div className="display" style={{ fontSize: 12, letterSpacing: '0.16em' }}>{label}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--mute)' }}>
            base {base}
            {delta !== 0 && (
              <span style={{ color: delta > 0 ? 'var(--olive)' : 'var(--rust)', fontWeight: 700, marginLeft: 4 }}>
                ({delta > 0 ? '+' : ''}{delta})
              </span>
            )}
            <span style={{ marginLeft: 6 }}>{value}t</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}
          style={stepBtnStyle(value <= min)}>−</button>
        <div style={{
          minWidth: 38, height: 32, border: '2px solid var(--ink)', background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
        }}>
          {value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max}
          style={stepBtnStyle(value >= max)}>+</button>
      </div>
    </div>
  );
}

const stepBtnStyle = (disabled) => ({
  width: 30, height: 30,
  border: '1.5px solid var(--rule-strong)',
  background: disabled ? 'var(--bg-deep)' : 'var(--surface-2)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink)',
  opacity: disabled ? 0.4 : 1,
  padding: 0,
});

// ============================================================
// CATALOG ROWS — table-style, expandable, with full per-class info on expand
// ============================================================

function WeaponRow({ weapon, mech, equipped, onAdd, onRemove, expanded, onToggle, activeToken, onToken }) {
  const cls = mech.weightClass;
  const base = valForClass(weapon.cost, cls);
  const dmg = valForClass(weapon.dmg, cls);
  const available = base !== '-' && base != null;
  const count = equipped?.count || 0;
  const total = available ? totalWeaponCost(weapon, cls, count) : 0;
  const next = available ? copyCost(base, count + 1) : null;

  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: count > 0 ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.42,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        alignItems: 'center', gap: 12,
        padding: '8px 14px',
      }}>
        <button onClick={onToggle} aria-label="Expand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mute)' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{weapon.name}</span>
            {available && (
              <>
                <span className="mono" style={{ fontSize: 11, color: 'var(--steel)' }}>DMG {dmg}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--rust)', fontWeight: 700 }}>{base}t</span>
              </>
            )}
            {count > 1 && (
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--warn)' }}>
                ×{count} = {total}t (next +{next}t)
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2 }}>
            <TraitList traits={weapon.traits} activeToken={activeToken} onToken={onToken} />
          </div>
        </div>

        {/* Equipped count display + steppers */}
        {count > 0 ? (
          <>
            <StepButton direction="down" accent="rust" onClick={() => onRemove(weapon.name)} />
            <span className="mono" style={{
              minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--ink)',
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

      {expanded && available && (
        <ExpandedWeapon weapon={weapon} cls={cls} activeToken={activeToken} onToken={onToken} />
      )}
    </div>
  );
}

function ExpandedWeapon({ weapon, cls, activeToken, onToken }) {
  return (
    <div style={{
      padding: '10px 14px 14px 36px',
      background: 'var(--bg-deep)',
      borderTop: '1px dashed var(--rule)',
    }}>
      <div className="label" style={{ marginBottom: 6 }}>Per-Class</div>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11.5, width: '100%', maxWidth: 500 }}>
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
                {c === '-' ? '—' : `${c}t`}
              </td>
            ))}
          </tr>
          <tr>
            <td style={tdLabelStyle}>2nd / 3rd copy</td>
            {weapon.cost.map((c, i) => {
              const c2 = c === '-' ? '—' : copyCost(c, 2);
              const c3 = c === '-' ? '—' : copyCost(c, 3);
              return (
                <td key={i} style={{ ...tdStyle, color: 'var(--mute)' }}>
                  {c === '-' ? '—' : `${c2}t / ${c3}t`}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-2)' }}>
        <span className="label" style={{ marginRight: 6 }}>Traits:</span>
        <TraitList traits={weapon.traits} activeToken={activeToken} onToken={onToken} />
      </div>
    </div>
  );
}

function UpgradeRow({ upgrade, mech, onToggle, expanded, onExpand, activeToken, onToken }) {
  const cls = mech.weightClass;
  const cost = valForClass(upgrade.cost, cls);
  const available = cost !== '-' && cost != null;
  const eq = mech.upgrades.includes(upgrade.name);
  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.42,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center', gap: 12,
        padding: '8px 14px',
      }}>
        <button onClick={onExpand} aria-label="Expand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mute)' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{upgrade.name}</span>
            {available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--rust)', fontWeight: 700 }}>{cost}t</span>
            )}
            {upgrade.compact && (
              <span className="mono" style={{
                fontSize: 9.5, padding: '1px 5px', background: 'var(--steel)', color: 'var(--surface)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Compact
              </span>
            )}
          </div>
          {!expanded && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {upgrade.rule}
            </div>
          )}
        </div>

        {available && (
          <button
            onClick={() => onToggle(upgrade.name)}
            style={{
              border: `1.5px solid ${eq ? 'var(--rust)' : 'var(--olive)'}`,
              background: eq ? 'transparent' : 'var(--olive)',
              color: eq ? 'var(--rust)' : 'var(--surface)',
              padding: '5px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}
          >
            {eq ? 'Remove' : 'Add'}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{
          padding: '4px 14px 14px 36px',
          background: 'var(--bg-deep)',
          borderTop: '1px dashed var(--rule)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
            {upgrade.rule}
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="label" style={{ marginRight: 6 }}>Cost (Lt/Md/Hv/UH):</span>
            <span className="mono" style={{ fontSize: 12 }}>
              {upgrade.cost.map(c => c === '-' ? '—' : `${c}t`).join(' / ')}
            </span>
          </div>
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
  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: available ? 1 : 0.42,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center', gap: 12,
        padding: '8px 14px',
      }}>
        <button onClick={onExpand} aria-label="Expand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mute)' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{def.name}</span>
            {available && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--rust)', fontWeight: 700 }}>{cost}t</span>
            )}
            {def.mod?.armor && (
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--olive)' }}>
                +{def.mod.armor} armor
              </span>
            )}
          </div>
          {!expanded && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {def.rule}
            </div>
          )}
        </div>
        {available && (
          <button
            onClick={() => onToggle(def.name)}
            disabled={!eq && atLimit}
            style={{
              border: `1.5px solid ${eq ? 'var(--rust)' : (atLimit ? 'var(--rule)' : 'var(--olive)')}`,
              background: eq ? 'transparent' : (atLimit ? 'var(--bg-deep)' : 'var(--olive)'),
              color: eq ? 'var(--rust)' : (atLimit ? 'var(--mute)' : 'var(--surface)'),
              padding: '5px 12px', cursor: !eq && atLimit ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}
          >
            {eq ? 'Remove' : 'Add'}
          </button>
        )}
      </div>
      {expanded && (
        <div style={{
          padding: '4px 14px 14px 36px',
          background: 'var(--bg-deep)',
          borderTop: '1px dashed var(--rule)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>{def.rule}</div>
          <div style={{ marginTop: 10 }}>
            <span className="label" style={{ marginRight: 6 }}>Cost (Lt/Md/Hv/UH):</span>
            <span className="mono" style={{ fontSize: 12 }}>
              {def.cost.map(c => c === '-' ? '—' : `${c}t`).join(' / ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: 'center', padding: '4px 8px',
  fontFamily: 'var(--font-display)', fontWeight: 600,
  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
  borderBottom: '1px solid var(--rule)',
};
const tdStyle = { textAlign: 'center', padding: '4px 8px' };
const tdLabelStyle = {
  textAlign: 'left', padding: '4px 8px',
  fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--mute)', fontWeight: 600,
};
