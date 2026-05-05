import React, { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import { OFF_TABLE_ASSETS, ADVANCED_ASSETS, FACTIONS, FACTION_LOGOS, TEAMS } from '../data';
import { checkTeamEligibility, slotsForBand, findAsset } from '../calc';
import { SectionTitle, Chip, TextButton, TraitList, RowExpand, InlineTraitGlossary, collectTraits } from './ui';
import { Tooltip } from './tooltip';

// Resolve absolute asset path through Vite's base
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

// Pick one representative logo per faction for the hover-wash effect on
// the faction picker tile. Order chosen for visual punch.
const FACTION_HOVER_LOGO = {
  Authorities:  'authorities/sahel-alliance.png',
  Corporations: 'corporations/helios.png',
  Freelancers:  'freelancers/cerberus-group.png',
};

// Map team name to its silhouette icon. Icons live in /public/icons/.
const TEAM_ICONS = {
  'Reconnaissance Team':    'icons/team-recon.svg',
  'Security Team':          'icons/team-security.svg',
  'Assassination Team':     'icons/team-assassination.svg',
  'Berserker Team':         'icons/team-berserker.svg',
  'Multirole Team':         'icons/team-multirole.svg',
  'Gunslinger Team':        'icons/team-gunslinger.svg',
  'Fire Support Team':      'icons/team-fire-support.svg',
  'Coordinated Assets Team':'icons/team-coordinated-assets.svg',
};

// ============================================================
// SUPPORT PANEL
// ============================================================

export function SupportPanel({ selected, onToggle, limit, simpleMode }) {
  const [expanded, setExpanded] = useState({});
  const tag = `${selected.length}/${limit} taken`;

  return (
    <div>
      <SectionTitle tag={tag}>Support Assets</SectionTitle>

      <SubHeader>Off-Table</SubHeader>
      <div style={{ borderTop: '1.5px solid var(--ink)', borderBottom: '1.5px solid var(--ink)', marginBottom: 16 }}>
        {OFF_TABLE_ASSETS.map(a => (
          <SupportRow key={a.name} a={a} eq={selected.includes(a.name)}
            atLimit={selected.length >= limit && !selected.includes(a.name)}
            onToggle={onToggle}
            expanded={expanded[a.name]} onExpand={() => setExpanded(s => ({ ...s, [a.name]: !s[a.name] }))} />
        ))}
      </div>

      {!simpleMode && (
        <>
          <SubHeader>Advanced (Vehicles · Air · Garrisons)</SubHeader>
          <div style={{ borderTop: '1.5px solid var(--ink)', borderBottom: '1.5px solid var(--ink)' }}>
            {ADVANCED_ASSETS.map(a => (
              <SupportRow key={a.name} a={a} eq={selected.includes(a.name)}
                atLimit={selected.length >= limit && !selected.includes(a.name)}
                onToggle={onToggle}
                expanded={expanded[a.name]} onExpand={() => setExpanded(s => ({ ...s, [a.name]: !s[a.name] }))} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubHeader({ children }) {
  return (
    <div className="stencil" style={{
      fontSize: 12, color: 'var(--mute)',
      marginTop: 14, marginBottom: 4,
    }}>
      ─ {children}
    </div>
  );
}

function SupportRow({ a, eq, atLimit, onToggle, expanded, onExpand }) {
  const disabledReason = atLimit
    ? `Support cap reached for this mission. Remove another asset or pick a larger mission to add ${a.name}.`
    : null;
  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: atLimit ? 0.55 : 1,
      transition: 'background 100ms',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto', alignItems: 'center', gap: 12,
        padding: '11px 12px',
      }}>
        <RowExpand open={expanded} onClick={onExpand} />
        <span className="stencil" style={{
          fontSize: 11, padding: '2px 7px', border: '1.5px solid var(--steel)',
          color: 'var(--steel)',
        }}>
          {a.kind}
        </span>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{a.name}</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--rust)', fontWeight: 700 }}>{a.cost}t</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
            {a.summary}
          </div>
        </div>
        <span />
        <button
          onClick={() => onToggle(a.name)}
          disabled={atLimit}
          title={disabledReason || (eq ? `Remove ${a.name} from your support list.` : `Add ${a.name} (${a.cost}t).`)}
          className="add-btn"
          style={{
            border: `1.5px solid ${eq ? 'var(--rust)' : (atLimit ? 'var(--rule)' : 'var(--olive)')}`,
            background: eq ? 'transparent' : (atLimit ? 'var(--bg-deep)' : 'var(--olive)'),
            color: eq ? 'var(--rust)' : (atLimit ? 'var(--mute)' : 'var(--surface)'),
            padding: '7px 14px', cursor: atLimit ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}
        >
          {eq ? 'Remove' : 'Add'}
        </button>
      </div>
      {expanded && <SupportExpanded a={a} />}
    </div>
  );
}

// Expanded support detail: full description + stats laid out in a small table,
// plus inline glossary for every trait this asset references so you don't have
// to hover each tag individually.
function SupportExpanded({ a }) {
  // Pull traits out of the stats line if present
  const traitStr = a.stats?.Traits || '';
  const traitNames = collectTraits(traitStr);

  return (
    <div style={{
      padding: '12px 14px 16px 14px',
      background: 'var(--bg-deep)',
      borderTop: '1px dashed var(--rule)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 18,
      }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Description</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.55 }}>
            {a.fullDesc}
          </div>
        </div>
        {a.stats && (
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Statline</div>
            <table style={{
              borderCollapse: 'collapse', width: '100%',
              background: 'var(--surface)', border: '1px solid var(--rule)',
            }}>
              <tbody>
                {Object.entries(a.stats).map(([k, v]) => (
                  <tr key={k}>
                    <td className="label" style={{
                      padding: '6px 10px', fontSize: 11,
                      borderBottom: '1px solid var(--rule)',
                      background: 'var(--bg)',
                      width: '34%', verticalAlign: 'top',
                    }}>
                      {k}
                    </td>
                    <td style={{
                      padding: '6px 10px', fontSize: 13,
                      borderBottom: '1px solid var(--rule)',
                      fontFamily: /Per|Stat|SPD|ARM|STR/i.test(k) ? 'var(--font-mono)' : 'var(--font-body)',
                    }}>
                      {/Trait/i.test(k) ? <TraitList traits={v} /> : v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {traitNames.length > 0 && (
        <InlineTraitGlossary traits={traitNames} />
      )}
    </div>
  );
}

// ============================================================
// TEAMS PANEL
// ============================================================

export function TeamPanel({
  mechs, supportAssets, selectedTeams, onToggleTeam, mission,
  teamAssignments = {}, onAssign, onUnassign, onClearTeam,
  supportNicknames = {},
}) {
  const slotsRemaining = slotsForBand(mission, selectedTeams, TEAMS);
  const results = TEAMS.map(t => ({ t, ...checkTeamEligibility(t, mechs) }));

  return (
    <div>
      <SectionTitle tag={`${selectedTeams.length} active`}>HE-V Teams</SectionTitle>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${[
          mission.teamCounts['2'],
          mission.teamCounts['2-3'],
          mission.teamCounts['3-4'],
        ].filter(n => n > 0).length || 1}, 1fr)`,
        gap: 4,
        background: 'var(--ink)', padding: 4, marginBottom: 16,
      }}>
        {[
          { label: 'Teams of 2', key: '2' },
          { label: 'Teams of 2-3', key: '2-3' },
          { label: 'Teams of 3-4', key: '3-4' },
        ]
          .filter(b => mission.teamCounts[b.key] > 0)
          .map(b => {
            const total = mission.teamCounts[b.key];
            const left = slotsRemaining[b.key];
            const used = total - left;
            return (
              <div key={b.key} style={{
                background: 'var(--surface)',
                padding: '10px 8px', textAlign: 'center',
              }}>
                <div className="label" style={{ fontSize: 10.5, marginBottom: 2 }}>{b.label}</div>
                <div className="mono" style={{
                  fontSize: 19, fontWeight: 700,
                  color: left === 0 ? 'var(--rust)' : 'var(--ink)',
                }}>
                  {used}/{total}
                </div>
              </div>
            );
          })}
      </div>

      <div>
        {results.map(({ t, eligible, minsMet, perReq }) => {
          const sel = selectedTeams.includes(t.name);
          // Team minimum size from band string ("2", "2-3", "3-4") = first number
          const minSize = parseInt(t.band.split('-')[0], 10);
          const canAssign = minsMet && eligible >= minSize;
          const slotLeft = slotsRemaining[t.band] > 0 || sel;
          return (
            <TeamRow
              key={t.name}
              team={t}
              eligible={eligible}
              minSize={minSize}
              canAssign={canAssign}
              slotLeft={slotLeft}
              selected={sel}
              onToggle={onToggleTeam}
              perReq={perReq}
              assignedIds={teamAssignments[t.name] || []}
              mechs={mechs}
              supportAssets={supportAssets}
              supportNicknames={supportNicknames}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onClearTeam={onClearTeam}
            />
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({
  team, eligible, minSize, canAssign, slotLeft, selected, onToggle, perReq,
  assignedIds = [], mechs = [], supportAssets = [], supportNicknames = {},
  onAssign, onUnassign, onClearTeam,
}) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Drop handler: read the dragged unit ID and assign to this team.
  const handleDragOver = (e) => {
    if (!selected) return; // Only enlisted teams accept drops
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOver) setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!selected || !onAssign) return;
    const unitId = e.dataTransfer.getData('text/plain');
    if (unitId) onAssign(team.name, unitId);
  };

  // Resolve assigned IDs to display info.
  const assignedUnits = assignedIds.map(id => {
    if (id.startsWith('hev:')) {
      const m = mechs.find(x => x.id === id.slice(4));
      if (m) return {
        id,
        label: m.name || `${m.weightClass.toUpperCase()} HE-V`,
        kind: 'hev',
      };
    } else if (id.startsWith('support:')) {
      const name = id.slice(8);
      if (supportAssets.includes(name)) return {
        id,
        label: supportNicknames[name] || name,
        kind: 'support',
      };
    }
    return null;
  }).filter(Boolean);

  // Decide button state
  // - selected → "Remove" (rust outlined)
  // - canAssign + slotLeft → "Assign" (olive solid)
  // - !canAssign → "Enlist" (steel dashed; reminds user they'd need to recruit)
  // - !slotLeft → disabled, tooltip explains why
  let btnLabel, btnStyle, btnDisabled, btnTitle;
  if (selected) {
    btnLabel = 'Remove';
    btnStyle = {
      border: '1.5px solid var(--rust)',
      background: 'transparent',
      color: 'var(--rust)',
    };
    btnDisabled = false;
    btnTitle = 'Remove this team from your force.';
  } else if (!slotLeft) {
    btnLabel = canAssign ? 'Assign' : 'Enlist';
    btnStyle = {
      border: '1.5px solid var(--rule)',
      background: 'var(--bg-deep)',
      color: 'var(--mute)',
    };
    btnDisabled = true;
    btnTitle = `No team slot of size ${team.band} left for this mission.`;
  } else if (canAssign) {
    btnLabel = 'Assign';
    btnStyle = {
      border: '1.5px solid var(--olive)',
      background: 'var(--olive)',
      color: 'var(--surface)',
    };
    btnDisabled = false;
    btnTitle = 'You have enough qualifying HE-Vs to form this team. Click to assign them.';
  } else {
    btnLabel = 'Enlist';
    btnStyle = {
      border: '1.5px dashed var(--steel)',
      background: 'transparent',
      color: 'var(--steel)',
    };
    btnDisabled = false;
    btnTitle = 'Your roster does not meet this team\'s requirements yet. Picking it now reminds you to recruit qualifying HE-Vs.';
  }

  // Eligibility badge text + tooltip
  const eligText = canAssign ? `${eligible} ready` : `${eligible} so far`;
  const eligibilityTooltip = (
    <div style={{ lineHeight: 1.5 }}>
      A team grants its benefits only when at least {minSize} HE-Vs in your roster meet its requirements at the same time. Eligibility checks the weight class of each HE-V, any required upgrades or defensive configurations, and weapon constraints listed below.
    </div>
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
        marginBottom: -1,
        background: dragOver ? 'var(--olive)' : (selected ? 'var(--surface)' : 'transparent'),
        outline: dragOver ? '2px dashed var(--olive-deep)' : 'none',
        outlineOffset: -3,
        transition: 'background 100ms',
      }}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto', alignItems: 'center', gap: 12,
        padding: '12px 12px',
      }}>
        <RowExpand open={open} onClick={() => setOpen(o => !o)} />
        {TEAM_ICONS[team.name] ? (
          <img src={asset(TEAM_ICONS[team.name])} alt=""
            style={{
              width: 32, height: 32,
              opacity: canAssign ? 0.95 : 0.55,
              filter: selected ? 'none' : 'grayscale(0.4)',
              flexShrink: 0,
            }}
          />
        ) : <span style={{ width: 32 }} />}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span className="stencil" style={{ fontSize: 14 }}>{team.name}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>
              Team of {team.band}
            </span>
            <Tooltip title="Eligibility" body={eligibilityTooltip}>
              <span className="tok mono" style={{
                fontSize: 11, fontWeight: 700,
                color: canAssign ? 'var(--olive)' : 'var(--mute)',
                border: `1px ${canAssign ? 'solid var(--olive)' : 'dashed var(--rule)'}`,
                padding: '1px 6px',
                borderBottom: `1px ${canAssign ? 'solid var(--olive)' : 'dashed var(--rule)'}`,
              }}>
                {canAssign ? '\u2713' : ''} {eligText}
              </span>
            </Tooltip>
          </div>
        </div>
        <span />
        <button
          onClick={() => onToggle(team.name)}
          disabled={btnDisabled}
          title={btnTitle}
          className="add-btn"
          style={{
            ...btnStyle,
            padding: '7px 16px',
            cursor: btnDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            opacity: btnDisabled ? 0.55 : 1,
          }}
        >
          {btnLabel}
        </button>
      </div>

      {/* Assigned units strip. Always shown when team is selected so the
          drop zone is visible even with no assignments yet. */}
      {selected && (
        <AssignmentStrip
          team={team}
          assignedUnits={assignedUnits}
          assignedIds={assignedIds}
          mechs={mechs}
          supportAssets={supportAssets}
          supportNicknames={supportNicknames}
          onAssign={onAssign}
          onUnassign={onUnassign}
          onClearTeam={onClearTeam}
        />
      )}

      {open && (
        <div style={{ padding: '0 14px 16px 14px', background: 'var(--bg-deep)', borderTop: '1px dashed var(--rule)' }}>
          <div style={{ marginTop: 12 }}><span className="label">Requirements</span></div>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>
            {team.req.map((r, i) => {
              const matchCount = perReq[i]?.total ?? 0;
              const met = matchCount >= r.min;
              return (
                <div key={i} style={{
                  borderLeft: `3px solid ${met ? 'var(--olive)' : 'var(--rule-strong)'}`,
                  paddingLeft: 10, marginBottom: 6,
                }}>
                  <span className="mono" style={{ fontSize: 12, color: met ? 'var(--olive)' : 'var(--mute)', fontWeight: 700 }}>
                    {matchCount}/{r.min}-{r.max}
                  </span>{' '}
                  <strong>{r.cls}</strong>
                  {r.needs && <span> with {r.needs.join(' + ')}</span>}
                  {r.needsDefensive && <span> with any Defensive Configuration</span>}
                  {r.melee && <span>, equipping a Melee weapon</span>}
                  {r.noReach && <span>, no Reach</span>}
                  {r.noDup && <span>, no duplicate weapons</span>}
                  {r.reinforced && <span>, with at least one Reinforcement</span>}
                  {r.stripped && <span>, both Armor and Structure Stripped</span>}
                  {r.shortMeleeOnly && <span>, only Short or Melee weapons</span>}
                  {r.noBlast && <span>, no Blast weapons</span>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}><span className="label">Benefits</span></div>
          {team.benefitsList ? (
            <div style={{ marginTop: 4 }}>
              {team.benefitsList.map((g, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr',
                  gap: 12,
                  alignItems: 'baseline',
                  padding: '6px 0',
                  borderTop: i === 0 ? '1px dotted var(--rule)' : 'none',
                  borderBottom: '1px dotted var(--rule)',
                }}>
                  <div className="mono" style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--rust)',
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}>
                    {g.gate}
                  </div>
                  <ul style={{
                    margin: 0, paddingLeft: 18,
                    fontSize: 13, color: 'var(--ink)', lineHeight: 1.55,
                  }}>
                    {g.items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>{team.benefits}</div>
          )}
          <div style={{ marginTop: 10 }}><span className="label">Team Agenda</span></div>
          <div style={{ fontSize: 13, color: 'var(--steel)', lineHeight: 1.6, marginTop: 4, whiteSpace: 'pre-line' }}>{team.agenda}</div>
        </div>
      )}
    </div>
  );
}

// AssignmentStrip: chips for each assigned unit, plus a tap-to-assign
// button that opens a popover listing every available unit not yet on
// this team. Drag-drop still works on the parent row; this is the
// touch-friendly fallback.
function AssignmentStrip({
  team, assignedUnits, assignedIds,
  mechs, supportAssets, supportNicknames,
  onAssign, onUnassign, onClearTeam,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [pickerOpen]);

  // Available units: every HE-V + support that is NOT already on this team.
  const candidates = [];
  mechs.forEach(m => {
    const id = `hev:${m.id}`;
    if (!assignedIds.includes(id)) {
      candidates.push({
        id,
        label: m.name || `${m.weightClass.toUpperCase()} HE-V`,
        kind: 'hev',
        cls: m.weightClass,
        tons: m.armor + m.structure,
      });
    }
  });
  supportAssets.forEach(name => {
    const id = `support:${name}`;
    if (!assignedIds.includes(id)) {
      candidates.push({
        id,
        label: supportNicknames[name] || name,
        kind: 'support',
      });
    }
  });

  return (
    <div style={{
      padding: '0 14px 10px 56px',
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
      minHeight: 22,
      position: 'relative',
    }} ref={ref}>
      {assignedUnits.length === 0 && (
        <span style={{
          fontSize: 11.5, color: 'var(--mute)', fontStyle: 'italic',
        }}>
          Drag units here or use + Assign.
        </span>
      )}
      {assignedUnits.map(u => (
        <span
          key={u.id}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 4px 2px 8px',
            background: u.kind === 'support' ? 'var(--steel)' : 'var(--olive)',
            color: 'var(--surface)',
            fontFamily: 'var(--font-stencil)',
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}
        >
          {u.label}
          <button
            onClick={(e) => { e.stopPropagation(); onUnassign?.(u.id); }}
            title="Remove from team"
            style={{
              background: 'transparent', border: 'none',
              color: 'rgba(241,234,218,0.85)',
              padding: '0 4px', cursor: 'pointer',
              fontSize: 13, lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}

      {/* + Assign tap button. Always available; popover lists available units. */}
      {candidates.length > 0 && (
        <button
          onClick={() => setPickerOpen(o => !o)}
          style={{
            background: 'transparent',
            border: '1.5px dashed var(--rule-strong)',
            color: 'var(--ink-2)',
            padding: '2px 8px', cursor: 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 11,
            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
          title="Pick a unit to assign"
        >
          + Assign
        </button>
      )}

      {assignedUnits.length > 0 && onClearTeam && (
        <button
          onClick={() => onClearTeam(team.name)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--mute)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 11.5,
            textDecoration: 'underline', padding: '0 4px',
          }}
          title="Unassign all units from this team"
        >
          clear all
        </button>
      )}

      {pickerOpen && (
        <div style={{
          position: 'absolute',
          top: '100%', left: 56,
          background: 'var(--surface)',
          border: '2px solid var(--ink)',
          minWidth: 240, maxWidth: 320,
          zIndex: 50,
          maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
        }}>
          {candidates.map(c => (
            <button
              key={c.id}
              onClick={() => {
                onAssign?.(team.name, c.id);
                setPickerOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%',
                background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--rule)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 13, color: 'var(--ink)',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontSize: 9.5,
                padding: '1px 5px',
                border: '1px solid ' + (c.kind === 'support' ? 'var(--steel)' : 'var(--olive)'),
                color: c.kind === 'support' ? 'var(--steel)' : 'var(--olive)',
                fontFamily: 'var(--font-body)', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {c.kind === 'hev' ? (c.cls || 'HE-V') : 'SUPP'}
              </span>
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.tons && <span style={{ fontSize: 10.5, color: 'var(--mute)' }}>{c.tons}t</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// Right-pane content when a support asset is added or clicked.
// Shows everything: full description, statline as a table, and an
// inline glossary of any traits referenced.
// ============================================================

export function SupportDetailView({ assetName, customName, loadout, onSetLoadout, onBack }) {
  const a = findAsset(assetName);
  if (!a) return null;
  const traitNames = collectTraits(a.stats?.Traits || '');

  // Resolve effective loadout. Defaults to empty so the user assembles
  // their squadron deliberately by clicking + on each desired type.
  const effectiveLoadout = loadout || [];

  return (
    <div style={{ maxWidth: 760 }}>
      {onBack && (
        <button onClick={onBack} className="add-btn" style={{
          background: 'transparent', border: '1.5px solid var(--rule-strong)',
          color: 'var(--ink-2)', padding: '6px 14px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
          letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          ← Browse all
        </button>
      )}

      <div className="stencil" style={{
        fontSize: 12, color: 'var(--rust)', letterSpacing: '0.22em', marginBottom: 6,
      }}>
        SUPPORT ASSET · {a.kind.toUpperCase()}
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32, fontWeight: 700, letterSpacing: '0.03em',
        textTransform: 'uppercase', margin: '0 0 4px',
        lineHeight: 1.05,
      }}>
        {customName || a.name}
      </h1>
      {customName && (
        <div className="mono" style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 8 }}>
          ({a.name})
        </div>
      )}
      <div className="mono" style={{
        fontSize: 14, color: 'var(--rust)', fontWeight: 700, marginBottom: 16,
      }}>
        {a.cost} tons
      </div>

      <div style={{
        borderLeft: '3px solid var(--steel)',
        paddingLeft: 14,
        marginBottom: 18,
        fontSize: 14, color: 'var(--ink-2)', fontStyle: 'italic',
      }}>
        {a.summary}
      </div>

      <div className="label" style={{ marginBottom: 6 }}>Composition</div>
      <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 18 }}>
        {a.fullDesc}
      </div>

      {a.subunits && a.unitCount && onSetLoadout && (
        <SubUnitPicker
          asset={a}
          loadout={effectiveLoadout}
          onChange={onSetLoadout}
        />
      )}

      {a.subunits && a.subunits.length > 0 && (
        <>
          <div className="label" style={{ marginBottom: 6, marginTop: 18 }}>
            Sub-unit reference
          </div>
          <div style={{ overflowX: 'auto', marginBottom: 18 }}>
            <table style={{
              borderCollapse: 'collapse', width: '100%',
              background: 'var(--surface)', border: '1px solid var(--rule)',
              fontSize: 12.5,
            }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={subTableTh}>Type</th>
                  <th style={{ ...subTableTh, textAlign: 'center', width: 56 }}>SPD</th>
                  <th style={{ ...subTableTh, textAlign: 'center', width: 50 }}>ARM</th>
                  <th style={{ ...subTableTh, textAlign: 'center', width: 50 }}>STR</th>
                  <th style={subTableTh}>Weapons</th>
                  <th style={subTableTh}>Traits</th>
                </tr>
              </thead>
              <tbody>
                {a.subunits.map(su => (
                  <tr key={su.name}>
                    <td style={subTableTd}>
                      <strong>{su.name}</strong>
                    </td>
                    <td style={{ ...subTableTd, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{su.spd}</td>
                    <td style={{ ...subTableTd, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{su.arm}</td>
                    <td style={{ ...subTableTd, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{su.str}</td>
                    <td style={subTableTd}>{su.weapons}</td>
                    <td style={{ ...subTableTd, fontSize: 12, color: 'var(--ink-2)' }}>{su.traits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {a.stats && (
        <>
          <div className="label" style={{ marginBottom: 6 }}>Shared Stats</div>
          <table style={{
            borderCollapse: 'collapse', width: '100%', maxWidth: 560,
            background: 'var(--surface)', border: '1px solid var(--rule)',
            marginBottom: 18,
          }}>
            <tbody>
              {Object.entries(a.stats).map(([k, v]) => (
                <tr key={k}>
                  <td className="label" style={{
                    padding: '8px 12px', fontSize: 11,
                    borderBottom: '1px solid var(--rule)',
                    background: 'var(--bg)',
                    width: '32%', verticalAlign: 'top',
                  }}>
                    {k}
                  </td>
                  <td style={{
                    padding: '8px 12px', fontSize: 13,
                    borderBottom: '1px solid var(--rule)',
                    fontFamily: /Per|Stat|SPD|ARM|STR/i.test(k) ? 'var(--font-mono)' : 'var(--font-body)',
                  }}>
                    {/Trait/i.test(k) ? <TraitList traits={v} /> : v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {traitNames.length > 0 && <InlineTraitGlossary traits={traitNames} />}
    </div>
  );
}

// ============================================================
// SUB-UNIT PICKER
// Lets the user assemble the actual squadron, troop, or outpost from
// the available sub-unit types. Honors the asset's pickRule:
//   - 'any':         no constraint
//   - 'allSame':     every slot must be the same type
//   - 'maxTwoEach':  no type more than twice
// ============================================================
function SubUnitPicker({ asset: a, loadout, onChange }) {
  const counts = loadout.reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
  const total = loadout.length;
  const target = a.unitCount;
  const rule = a.pickRule || 'any';

  // Predicate: can we add one more of this sub-unit name?
  const canAdd = (name) => {
    if (total >= target) return false;
    if (rule === 'allSame') {
      // Only allowed if loadout is empty or already this type.
      const filled = loadout.filter(Boolean);
      return filled.length === 0 || filled.every(n => n === name);
    }
    if (rule === 'maxTwoEach') {
      return (counts[name] || 0) < 2;
    }
    return true;
  };

  const canRemove = (name) => (counts[name] || 0) > 0;

  const add = (name) => {
    if (!canAdd(name)) return;
    onChange([...loadout, name]);
  };
  const remove = (name) => {
    if (!canRemove(name)) return;
    // Remove the last instance.
    const idx = loadout.lastIndexOf(name);
    if (idx === -1) return;
    onChange([...loadout.slice(0, idx), ...loadout.slice(idx + 1)]);
  };

  // Constraint hint for the user.
  const ruleText = {
    any: `Pick exactly ${target}, in any combination.`,
    allSame: `Pick ${target} of the same type.`,
    maxTwoEach: `Pick ${target}; no type more than twice.`,
  }[rule];

  return (
    <div style={{
      border: '2px solid var(--teal)',
      background: 'var(--bg)',
      padding: '14px 14px 12px',
      marginBottom: 18,
      borderRadius: 6,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 8, flexWrap: 'wrap',
      }}>
        <div className="label" style={{ fontSize: 12 }}>
          Loadout
          <span className="mono" style={{
            marginLeft: 8, color: total === target ? 'var(--olive)' : 'var(--rust)',
            fontWeight: 700,
          }}>
            {total} / {target}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', fontStyle: 'italic' }}>
          {ruleText}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {a.subunits.map(su => {
          const count = counts[su.name] || 0;
          const blocked = !canAdd(su.name);
          return (
            <div
              key={su.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10, alignItems: 'center',
                padding: '8px 10px',
                background: count > 0 ? 'var(--surface)' : 'transparent',
                border: '1px solid var(--rule)',
                borderRadius: 4,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                  {su.name}
                </div>
                <div className="mono" style={{
                  fontSize: 11, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.4,
                }}>
                  SPD {su.spd} · ARM {su.arm} · STR {su.str}
                </div>
                <div style={{
                  fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.4,
                }}>
                  {su.weapons}
                </div>
                {su.traits && su.traits !== '—' && (
                  <div style={{
                    fontSize: 11, color: 'var(--mute)', marginTop: 2, fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}>
                    {su.traits}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => remove(su.name)}
                  disabled={!canRemove(su.name)}
                  title={`Remove one ${su.name}`}
                  style={pickerBtn(canRemove(su.name), 'down')}
                >
                  <Minus size={14} strokeWidth={2.75} />
                </button>
                <div className="mono" style={{
                  width: 28, textAlign: 'center',
                  fontSize: 16, fontWeight: 700, color: 'var(--ink)',
                }}>
                  {count}
                </div>
                <button
                  onClick={() => add(su.name)}
                  disabled={blocked}
                  title={blocked ? 'Cannot add another' : `Add a ${su.name}`}
                  style={pickerBtn(!blocked, 'up')}
                >
                  <Plus size={14} strokeWidth={2.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pickerBtn(enabled, dir) {
  if (!enabled) {
    return {
      width: 32, height: 32,
      border: '1.5px solid var(--rule)',
      background: 'transparent',
      color: 'var(--rule)',
      cursor: 'not-allowed',
      borderRadius: 4,
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.45,
    };
  }
  if (dir === 'up') {
    return {
      width: 32, height: 32,
      border: '1.5px solid var(--olive-deep)',
      background: 'var(--olive)',
      color: 'var(--surface)',
      cursor: 'pointer',
      borderRadius: 4,
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 0 var(--olive-deep)',
    };
  }
  // down
  return {
    width: 32, height: 32,
    border: '1.5px solid var(--rule-strong)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    cursor: 'pointer',
    borderRadius: 4,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

const subTableTh = {
  padding: '8px 10px',
  fontFamily: 'var(--font-stencil)',
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--ink-2)',
  borderBottom: '1.5px solid var(--rule-strong)',
  textAlign: 'left',
};
const subTableTd = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--rule)',
  verticalAlign: 'top',
  lineHeight: 1.4,
};

export function FactionPanel({ faction, perks, onSetFaction, onTogglePerk }) {
  const data = faction ? FACTIONS[faction] : null;

  return (
    <div>
      <SectionTitle tag={faction ? `${perks.length}/2 perks` : 'none'}>Faction</SectionTitle>

      <div className="faction-tiles">
        {Object.keys(FACTIONS).map(f => {
          const cls = `faction-tile faction-tile-${f.toLowerCase()} ${faction === f ? 'is-active' : ''}`;
          return (
            <button
              key={f}
              onClick={() => onSetFaction(f)}
              className={cls}
              style={{
                '--faction-hover-bg': `url("${asset(FACTION_HOVER_LOGO[f])}")`,
              }}
            >
              <span className="faction-tile-name">{f}</span>
              <span className="faction-tile-blurb">{FACTIONS[f].blurb.split('.')[0]}.</span>
            </button>
          );
        })}
      </div>

      {data && (
        <>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 12px' }}>
            {data.blurb}
          </p>
          <div style={{
            background: 'var(--surface)',
            borderLeft: '3px solid var(--steel)',
            padding: '10px 14px',
            marginBottom: 18,
          }}>
            <div className="label" style={{ marginBottom: 4 }}>Faction Agenda</div>
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
              {data.agenda}
            </div>
          </div>

          {/* Logo upload moved to Options. */}

          <div className="label" style={{ marginBottom: 8 }}>Perks (pick 2, max 1 per group)</div>
          {Object.entries(data.perks).map(([group, opts]) => {
            const inGroup = opts.find(o => perks.includes(o.name));
            return (
              <div key={group} style={{ marginBottom: 14 }}>
                <div className="stencil" style={{
                  fontSize: 12, color: 'var(--mute)',
                  paddingBottom: 2, borderBottom: '1px dotted var(--rule)', marginBottom: 6,
                }}>
                  {group}
                </div>
                {opts.map(o => {
                  const eq = perks.includes(o.name);
                  const blocked = !eq && (inGroup || perks.length >= 2);
                  const blockedReason = !eq
                    ? (inGroup ? `You already picked "${inGroup.name}" from this group; only one perk per group allowed.`
                        : perks.length >= 2 ? 'You already picked 2 perks. Remove one first.' : null)
                    : null;
                  return (
                    <button
                      key={o.name}
                      onClick={() => !blocked && onTogglePerk(o.name)}
                      disabled={blocked}
                      title={blockedReason || (eq ? `Remove ${o.name}.` : `Add ${o.name}.`)}
                      className="add-btn"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 10, alignItems: 'flex-start',
                        background: eq ? 'var(--surface)' : 'transparent',
                        border: 'none',
                        padding: '8px 10px',
                        width: '100%', textAlign: 'left',
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        opacity: blocked ? 0.45 : 1,
                        marginBottom: 2,
                      }}
                    >
                      <span style={{
                        marginTop: 2, width: 18, height: 18,
                        border: '1.5px solid var(--ink)',
                        background: eq ? 'var(--ink)' : 'transparent',
                        color: 'var(--surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {eq && <Check size={12} strokeWidth={3} />}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{o.name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: 2 }}>
                          {o.text}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
