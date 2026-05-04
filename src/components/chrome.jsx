import React from 'react';
import { Printer, Settings as SettingsIcon, Plus } from 'lucide-react';
import { WC, MISSION_ORDER, MISSIONS } from '../data';
import { calcMech } from '../calc';

// Resolve absolute path with the configured base; works at root or under /Steel-Rift-Hangar-WL/
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

// ============================================================
// NAVBAR: top strip with Steel Rift logo + outbound links
// ============================================================
export function Navbar() {
  return (
    <div className="navbar-strip no-print">
      <div className="navbar-inner">
        <a href="https://www.steelrift.com" className="navbar-logo" target="_blank" rel="noopener">
          <img src={asset('steel-rift-logo.svg')} alt="Steel Rift" />
        </a>
        <div className="navbar-links">
          <a href="https://www.steelrift.com/play" target="_blank" rel="noopener">Get Started</a>
          <a href="https://www.steelrift.com/rules" target="_blank" rel="noopener">Rules</a>
          <a href="https://www.steelrift.com/downloads" target="_blank" rel="noopener">Downloads</a>
          <a href="https://www.steelrift.com/faq" target="_blank" rel="noopener">FAQ</a>
        </div>
        <a href="https://deathraydesigns.com/product-category/minis/steel-rift/"
           target="_blank" rel="noopener" className="navbar-buynow">
          Buy Now
        </a>
      </div>
    </div>
  );
}

