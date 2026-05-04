import React from 'react';
import { Printer, Settings as SettingsIcon, Plus, ChevronRight } from 'lucide-react';
import { WC, MISSION_ORDER, MISSIONS } from '../data';
import { calcMech } from '../calc';

// ============================================================
// TOP BAR
// ============================================================

export function TopBar({ forceName, onForceName, onPrint, onOptions }) {
  return (
    <div style={{
      borderBottom: '2px solid var(--ink)',
      background: 'var(--bg)',
      padding: '12px 22px',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 22,
    }} className="no-print">
      {/* Wordmark — deliberately not centered, left-aligned with a stencil sub */}
      <div>
        <div className="display" style={{ fontSize: 19, letterSpacing: '0.2em', lineHeight: 1 }}>
          STEEL RIFT <span style={{ color: 'var(--rust)' }}>//</span> FORGE
        </div>
        <div className="mono" style={{
          fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.22em',
          marginTop: 3, textTransform: 'uppercase',
        }}>
          unofficial listbuilder · v1.5 ruleset
        </div>
      </div>

      {/* Force name — single-line, prominent */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
        <span className="label" style={{ flexShrink: 0 }}>Force</span>
        <input
          value={forceName}
          onChange={(e) => onForceName(e.target.value)}
          placeholder="Name your force…"
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none',
            borderBottom: '1.5px solid var(--rule-strong)',
            padding: '4px 0',
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 600, letterSpacing: '0.06em',
            color: 'var(--ink)', outline: 'none',
          }}
        />
      </div>

      {/* Actions — Options is text-only, Print is the only emphasized button up here */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onOptions} style={{
          background: 'transparent', border: 'none', padding: '6px 4px',
          color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-body)', textDecoration: 'underline',
        }}>
          <SettingsIcon size={13} strokeWidth={2} />
          Options
        </button>
        <button onClick={onPrint} style={{
          background: 'var(--ink)', color: 'var(--surface)', border: 'none',
          padding: '8px 14px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <Printer size={13} strokeWidth={2.25} />
          Print Roster
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM BAR — persistent mission/tonnage tracker, with the two big actions
// ============================================================

export function BottomBar({
  mission, customTons, onMission, onCustomTons,
  totalTons, supportCount, mechCount,
  onAddMech, onAddSupport,
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const pct = cap ? Math.min(100, (totalTons / cap) * 100) : 0;
  const over = totalTons > cap;

  return (
    <div className="no-print" style={{
      borderTop: '2px solid var(--ink)',
      background: 'var(--surface)',
      padding: '12px 22px',
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: 22,
    }}>
      {/* Mission picker + tonnage bar */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className="label" style={{ marginRight: 4 }}>Mission</span>
          {MISSION_ORDER.map(m => {
            const active = mission === m;
            return (
              <button key={m} onClick={() => onMission(m)} style={{
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--surface)' : 'var(--ink)',
                border: `1.5px solid ${active ? 'var(--ink)' : 'var(--rule-strong)'}`,
                padding: '5px 10px', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 11,
                fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                {m}
                <span className="mono" style={{
                  marginLeft: 6, fontSize: 10,
                  opacity: active ? 0.75 : 0.55, fontWeight: 400,
                }}>
                  {MISSIONS[m].tons}t
                </span>
              </button>
            );
          })}
          {/* Custom tonnage option */}
          <button onClick={() => onMission('Custom')} style={{
            background: useCustom ? 'var(--rust)' : 'transparent',
            color: useCustom ? 'var(--surface)' : 'var(--rust)',
            border: `1.5px solid var(--rust)`,
            padding: '5px 10px', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 11,
            fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            Custom
          </button>
          {useCustom && (
            <input
              type="number"
              value={customTons}
              onChange={(e) => onCustomTons(Math.max(20, Number(e.target.value) || 0))}
              style={{
                width: 78, padding: '4px 8px',
                border: '1.5px solid var(--rust)', background: 'var(--surface)',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: 'var(--ink)',
              }}
            />
          )}
        </div>

        {/* Bar + numeric breakdown */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            flex: 1, height: 18, background: 'var(--bg-deep)',
            border: '1.5px solid var(--rule-strong)', position: 'relative',
            minWidth: 200,
          }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${pct}%`,
              background: over ? 'var(--rust)' : 'var(--olive)',
              transition: 'width 180ms ease-out',
            }} />
            <div className="mono" style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: pct > 50 ? 'var(--surface)' : 'var(--ink)',
              mixBlendMode: 'normal',
              letterSpacing: '0.06em',
            }}>
              {totalTons} / {cap}t
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
            <Stat label="HE-Vs" value={mechCount} />
            <Stat label="Support" value={supportCount} />
            {!useCustom && <Stat label="Board" value={MISSIONS[mission].board} />}
            {!useCustom && <Stat label="Agendas" value={MISSIONS[mission].agendas} />}
          </div>
        </div>
      </div>

      {/* The two contrasting CTAs */}
      <button onClick={onAddSupport} style={{
        background: 'transparent',
        color: 'var(--ink)',
        border: '2px solid var(--ink)',
        padding: '14px 20px', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Plus size={15} strokeWidth={2.5} />
        Add Support
      </button>

      <button onClick={onAddMech} style={{
        background: 'var(--rust)',
        color: 'var(--surface)',
        border: '2px solid var(--rust)',
        padding: '14px 22px', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 0 0 1px var(--rust-deep) inset',
      }}>
        <Plus size={15} strokeWidth={2.5} />
        Add HE-V
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 50 }}>
      <div className="label" style={{ fontSize: 9, marginBottom: 1 }}>{label}</div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

// ============================================================
// MECH CARD — roster list item. Numbered, weight-class badge, name, tonnage
// ============================================================

export function MechCard({ mech, index, active, onSelect, onTabSwitch }) {
  const stats = calcMech(mech);
  const wc = WC[mech.weightClass];
  return (
    <button
      onClick={() => { onSelect(mech.id); onTabSwitch && onTabSwitch('roster'); }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink)',
        border: 'none',
        borderTop: '1px solid var(--rule)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <span className="stencil" style={{
        fontSize: 12, color: active ? 'rgba(241,234,218,0.7)' : 'var(--mute)',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 15, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {mech.name || <span style={{ opacity: 0.55, fontStyle: 'italic' }}>Unnamed</span>}
        </div>
        <div className="mono" style={{
          fontSize: 10.5,
          color: active ? 'rgba(241,234,218,0.65)' : 'var(--mute)',
          letterSpacing: '0.06em', marginTop: 2,
        }}>
          {wc.abbr} · {stats.weaponsSlots + stats.upgradesSlots}/{wc.slots} slots
          {stats.overTons && (
            <span style={{
              marginLeft: 6, color: active ? '#ffb89c' : 'var(--rust)', fontWeight: 700,
            }}>
              over!
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{
          fontSize: 17, fontWeight: 700,
          color: stats.overTons ? (active ? '#ffb89c' : 'var(--rust)') : (active ? 'var(--surface)' : 'var(--ink)'),
        }}>
          {stats.totalUsed}t
        </div>
        <div className="mono" style={{
          fontSize: 9.5, color: active ? 'rgba(241,234,218,0.55)' : 'var(--mute)',
        }}>
          / {wc.tons}t
        </div>
      </div>
    </button>
  );
}

// Empty-roster prompt
export function EmptyRoster({ onAdd }) {
  return (
    <div style={{
      padding: '38px 16px 28px', textAlign: 'center',
      borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)',
      marginTop: 0,
    }}>
      <div className="display" style={{ fontSize: 13, letterSpacing: '0.2em', color: 'var(--mute)' }}>
        Empty Roster
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6, marginBottom: 16 }}>
        Add your first HE-V to begin loading out a force.
      </div>
      <button onClick={onAdd} style={{
        background: 'var(--rust)', color: 'var(--surface)', border: 'none',
        padding: '12px 18px', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 7,
      }}>
        <Plus size={14} strokeWidth={2.5} />
        Add HE-V
      </button>
    </div>
  );
}
