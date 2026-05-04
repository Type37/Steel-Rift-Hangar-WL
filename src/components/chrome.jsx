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
// BOTTOM BAR: force name + mission selection + the two big CTAs
// ============================================================
export function BottomBar({
  forceName, onForceName, onPrint, onOptions,
  mission, customTons, onMission, onCustomTons,
  totalTons, supportCount, mechCount,
  onAddMech, onAddSupport,
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const pct = cap ? Math.min(100, (totalTons / cap) * 100) : 0;
  const over = totalTons > cap;

  // "More" reveals All-Out War + Custom. Auto-opens if user is on one.
  const isExtra = mission === 'All-Out War' || mission === 'Custom';
  const [showMore, setShowMore] = React.useState(isExtra);
  React.useEffect(() => {
    if (isExtra) setShowMore(true);
  }, [isExtra]);

  const standardMissions = MISSION_ORDER.filter(m => m !== 'All-Out War');
  const extraMissions = ['All-Out War'];

  return (
    <div className="bottombar no-print">
      {/* TOP ROW: force name + utility buttons */}
      <div className="bottombar-row bottombar-row-force">
        <label className="bottombar-force-input">
          <span className="label" style={{ marginRight: 10, flexShrink: 0 }}>Force</span>
          <input
            value={forceName}
            onChange={(e) => onForceName(e.target.value)}
            placeholder="Name your force"
          />
        </label>
        <div className="bottombar-utilities">
          <button onClick={onOptions} className="add-btn util-btn" title="Options" aria-label="Options">
            <SettingsIcon size={14} strokeWidth={2.25} />
            <span className="util-label">Options</span>
          </button>
          <button onClick={onPrint} className="add-btn util-btn util-btn-print" title="Print roster" aria-label="Print">
            <Printer size={14} strokeWidth={2.25} />
            <span className="util-label">Print</span>
          </button>
        </div>
      </div>

      {/* MID ROW: mission + tonnage bar */}
      <div className="bottombar-row bottombar-row-mission">
        <div className="bottombar-mission-row">
          <span className="label" style={{ marginRight: 4 }}>Mission</span>
          {standardMissions.map(m => (
            <MissionChip key={m} m={m} active={mission === m} onClick={() => onMission(m)} />
          ))}

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
                fontFamily: 'var(--font-stencil)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
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
                fontFamily: 'var(--font-stencil)', fontSize: 12,
                fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
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

        <div className="bottombar-ton-bar" style={{
          height: 22, background: 'var(--bg-deep)',
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

      {/* BOTTOM ROW: the two CTAs */}
      <div className="bottombar-row bottombar-row-cta">
        <button onClick={onAddSupport} className="bottombar-add-support add-btn" style={{
          background: 'transparent',
          color: 'var(--ink)',
          border: '2px solid var(--ink)',
          padding: '12px 18px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Plus size={15} strokeWidth={2.5} />
          Add Support
        </button>

        <button onClick={onAddMech} className={`bottombar-add-mech add-btn cta-mech ${mechCount === 0 ? 'cta-pulse' : ''}`} style={{
          background: 'var(--rust)',
          color: 'var(--surface)',
          border: '2px solid var(--rust)',
          padding: '12px 20px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          boxShadow: '0 2px 0 var(--rust-deep)',
        }}>
          <img src={asset('icons/hev.svg')} alt="" className="cta-mech-icon" />
          <Plus size={14} strokeWidth={2.5} />
          Add HE-V
        </button>
      </div>
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

// ============================================================
// SUPPORT ROSTER CARD: compact summary of a chosen support asset.
// Shown alongside HE-V cards so the user always sees their force.
// ============================================================
export function SupportRosterCard({ asset: a, onRemove, onClick, active }) {
  // Pull a short stats string out of the stats object if present
  const statsLine = (() => {
    if (!a.stats) return null;
    const e = Object.entries(a.stats).filter(([k]) => !/Trait|Description/i.test(k));
    if (e.length === 0) return null;
    return e.map(([k, v]) => /Per/i.test(k) ? v : `${k} ${v}`).join(' · ');
  })();

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 10,
        padding: '11px 14px',
        borderTop: '1px solid var(--rule)',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'var(--surface-2)' : 'transparent',
      }}
    >
      <span className="stencil" style={{
        fontSize: 10, padding: '2px 6px', border: '1.5px solid var(--steel)',
        color: 'var(--steel)',
      }}>
        {a.kind}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{a.name}</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>
            {a.cost}t
          </span>
        </div>
        {statsLine && (
          <div className="mono" style={{
            fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.5,
          }}>
            {statsLine}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(a.name); }}
        title={`Remove ${a.name}`}
        className="add-btn"
        style={{
          background: 'transparent', border: '1.5px solid var(--rust)',
          color: 'var(--rust)', padding: '4px 10px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 10.5,
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}
      >
        Remove
      </button>
    </div>
  );
}
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
