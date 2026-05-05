import React from 'react';
import { Printer, Settings as SettingsIcon, Plus, FolderOpen, ChevronDown } from 'lucide-react';
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
  forceName, onForceName, onPrint, onOptions, onLists,
  mission, customTons, onMission, onCustomTons,
  totalTons, supportCount, mechCount,
  onAddMech, onAddSupport,
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const pct = cap ? Math.min(100, (totalTons / cap) * 100) : 0;
  const over = totalTons > cap;

  // Mission popover: compact dropdown next to the tonnage bar.
  const [missionOpen, setMissionOpen] = React.useState(false);
  const missionRef = React.useRef(null);
  React.useEffect(() => {
    if (!missionOpen) return;
    const close = (e) => {
      if (missionRef.current && !missionRef.current.contains(e.target)) {
        setMissionOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [missionOpen]);

  return (
    <div className="bottombar no-print">
      <div className="bottombar-row-top">
        {/* MISSION + TONNAGE: a compact button-bar that shows the active
            mission as the bar label. Click to change mission. */}
        <div className="bottombar-points" ref={missionRef}>
          <button
            className="bottombar-mission-button"
            onClick={() => setMissionOpen(o => !o)}
            title="Change mission"
            style={{
              background: over ? 'var(--rust)' : 'var(--olive)',
              color: 'var(--surface)',
            }}
          >
            <span className="bottombar-mission-label">
              {useCustom ? 'CUSTOM' : mission.toUpperCase()}
            </span>
            <ChevronDown size={11} strokeWidth={2.5} style={{ opacity: 0.85 }} />
          </button>
          <div
            className="bottombar-ton-bar"
            style={{
              borderColor: over ? 'var(--rust)' : 'var(--rule-strong)',
            }}
          >
            <div
              className="bottombar-ton-fill"
              style={{
                width: `${pct}%`,
                background: over ? 'var(--rust)' : 'var(--olive)',
              }}
            />
            <div className="bottombar-ton-label mono">
              {totalTons} / {cap}t
            </div>
          </div>

          {missionOpen && (
            <div className="bottombar-mission-popover">
              {MISSION_ORDER.map(m => (
                <button
                  key={m}
                  className={`mission-popover-item ${mission === m ? 'is-active' : ''}`}
                  onClick={() => { onMission(m); setMissionOpen(false); }}
                >
                  <span>{m}</span>
                  <span className="mono" style={{ color: 'var(--mute)', fontSize: 11 }}>
                    {MISSIONS[m].tons}t
                  </span>
                </button>
              ))}
              <button
                className={`mission-popover-item ${useCustom ? 'is-active' : ''}`}
                onClick={() => { onMission('Custom'); }}
              >
                <span>Custom</span>
                {useCustom ? (
                  <input
                    type="number"
                    value={customTons}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onCustomTons(Math.max(20, Number(e.target.value) || 0))}
                    style={{
                      width: 60, padding: '2px 4px',
                      border: '1.5px solid var(--rust)', background: 'var(--surface)',
                      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  />
                ) : (
                  <span className="mono" style={{ color: 'var(--mute)', fontSize: 11 }}>
                    set
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* PRIMARY ACTIONS: Add HE-V (the rust CTA) and Add Support. */}
        <button
          onClick={onAddMech}
          className={`add-btn bottombar-add-mech cta-mech ${mechCount === 0 ? 'cta-pulse' : ''}`}
          title="Add a new HE-V"
        >
          <img src={asset('icons/hev.svg')} alt="" className="cta-mech-icon" />
          <Plus size={12} strokeWidth={2.5} />
          HE-V
        </button>
        <button
          onClick={onAddSupport}
          className="add-btn bottombar-add-support"
          title="Browse support assets"
        >
          <Plus size={12} strokeWidth={2.5} />
          Support
        </button>

        {/* IDENTITY: force name input on the right side of the bar. */}
        <label className="bottombar-force-input">
          <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Force</span>
          <input
            value={forceName}
            onChange={(e) => onForceName(e.target.value)}
            placeholder="Name your force"
          />
        </label>

        {/* UTILITIES: options / lists / print */}
        <button onClick={onOptions} className="add-btn util-btn" title="Options">
          <SettingsIcon size={13} strokeWidth={2.25} />
          <span className="util-label">Options</span>
        </button>
        <button onClick={onLists} className="add-btn util-btn" title="Save / load builds">
          <FolderOpen size={13} strokeWidth={2.25} />
          <span className="util-label">Lists</span>
        </button>
        <button onClick={onPrint} className="add-btn util-btn util-btn-print" title="Print roster">
          <Printer size={13} strokeWidth={2.25} />
          <span className="util-label">Print</span>
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
export function MechCard({ mech, index, active, onSelect, assignedTo }) {
  const stats = calcMech(mech);
  const wc = WC[mech.weightClass];

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', `hev:${mech.id}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <button
      onClick={() => onSelect(mech.id)}
      draggable
      onDragStart={handleDragStart}
      className="add-btn drag-source"
      
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Weight-class silhouette watermark */}
      <img src={asset('icons/hev.svg')} aria-hidden="true"
        style={{
          position: 'absolute', right: -8, top: '50%',
          transform: `translateY(-50%) scale(${
            mech.weightClass === 'Light' ? 0.75
            : mech.weightClass === 'Medium' ? 0.9
            : mech.weightClass === 'Heavy' ? 1.05 : 1.22
          })`,
          height: 64,
          opacity: active ? 0.08 : 0.055,
          filter: active ? 'invert(1)' : 'none',
          pointerEvents: 'none',
          transformOrigin: 'right center',
        }}
      />
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
          {mech.name || `${mech.weightClass.toUpperCase()} HE-V`}
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
          {assignedTo && (
            <span style={{
              marginLeft: 6,
              padding: '0 5px',
              background: active ? 'rgba(241,234,218,0.18)' : 'var(--olive)',
              color: active ? 'var(--surface)' : 'var(--surface)',
              fontWeight: 700, fontSize: 10,
              letterSpacing: '0.04em',
            }}>
              {assignedTo}
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
export function SupportRosterCard({ asset: a, customName, loadout, onRemove, onClick, onRename, active, assignedTo }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(customName || '');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDragStart = (e) => {
    if (editing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', `support:${a.name}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const commit = () => {
    if (onRename) onRename(draft);
    setEditing(false);
  };

  // Pull a short stats string out of the stats object if present
  const statsLine = (() => {
    if (!a.stats) return null;
    const e = Object.entries(a.stats).filter(([k]) => !/Trait|Description/i.test(k));
    if (e.length === 0) return null;
    return e.map(([k, v]) => /Per/i.test(k) ? v : `${k} ${v}`).join(' \u00B7 ');
  })();

  // Build the picked-loadout summary, e.g. "3 Strike LAS Wing, 1 Recon".
  // Empty if asset has no sub-units.
  const loadoutLine = (() => {
    if (!loadout || loadout.length === 0) return null;
    const counts = loadout.reduce((acc, n) => {
      acc[n] = (acc[n] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([n, c]) => `${c} \u00D7 ${shortenSubName(n)}`)
      .join(', ');
  })();

  const displayName = customName || a.name;

  return (
    <div
      onClick={editing ? undefined : onClick}
      draggable={!editing}
      onDragStart={handleDragStart}
      className="drag-source"
      title={onClick && !editing ? 'Click to inspect, drag to assign to a team' : undefined}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 10,
        padding: '11px 14px',
        borderTop: '1px solid var(--rule)',
        alignItems: 'center',
        cursor: onClick && !editing ? 'pointer' : 'default',
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
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit(); }
                if (e.key === 'Escape') { setDraft(customName || ''); setEditing(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={a.name}
              style={{
                background: 'var(--surface)', border: '1.5px solid var(--rust)',
                padding: '2px 6px', fontFamily: 'var(--font-body)',
                fontSize: 14, fontWeight: 700, color: 'var(--ink)',
                width: 200, maxWidth: '100%', outline: 'none',
              }}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onRename) {
                  setDraft(customName || '');
                  setEditing(true);
                }
              }}
              title={onRename ? 'Double-click to rename' : ''}
              style={{
                fontWeight: 700, fontSize: 14, color: 'var(--ink)',
                cursor: onRename ? 'text' : 'inherit',
              }}
            >
              {displayName}
            </span>
          )}
          <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>
            {a.cost}t
          </span>
          {customName && !editing && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--mute)' }}>
              ({a.name})
            </span>
          )}
        </div>
        {statsLine && (
          <div className="mono" style={{
            fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.5,
          }}>
            {statsLine}
          </div>
        )}
        {loadoutLine && (
          <div style={{
            fontSize: 12, color: 'var(--olive)', marginTop: 3, lineHeight: 1.4,
            fontWeight: 600,
          }}>
            {loadoutLine}
          </div>
        )}
        {assignedTo && (
          <div style={{ marginTop: 4 }}>
            <span style={{
              padding: '1px 6px',
              background: 'var(--olive)',
              color: 'var(--surface)',
              fontFamily: 'var(--font-stencil)',
              fontWeight: 700, fontSize: 10,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {assignedTo}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(a.name); }}
        title={`Remove ${displayName}`}
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

// Shortens long sub-unit names so they fit on a card line.
// "Reconnaissance and Disruption LAS Wing" -> "Recon/Disruption LAS Wing"
// "Infantry Fighting Vehicle" -> "IFV"
function shortenSubName(name) {
  return name
    .replace(/Reconnaissance and Disruption/gi, 'Recon/Disruption')
    .replace(/Infantry Fighting Vehicle/gi, 'IFV')
    .replace(/Combat Engineering Vehicle/gi, 'Combat Engr.')
    .replace(/Shield Projector Vehicle/gi, 'Shield Projector')
    .replace(/Fire Support Vehicle/gi, 'Fire Support')
    .replace(/Anti-Aircraft Vehicle/gi, 'AA Vehicle')
    .replace(/Artillery Vehicle/gi, 'Artillery')
    .replace(/Demolition Vehicle/gi, 'Demolition')
    .replace(/Targeting Support Vehicle/gi, 'Targeting Support')
    .replace(/Obscuration Projection Vehicle/gi, 'Obscuration Proj.')
    .replace(/Minelayer Vehicle/gi, 'Minelayer')
    .replace(/Resupply Vehicle/gi, 'Resupply')
    .replace(/Recon Vehicle/gi, 'Recon')
    .replace(/Command Vehicle/gi, 'Command')
    .replace(/Netter Vehicle/gi, 'Netter')
    .replace(/General Fire Support Tank/gi, 'GFS Tank')
    .replace(/Direct Fire Tank/gi, 'Direct Fire')
    .replace(/Missile Battery Tank/gi, 'Missile Battery')
    .replace(/Infantry Assault Tank/gi, 'Inf. Assault')
    .replace(/Infantry Air Transport/gi, 'Infantry Trans.')
    .replace(/Power Suit Air Transport/gi, 'Power Suit Trans.')
    .replace(/UL HE-V Air Transport/gi, 'UL HE-V Trans.')
    .replace(/Bunker \(([^)]+)\)/gi, 'Bunker: $1');
}