// ============================================================
// FORCE BAR. Was "TopBar". Force name + summary counters + actions
// ============================================================
export function TopBar({
  forceName, onForceName, onPrint, onOptions,
  totalTons, capTons, mechCount, supportCount, supportLimit, teamCount, teamMax,
}) {
  return (
    <div className="topbar no-print" style={{
      borderBottom: '2px solid var(--ink)',
      background: 'var(--bg)',
      padding: '12px 22px',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 22,
    }}>
      {/* App identity */}
      <div className="topbar-wordmark">
        <div className="display" style={{ fontSize: 20, letterSpacing: '0.2em', lineHeight: 1 }}>
          THE FORGE
        </div>
        <div className="topbar-tagline mono" style={{
          fontSize: 10, color: 'var(--mute)', letterSpacing: '0.2em',
          marginTop: 3, textTransform: 'uppercase',
        }}>
          v1.5 listbuilder
        </div>
      </div>

      {/* Center: force name + status counters */}
      <div className="topbar-force" style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        minWidth: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="label" style={{ flexShrink: 0 }}>Force</span>
          <input
            value={forceName}
            onChange={(e) => onForceName(e.target.value)}
            placeholder="Name your force"
            style={{
              flex: 1, minWidth: 0,
              background: 'transparent', border: 'none',
              borderBottom: '1.5px solid var(--rule-strong)',
              padding: '4px 0',
              fontFamily: 'var(--font-stencil)',
              fontSize: 19, fontWeight: 700, letterSpacing: '0.04em',
              color: 'var(--ink)', outline: 'none',
            }}
          />
        </div>

        {/* Inline status. Visible on desktop, hidden on phones (lives in bottom bar) */}
        <div className="topbar-counters" style={{
          display: 'flex', gap: 14, alignItems: 'baseline',
          fontSize: 12, color: 'var(--ink-2)',
          flexWrap: 'wrap',
        }}>
          <Counter label="Tonnage" used={totalTons} max={capTons} />
          <Counter label="HE-Vs" used={mechCount} />
          <Counter label="Support" used={supportCount} max={supportLimit} />
          <Counter label="Teams" used={teamCount} max={teamMax} />
        </div>
      </div>

      {/* Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onOptions} className="add-btn" style={{
          background: 'transparent', border: '1.5px solid var(--rule-strong)',
          padding: '8px 12px', cursor: 'pointer',
          color: 'var(--ink)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-stencil)', fontSize: 12.5, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <SettingsIcon size={14} strokeWidth={2.25} />
          Options
        </button>
        <button onClick={onPrint} className="topbar-print add-btn" style={{
          background: 'var(--ink)', color: 'var(--surface)', border: 'none',
          padding: '9px 14px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--font-stencil)', fontSize: 12.5, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          <Printer size={14} strokeWidth={2.25} />
          <span className="topbar-print-label">Print</span>
        </button>
      </div>
    </div>
  );
}

function Counter({ label, used, max }) {
  const over = max != null && used > max;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}>
      <span className="label" style={{ fontSize: 10, color: 'var(--mute)' }}>{label}</span>
      <span className="mono" style={{
        fontSize: 13, fontWeight: 700,
        color: over ? 'var(--rust)' : 'var(--ink)',
      }}>
        {used}{max != null && `/${max}`}
      </span>
    </span>
  );
}

// ============================================================
// BOTTOM BAR: mission selection + the two big CTAs
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

  // Small "More" toggle reveals All-Out War + Custom. Auto-opens if user
  // is currently sitting on one of those.
  const isExtra = mission === 'All-Out War' || mission === 'Custom';
  const [showMore, setShowMore] = React.useState(isExtra);
  React.useEffect(() => {
    if (isExtra) setShowMore(true);
  }, [isExtra]);

  const standardMissions = MISSION_ORDER.filter(m => m !== 'All-Out War');
  const extraMissions = ['All-Out War'];

  return (
    <div className="bottombar no-print" style={{
      borderTop: '2px solid var(--ink)',
      background: 'var(--surface)',
      padding: '12px 22px',
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: 22,
    }}>
      <div className="bottombar-tonnage" style={{ minWidth: 0 }}>
        <div className="bottombar-mission-row" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className="label" style={{ marginRight: 4 }}>Mission</span>
          {standardMissions.map(m => {
            const active = mission === m;
            return (
              <MissionChip key={m} m={m} active={active} onClick={() => onMission(m)} />
            );
          })}

          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="chip-hover"
              style={{
                background: 'transparent',
                color: 'var(--ink-2)',
                border: '1.5px dashed var(--rule-strong)',
                padding: '6px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-stencil)', fontSize: 12.5,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}
              title="Show All-Out War and Custom tonnage"
            >
              + More
            </button>
          )}

          {showMore && (
            <>
              {extraMissions.map(m => (
                <MissionChip key={m} m={m} active={mission === m} onClick={() => onMission(m)} />
              ))}
              <button onClick={() => onMission('Custom')} className={`chip-hover ${useCustom ? 'is-active' : ''}`} style={{
                background: useCustom ? 'var(--rust)' : 'transparent',
                color: useCustom ? 'var(--surface)' : 'var(--rust)',
                border: '1.5px solid var(--rust)',
                padding: '6px 10px', cursor: 'pointer',
                fontFamily: 'var(--font-stencil)', fontSize: 12.5,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Custom
              </button>
              {useCustom && (
                <input
                  type="number"
                  value={customTons}
                  onChange={(e) => onCustomTons(Math.max(20, Number(e.target.value) || 0))}
                  style={{
                    width: 82, padding: '4px 8px',
                    border: '1.5px solid var(--rust)', background: 'var(--surface)',
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                />
              )}
              {!isExtra && (
                <button
                  onClick={() => setShowMore(false)}
                  style={{
                    background: 'transparent', border: 'none',
                    padding: '6px 6px', cursor: 'pointer',
                    color: 'var(--mute)', fontSize: 11.5,
                    textDecoration: 'underline',
                    fontFamily: 'var(--font-body)',
                  }}
                  title="Hide larger mission sizes"
                >
                  less
                </button>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1, height: 20, background: 'var(--bg-deep)',
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
              fontSize: 12, fontWeight: 700,
              color: pct > 50 ? 'var(--surface)' : 'var(--ink)',
              letterSpacing: '0.06em',
            }}>
              {totalTons} / {cap}t
            </div>
          </div>
        </div>
      </div>

      <button onClick={onAddSupport} className="bottombar-add-support add-btn" style={{
        background: 'transparent',
        color: 'var(--ink)',
        border: '2px solid var(--ink)',
        padding: '14px 20px', cursor: 'pointer',
        fontFamily: 'var(--font-stencil)', fontSize: 14, fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Plus size={16} strokeWidth={2.5} />
        Add Support
      </button>

      <button onClick={onAddMech} className={`bottombar-add-mech add-btn cta-mech ${mechCount === 0 ? 'cta-pulse' : ''}`} style={{
        background: 'var(--rust)',
        color: 'var(--surface)',
        border: '2px solid var(--rust)',
        padding: '14px 22px', cursor: 'pointer',
        fontFamily: 'var(--font-stencil)', fontSize: 14, fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 9,
        boxShadow: '0 2px 0 var(--rust-deep)',
      }}>
        <img src={asset('icons/hev.svg')} alt="" className="cta-mech-icon" />
        <Plus size={14} strokeWidth={2.5} />
        Add HE-V
      </button>
    </div>
  );
}

function MissionChip({ m, active, onClick }) {
  return (
    <button onClick={onClick} className={`chip-hover ${active ? 'is-active' : ''}`} style={{
      background: active ? 'var(--ink)' : 'transparent',
      color: active ? 'var(--surface)' : 'var(--ink)',
      border: `1.5px solid ${active ? 'var(--ink)' : 'var(--rule-strong)'}`,
      padding: '6px 10px', cursor: 'pointer',
      fontFamily: 'var(--font-stencil)', fontSize: 12.5,
      fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
    }}>
      {m}
      <span className="mono" style={{
        marginLeft: 6, fontSize: 11,
        opacity: active ? 0.75 : 0.55, fontWeight: 400,
      }}>
        {MISSIONS[m].tons}t
      </span>
    </button>
  );
}

// ============================================================
// MECH CARD: roster list item with HE-V silhouette icon
// ============================================================
export function MechCard({ mech, index, active, onSelect }) {
  const stats = calcMech(mech);
  const wc = WC[mech.weightClass];
  return (
    <button
      onClick={() => onSelect(mech.id)}
      className="add-btn"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr auto',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink)',
        border: 'none',
        borderTop: '1px solid var(--rule)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <span className="roster-num" style={{
        color: active ? 'rgba(241,234,218,0.7)' : 'var(--mute)',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <img src={asset('icons/hev.svg')} alt=""
        style={{
          width: 26, height: 26,
          filter: active ? 'invert(1) brightness(0.95)' : 'none',
          opacity: active ? 0.85 : 0.7,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-stencil)',
          fontSize: 16, fontWeight: 700, letterSpacing: '0.03em',
          textTransform: 'uppercase',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {mech.name || <span style={{ opacity: 0.55, fontStyle: 'italic' }}>Unnamed</span>}
        </div>
        <div className="mono" style={{
          fontSize: 11.5,
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
          fontSize: 18, fontWeight: 700,
          color: stats.overTons ? (active ? '#ffb89c' : 'var(--rust)') : (active ? 'var(--surface)' : 'var(--ink)'),
        }}>
          {stats.totalUsed}t
        </div>
        <div className="mono" style={{
          fontSize: 10.5, color: active ? 'rgba(241,234,218,0.55)' : 'var(--mute)',
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
    }}>
      <img src={asset('icons/hev.svg')} alt=""
        style={{ width: 48, height: 48, opacity: 0.35, marginBottom: 10 }}
      />
      <div className="stencil" style={{ fontSize: 14, color: 'var(--mute)' }}>
        Empty Roster
      </div>
      <div style={{ marginTop: 14 }}>
        <button onClick={onAdd} className="add-btn cta-mech cta-pulse" style={{
          background: 'var(--rust)', color: 'var(--surface)', border: 'none',
          padding: '13px 22px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 14, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 9,
          boxShadow: '0 2px 0 var(--rust-deep)',
        }}>
          <img src={asset('icons/hev.svg')} alt="" className="cta-mech-icon" />
          <Plus size={13} strokeWidth={2.5} />
          Add HE-V
        </button>
      </div>
    </div>
  );
}
