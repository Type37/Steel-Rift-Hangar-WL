import React, { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import { OFF_TABLE_ASSETS, ADVANCED_ASSETS, FACTIONS, FACTION_LOGOS, TEAMS, VEHICLE_WEAPONS, INFANTRY_SQUADS, INFANTRY_SHARED_TRAITS, POWER_SUIT_SQUADS, POWER_SUIT_SHARED_TRAITS, UNIVERSAL_AGENDAS } from '../data';
import { checkTeamEligibility, slotsForBand, findAsset, mechQualifiesForTeam } from '../calc';
import { SectionTitle, Chip, TextButton, TraitList, RowExpand, InlineTraitGlossary, RulesText, collectTraits, HoverEditHint } from './ui';
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
  'Networked AI Team':       'icons/team-networked-ai.svg',
  'Coordinated Assets Team': 'icons/team-coordinated-assets.svg',
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
        display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 12,
        padding: '11px 12px',
      }}>
        <RowExpand open={expanded} onClick={onExpand} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{a.name}</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--rust)', fontWeight: 700 }}>{a.cost}t</span>
            <span className="stencil" style={{
              fontSize: 9.5, padding: '1px 6px', border: '1px solid var(--steel)',
              color: 'var(--steel)', letterSpacing: '0.14em',
            }}>
              {a.kind.toUpperCase()}
            </span>
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
  supportNicknames = {}, focusTeamName, onFocusConsumed,
  onSelectMech,
}) {
  const slotsRemaining = slotsForBand(mission, selectedTeams, TEAMS);
  const results = TEAMS.map(t => ({ t, ...checkTeamEligibility(t, mechs, supportAssets) }));

  // Auto-open and scroll to focused team
  const focusRef = React.useRef(null);
  React.useEffect(() => {
    if (focusTeamName && focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onFocusConsumed?.();
    }
  }, [focusTeamName]);

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
          const isFocused = focusTeamName === t.name;
          const minSize = parseInt(t.band.split('-')[0], 10);
          const canAssign = minsMet && eligible >= minSize;
          const slotLeft = slotsRemaining[t.band] > 0 || sel;
          return (
            <TeamRow
              key={t.name}
              forwardRef={isFocused ? focusRef : null}
              defaultOpen={isFocused}
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
              onSelectMech={onSelectMech}
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
  onAssign, onUnassign, onClearTeam, forwardRef, defaultOpen,
  onSelectMech,
}) {
  const [open, setOpen] = useState(defaultOpen != null ? defaultOpen : selected);
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
        mech: m,
        qualifiedReqIdx: mechQualifiesForTeam(m, team),
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
      ref={forwardRef}
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
                  {r.reqText && r.reqText !== '-' ? (
                    <span> — {r.reqText}</span>
                  ) : (
                    <>
                      {r.needs && <span> with {r.needs.join(', ')}</span>}
                      {r.needsDefensive && <span> with any Defensive Configuration</span>}
                      {r.melee && <span>, equipping a Melee weapon</span>}
                      {r.noReach && <span>, no Reach</span>}
                      {r.noDup && <span>, no duplicate weapons</span>}
                      {r.reinforced && <span>, with Armor or Structure Reinforced</span>}
                      {r.stripped && <span>, both Armor and Structure Stripped</span>}
                      {r.shortMeleeOnly && <span style={{ color: 'var(--rust)' }}>, only Short-range or Melee weapons allowed</span>}
                      {r.noBlast && <span>, no Blast weapons</span>}
                      {r.hasDrone && <span> with any Companion Drone</span>}
                      {r.noStripped && <span>, not Stripped</span>}
                    </>
                  )}
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
          {selected && (
            <>
              <div style={{
                marginTop: 14, marginBottom: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span className="label">Assigned HE-Vs</span>
                <span style={{ fontSize: 11, color: 'var(--mute)', fontStyle: 'italic' }}>
                  drag from roster or use + Assign
                </span>
              </div>
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
                onSelectMech={onSelectMech}
              />
            </>
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
  onAssign, onUnassign, onClearTeam, onSelectMech,
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

  // Available units: HE-Vs always eligible; support assets only if team has a support slot req.
  const SUPPORT_SLOT_NAMES = ['UL HE-V Squadron', 'Assault Vehicle Squadron'];
  const teamHasSupportSlot = team.req.some(r => r.cls === 'UL HE-V or Assault Vehicle Squadron');
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
  if (teamHasSupportSlot) {
    supportAssets.forEach(name => {
      if (!SUPPORT_SLOT_NAMES.includes(name)) return;
      const id = `support:${name}`;
      if (!assignedIds.includes(id)) {
        candidates.push({
          id,
          label: supportNicknames[name] || name,
          kind: 'support',
        });
      }
    });
  }

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
      {assignedUnits.map(u => {
        const isHev = u.kind === 'hev';
        const mechId = isHev ? u.id.slice(4) : null;
        const editable = isHev && onSelectMech;
        const qualified = isHev && u.qualifiedReqIdx >= 0;
        const matchedReqText = qualified
          ? team.req[u.qualifiedReqIdx]?.reqText || team.req[u.qualifiedReqIdx]?.cls
          : null;
        return (
          <span
            key={u.id}
            onClick={editable ? (e) => { e.stopPropagation(); onSelectMech(mechId); } : undefined}
            title={
              isHev
                ? (qualified
                    ? `Qualifies: ${matchedReqText}` + (editable ? ' · click to edit' : '')
                    : 'Does not satisfy any requirement row for this team')
                : undefined
            }
            className={editable ? 'has-edit-hint-inline' : ''}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 4px 2px 6px',
              background: u.kind === 'support'
                ? 'var(--steel)'
                : (qualified ? 'var(--olive)' : 'var(--mute)'),
              color: 'var(--surface)',
              fontFamily: 'var(--font-stencil)',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: editable ? 'pointer' : 'default',
              transition: 'filter 100ms ease-out',
              outline: qualified ? '1px solid rgba(241,234,218,0.4)' : 'none',
            }}
          >
            {/* Qualification badge: green ✓ if this HE-V matches a req row,
                neutral · otherwise. Worn on the chip so you can scan a row
                of assigned units and see at a glance which ones count. */}
            {isHev && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 14, height: 14, borderRadius: '50%',
                  background: qualified ? '#fff' : 'rgba(255,255,255,0.25)',
                  color: qualified ? 'var(--olive)' : 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {qualified ? '✓' : '·'}
              </span>
            )}
            {u.label}
            {editable && <HoverEditHint size="sm" />}
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
        );
      })}

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
                {c.kind === 'hev' ? (c.cls || 'HE-V') : 'ASSET'}
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
// Orbital Stockpiles: bump Limited (N) → Limited (N+1) in trait strings

function bumpLimited(str) {
  if (!str) return str;
  return str.replace(/Limited\s*\((\d+)\)/g, (_, n) => `Limited (${Number(n) + 1})`);
}

function BumpedText({ str, active }) {
  if (!active || !str) return <>{str}</>;
  const parts = String(str).split(/(Limited\s*\(\d+\))/g);
  return (
    <>
      {parts.map((part, i) =>
        /Limited\s*\(\d+\)/.test(part)
          ? <span key={i} style={{ color: 'var(--perk)', fontWeight: 700 }}>
              {part.replace(/Limited\s*\((\d+)\)/, (_, n) => `Limited (${Number(n) + 1})`)}
            </span>
          : part
      )}
    </>
  );
}

export function SupportDetailView({ assetName, customName, loadout, onSetLoadout, garrisonLoadout, garrisonCount = 1, onSetGarrisonLoadout, onBack, activePerks = [] }) {
  const a = findAsset(assetName);
  if (!a) return null;
  const hasOrbital = activePerks.includes('Orbital Stockpiles') && a.kind === 'Off-Table';
  const traitNames = collectTraits(hasOrbital ? bumpLimited(a.stats?.Traits || '') : (a.stats?.Traits || ''));

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

      {!(a.subunits && a.subunits.length > 0) && a.summary && (
        <div style={{
          borderLeft: '3px solid var(--steel)',
          paddingLeft: 14,
          marginBottom: 18,
          fontSize: 14, color: 'var(--ink-2)', fontStyle: 'italic',
        }}>
          {a.summary}
        </div>
      )}

      {a.fullDesc && (
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 18 }}>
          {a.fullDesc}
        </div>
      )}

      {a.subunits && a.subunits.length > 0 && (
        <SubUnitPicker
          asset={a}
          loadout={effectiveLoadout}
          onChange={onSetLoadout || null}
          garrisonLoadout={garrisonLoadout}
          garrisonCount={garrisonCount}
          onSetGarrisonLoadout={onSetGarrisonLoadout}
        />
      )}

      {/* If asset itself has a garrison trait (e.g. Heavy Tank shared Garrison), show picker here */}
      {a.stats?.Traits && /Garrison/i.test(a.stats.Traits) && (
        <GarrisonRef
          traitStr={a.stats.Traits}
          garrisonLoadout={garrisonLoadout}
          garrisonCount={garrisonCount}
          onSetGarrisonLoadout={onSetGarrisonLoadout}
        />
      )}

      {a.stats && (
        <div style={{
          fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7,
          marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {Object.entries(a.stats).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className="label" style={{ fontSize: 10, flexShrink: 0 }}>{k}</span>
              <span>
                {/Trait|All models|Per model/i.test(k) ? <BumpedText str={v} active={hasOrbital} /> : <BumpedText str={String(v)} active={hasOrbital} />}
              </span>
            </div>
          ))}
        </div>
      )}

      {traitNames.length > 0 && <InlineTraitGlossary traitStr={hasOrbital ? bumpLimited(a.stats?.Traits || '') : (a.stats?.Traits || '')} />}
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

// Tiny pip row for sub-unit stat display: shields for armor, circles for structure.
function MiniPips({ value, kind }) {
  if (!value || value === '-') return null;
  const n = parseInt(value, 10);
  if (!n) return null;
  const rows = [];
  for (let i = 0; i < n; i += 5) rows.push(Math.min(5, n - i));
  const isArmor = kind === 'armor';
  const color = isArmor ? 'var(--steel)' : 'var(--olive-deep)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
      {rows.map((rowLen, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: rowLen }).map((_, i) => (
            <span key={i} style={{
              display: 'inline-block',
              width: isArmor ? 11 : 10,
              height: isArmor ? 13 : 10,
              border: `1px solid ${color}`,
              borderRadius: isArmor ? '50% 50% 50% 50% / 25% 25% 75% 75%' : '50%',
              background: 'transparent',
              flexShrink: 0,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}


// Look up a weapon from VEHICLE_WEAPONS by name (partial match).
function findVehicleWeapon(name) {
  return VEHICLE_WEAPONS.find(w => w.name.toLowerCase() === name.toLowerCase().trim());
}

// Parse a weapons string like "Vehicle Autocannon, Submunitions" into an array of lookups.
function parseWeapons(str) {
  if (!str || str === '—' || typeof str !== 'string') return [];
  return str
    .split(/,\s*/)
    .map(w => w
      .replace(/\s*[×x]\d+$/, '')           // strip ×2
      .replace(/\s*\(each\)/i, '')           // strip (each)
      .replace(/\s*\(per model\)/i, '')      // strip (per model)
      .trim()
    )
    .flatMap(w => w.split(/\s+or\s+/i).map(p => p.trim()))
    .filter(Boolean);
}

// Garrison reference: show infantry or power suit squad options inline.
function GarrisonRef({ traitStr, garrisonLoadout, garrisonCount = 1, onSetGarrisonLoadout }) {
  const infMatch = traitStr && traitStr.match(/Garrison\s*\(\s*(\d+)\s*Infantry/i);
  const psMatch  = traitStr && traitStr.match(/Garrison\s*\(\s*(\d+)\s*Power Suit/i);
  const ulMatch  = traitStr && /UL HE-V Squadron/i.test(traitStr);

  if (!infMatch && !psMatch && !ulMatch) return null;

  const squads = infMatch ? INFANTRY_SQUADS : psMatch ? POWER_SUIT_SQUADS : null;
  const sharedTraits = infMatch ? INFANTRY_SHARED_TRAITS : psMatch ? POWER_SUIT_SHARED_TRAITS : null;
  const label = infMatch ? 'Infantry Squads' : psMatch ? 'Power Suit Squads' : 'UL HE-V Squadron';
  const maxCount = parseInt(infMatch?.[1] ?? psMatch?.[1] ?? '1', 10) * garrisonCount;

  // Count currently selected models
  const counts = (garrisonLoadout || []).reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
  const total = Object.values(counts).reduce((s, v) => s + v, 0);

  const add = (name) => {
    if (!onSetGarrisonLoadout || total >= maxCount) return;
    onSetGarrisonLoadout([...(garrisonLoadout || []), name]);
  };
  const remove = (name) => {
    if (!onSetGarrisonLoadout) return;
    const arr = [...(garrisonLoadout || [])];
    const idx = arr.lastIndexOf(name);
    if (idx >= 0) { arr.splice(idx, 1); onSetGarrisonLoadout(arr); }
  };

  const canAdd = onSetGarrisonLoadout && total < maxCount;

  return (
    <div style={{
      marginTop: 8, padding: '8px 10px',
      background: 'var(--bg)', border: '1px dashed var(--rule-strong)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="label" style={{ fontSize: 10 }}>
          GARRISON · {label.toUpperCase()}
          {ulMatch && ' — purchase separately as a Support Asset'}
        </span>
        {onSetGarrisonLoadout && (
          <span className="mono" style={{
            fontSize: 11, fontWeight: 700,
            color: total === maxCount ? 'var(--olive)' : total > 0 ? 'var(--rust)' : 'var(--mute)',
          }}>
            {total}/{maxCount}
          </span>
        )}
      </div>
      {squads && squads.map(sq => {
        const cnt = counts[sq.name] || 0;
        return (
          <div key={sq.name} style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            alignItems: 'center', gap: 8,
            borderTop: '1px solid var(--rule)', paddingTop: 5, marginTop: 5,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>{sq.name}</span>
                <span style={{ color: 'var(--mute)', fontSize: 10.5 }}>
                  SPD {sq.spd} · ARM {sq.arm} · STR {sq.str}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>{sq.weapons}</span>
              </div>
              {sq.traits && (
                <div style={{ fontSize: 11 }}>
                  <TraitList traits={sq.traits} />
                </div>
              )}
            </div>
            {onSetGarrisonLoadout && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => remove(sq.name)}
                  disabled={cnt === 0}
                  style={pickerBtn(cnt > 0, 'down')}
                  title={`Remove one ${sq.name}`}
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <span className="mono" style={{
                  fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center',
                  color: cnt > 0 ? 'var(--ink)' : 'var(--mute)',
                }}>{cnt}</span>
                <button
                  onClick={() => add(sq.name)}
                  disabled={!canAdd}
                  style={pickerBtn(!!canAdd, 'up')}
                  title={canAdd ? `Add one ${sq.name}` : `Garrison is full (${maxCount})`}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {sharedTraits && (
        <div style={{ fontSize: 10.5, color: 'var(--mute)', marginTop: 8, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>All: </span>
          <TraitList traits={sharedTraits} />
        </div>
      )}
    </div>
  );
}


// One-each picker: N independent slots, each picking exactly one option from the subunit list.
// Used for Infantry Outpost (2 bunkers, each picks 1 weapon).
function OneEachPicker({ asset: a, loadout, onChange }) {
  const slots = a.unitCount || 2;
  // loadout is [{slot, name}] or just names[] for backward compat
  const getSlot = (i) => {
    if (!loadout) return '';
    if (Array.isArray(loadout) && typeof loadout[0] === 'object') {
      return loadout.find(x => x.slot === i)?.name || '';
    }
    return loadout[i] || '';
  };
  const setSlot = (i, name) => {
    const next = Array.from({ length: slots }, (_, idx) => ({
      slot: idx, name: idx === i ? name : getSlot(idx),
    }));
    if (onChange) onChange(next.map(x => x.name));
  };
  return (
    <div style={{ border: '1px solid var(--rule)', marginTop: 6 }}>
      {Array.from({ length: slots }).map((_, i) => {
        const selected = getSlot(i);
        return (
          <div key={i} style={{
            padding: '10px 12px',
            borderBottom: i < slots - 1 ? '1px solid var(--rule)' : 'none',
          }}>
            <div style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 6, letterSpacing: '0.06em' }}>
              BUNKER {i + 1} WEAPON
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {a.subunits.map(su => {
                const isSel = selected === su.name;
                return (
                  <button
                    key={su.name}
                    onClick={() => onChange && setSlot(i, su.name)}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: 10,
                      padding: '6px 10px',
                      background: isSel ? 'var(--surface-2)' : 'transparent',
                      border: `1px solid ${isSel ? 'var(--rust)' : 'var(--rule)'}`,
                      cursor: onChange ? 'pointer' : 'default',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isSel ? 'var(--rust)' : 'var(--rule-strong)'}`,
                      background: isSel ? 'var(--rust)' : 'transparent',
                    }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{su.weapons}</span>
                    {su.traits && su.traits !== '—' && (
                      <span style={{ fontSize: 11, color: 'var(--mute)' }}>{su.traits}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubUnitPicker({ asset: a, loadout, onChange, garrisonLoadout, onSetGarrisonLoadout }) {
  // 'oneEach': each of unitCount slots picks exactly one subunit independently
  if (a.pickRule === 'oneEach') {
    return <OneEachPicker asset={a} loadout={loadout} onChange={onChange} />;
  }
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                      {su.name}
                    </span>
                    <span style={{
                      marginLeft: 8, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--mute)',
                    }}>
                      SPD {su.spd}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: '0.08em', marginBottom: 2 }}>ARM {su.arm}</div>
                      <MiniPips value={su.arm} kind="armor" />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--mute)', letterSpacing: '0.08em', marginBottom: 2 }}>STR {su.str}</div>
                      <MiniPips value={su.str} kind="structure" />
                    </div>
                  </div>
                </div>
                {/* Weapons with inline stats */}
                <div style={{ marginBottom: 4 }}>
                  {parseWeapons(su.weapons).map((wname, wi) => {
                    const wdef = findVehicleWeapon(wname);
                    return (
                      <div key={wi} style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>{wname}</span>
                        {wdef && (
                          <span style={{ fontSize: 11, color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span>DMG {wdef.dmg}</span>
                            <TraitList traits={wdef.traits} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Footnote: explain (X) = Models in unit, if any weapon uses it */}
                {parseWeapons(su.weapons).some(wname => {
                  const w = findVehicleWeapon(wname);
                  return w && /x\s*\(/i.test(w.dmg);
                }) && (
                  <div style={{ fontSize: 10.5, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 2 }}>
                    X = surviving Models in this unit
                  </div>
                )}
                {su.traits && su.traits !== '—' && (
                  <div style={{ fontSize: 11.5, color: 'var(--mute)', lineHeight: 1.5 }}>
                    <TraitList traits={su.traits} />
                  </div>
                )}
                <GarrisonRef
                  traitStr={su.traits}
                  garrisonLoadout={garrisonLoadout}
                  onSetGarrisonLoadout={onSetGarrisonLoadout}
                />
              </div>
              {onChange && (
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
              )}
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


const SUB_PERK_OPTIONS = {
  'Tech Pirates': {
    label: 'Choose R&D perk (Corporations)',
    options: ['Advanced Hardpoint Design', 'Advanced Energy Management Systems', 'Advanced Structural Components'],
  },
  'Disgraced Trillionaire': {
    label: 'Choose Deep War Chest perk (Corporations)',
    options: ['Top End Hardware', 'Outrageous Support Budget', 'Purchased Outcomes'],
  },
  'Political Extremists': {
    label: 'Choose Political Priority perk (Authorities)',
    options: ['Expansionist', 'Protectivist', 'Ideological'],
  },
  'Ex-Military Veterans': {
    label: 'Choose Military Training perk (Authorities) — applied at Deployment',
    options: ['Coordinated Assaults', 'Covered Advances', 'Elite Pilot Program'],
  },
};

// Which non-Freelancer faction does a sub-perk come from?
function getSubPerkFaction(name) {
  for (const factionKey of ['Corporations', 'Authorities']) {
    for (const opts of Object.values(FACTIONS[factionKey]?.perks || {})) {
      if (opts.find(o => o.name === name)) return factionKey;
    }
  }
  return null;
}

// Map of parent Freelancer perk → which non-Freelancer faction its sub-perk comes from
const GRANT_PERK_FACTION = {
  'Tech Pirates': 'Corporations',
  'Disgraced Trillionaire': 'Corporations',
  'Political Extremists': 'Authorities',
  'Ex-Military Veterans': 'Authorities',
};

// Look up a perk's description from Corporations or Authorities data.
function getSubPerkText(name) {
  for (const factionKey of ['Corporations', 'Authorities']) {
    for (const opts of Object.values(FACTIONS[factionKey]?.perks || {})) {
      const match = opts.find(o => o.name === name);
      if (match) return match.text;
    }
  }
  return null;
}

export function FactionPanel({ faction, perks, subPerkSelections = {}, onSetSubPerk, onSetFaction, onTogglePerk }) {
  const data = faction ? FACTIONS[faction] : null;

  return (
    <div>
      <SectionTitle tag={faction ? `${perks.length}/2 perks` : 'none'} action={faction ? <button onClick={() => onSetFaction(faction)} style={{ fontSize: 11, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', padding: '0 2px' }} title='Clear faction'>✕ clear</button> : null}>Faction</SectionTitle>

      <div className="faction-tiles">
        {Object.keys(FACTIONS).map(f => {
          const cls = `faction-tile faction-tile-${f.toLowerCase()} ${faction === f ? 'is-active' : ''}`;
          return (
            <button
              key={f}
              onClick={() => onSetFaction(f)}
              className={cls}
              title={`${FACTIONS[f].blurb}\n\nExamples: ${FACTIONS[f].examples || ''}${FACTIONS[f].perkNote ? '\n\n' + FACTIONS[f].perkNote : ''}`}
              style={{
                '--faction-hover-bg': `url("${asset(FACTION_HOVER_LOGO[f])}")`,
              }}
            >
              <span className="faction-tile-name">{f}</span>
            </button>
          );
        })}
      </div>

      {data && (
        <>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 4px' }}>
            {data.blurb}
          </p>
          {data.examples && (
            <p style={{ fontSize: 12, color: 'var(--mute)', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.4 }}>
              {data.examples}
            </p>
          )}
          {data.perkNote && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--rule)',
              padding: '8px 12px', marginBottom: 14, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5,
            }}>
              {data.perkNote}
            </div>
          )}
          {data.agenda && (() => {
            const raw = data.agenda;
            const colon = raw.indexOf(':');
            const agendaName = colon > -1 ? raw.slice(0, colon).trim() : null;
            const agendaBody = colon > -1 ? raw.slice(colon + 1).trim() : raw;
            return (
              <div style={{
                background: 'var(--surface)',
                borderLeft: '3px solid var(--steel)',
                padding: '10px 14px',
                marginBottom: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mute)', flexShrink: 0 }}>
                    Agenda
                  </div>
                  {agendaName && (
                    <div style={{ fontSize: 11.5, color: 'var(--mute)', fontStyle: 'italic' }}>
                      {agendaName}
                    </div>
                  )}
                </div>
                <RulesText text={agendaBody} size={13} />
              </div>
            );
          })()}
          {/* Logo upload moved to Options. */}

          <div style={{ marginBottom: 12 }}>
            <span className="stencil" style={{ fontSize: 13, letterSpacing: '0.12em', color: 'var(--ink)' }}>Perks</span>
            <span style={{ fontSize: 11.5, color: 'var(--mute)', marginLeft: 8 }}>pick 2 max, 1 per group</span>
          </div>
          {Object.entries(data.perks).map(([group, opts]) => {
            const inGroup = opts.find(o => perks.includes(o.name));
            return (
              <div key={group} style={{ marginBottom: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mute)', flexShrink: 0 }}>
                    {group}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
                </div>
                {opts.map(o => {
                  const eq = perks.includes(o.name);
                  const blocked = !eq && !inGroup && perks.length >= 2;
                  return (
                    <React.Fragment key={o.name}>
                    <button
                      onClick={() => !blocked && onTogglePerk(o.name)}
                      disabled={blocked}
                      title={blocked ? 'You already picked 2 perks. Remove one first.' : undefined}
                      className="add-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        width: '100%', textAlign: 'left',
                        padding: '8px 10px',
                        marginBottom: 4,
                        background: eq ? 'var(--surface)' : 'transparent',
                        border: `1.5px solid ${eq ? 'var(--rust)' : 'var(--rule)'}`,
                        borderRadius: 3,
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        opacity: blocked ? 0.4 : 1,
                        transition: 'border-color 120ms, background 120ms',
                      }}
                    >
                      {/* Radio dot */}
                      <span style={{
                        marginTop: 3, width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${eq ? 'var(--rust)' : 'var(--rule-strong)'}`,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 120ms',
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: 'var(--rust)',
                          transform: eq ? 'scale(1)' : 'scale(0)',
                          opacity: eq ? 1 : 0,
                          transition: 'transform 120ms, opacity 120ms',
                          display: 'block',
                        }} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{o.name}</div>
                        <div style={{ marginTop: 2 }}><RulesText text={o.text} size={12} /></div>
                      </div>
                    </button>
                    {/* Sub-perk selector for Tech Pirates / Disgraced Trillionaire */}
                    {eq && SUB_PERK_OPTIONS[o.name] && (
                      <div style={{ margin: '4px 10px 8px 34px', padding: '8px 10px', background: 'var(--surface-2)', border: '1px solid var(--rule)', borderRadius: 2 }}>
                        <div style={{ fontSize: 11, color: 'var(--mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 6 }}>
                          {SUB_PERK_OPTIONS[o.name].label}
                        </div>
                        {SUB_PERK_OPTIONS[o.name].options.map(sub => {
                          const active = subPerkSelections[o.name] === sub;
                          const subText = getSubPerkText(sub);
                          const thisFaction = GRANT_PERK_FACTION[o.name];
                          const conflictingGrant = thisFaction && Object.entries(GRANT_PERK_FACTION)
                            .find(([grantPerk, grantFaction]) =>
                              grantFaction === thisFaction &&
                              grantPerk !== o.name &&
                              subPerkSelections[grantPerk]
                            );
                          const wouldConflict = !active && !!conflictingGrant;
                          return (
                            <button
                              key={sub}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (wouldConflict) {
                                  alert(`Freelancers may never select two Perks from the same Faction. You already have a ${thisFaction} perk from ${conflictingGrant[0]}.`);
                                  return;
                                }
                                onSetSubPerk(o.name, active ? null : sub);
                              }}
                              className="add-btn"
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8,
                                width: '100%', textAlign: 'left', padding: '6px 8px',
                                background: active ? 'rgba(255,255,255,0.5)' : 'transparent',
                                border: `1px solid ${active ? 'var(--olive)' : 'transparent'}`,
                                borderRadius: 2,
                                cursor: wouldConflict ? 'not-allowed' : 'pointer', marginBottom: 3,
                                opacity: wouldConflict ? 0.45 : 1,
                                transition: 'background 100ms, border-color 100ms',
                              }}
                            >
                              <span style={{
                                marginTop: 3, width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                border: `2px solid ${active ? 'var(--olive)' : 'var(--rule-strong)'}`,
                                background: active ? 'var(--olive)' : 'transparent',
                              }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: active ? 700 : 500 }}>{sub}</div>
                                {subText && (
                                  <div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 2, lineHeight: 1.5 }}>
                                    {subText}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    </React.Fragment>
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

// ============================================================
// AGENDAS PANEL
// ============================================================

function AgendaCard({ name, tag, text, req, qualified, dimReason }) {
  const [open, setOpen] = useState(true);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderBottom: '1px solid var(--rule)',
        padding: '10px 14px',
        cursor: 'pointer',
        opacity: qualified ? 1 : 0.4,
        background: qualified ? 'var(--surface)' : 'var(--surface-2)',
        transition: 'opacity 150ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className="stencil"
          style={{
            fontSize: 11, letterSpacing: '0.1em',
            padding: '1px 5px', borderRadius: 1,
            background: qualified ? 'var(--rust)' : 'var(--rule-strong)',
            color: qualified ? 'var(--surface)' : 'var(--ink)',
            flexShrink: 0, textTransform: 'uppercase',
          }}
        >
          {tag}
        </span>
        <span style={{ fontFamily: 'var(--font-stencil)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
          {name}
        </span>
        <span style={{ fontSize: 11, color: 'var(--mute)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          {req && (
            <div style={{ marginBottom: 6, color: 'var(--mute)', fontSize: 11 }}>
              <strong style={{ color: 'var(--ink)', letterSpacing: '0.06em' }}>REQUIRES: </strong>{req}
            </div>
          )}
          {!qualified && dimReason && (
            <div style={{ marginBottom: 6, fontStyle: 'italic', color: 'var(--rust)', fontSize: 11 }}>
              {dimReason}
            </div>
          )}
          <div style={{ marginTop: 4 }}><RulesText text={text} size={13} /></div>
        </div>
      )}
    </div>
  );
}

export function AgendasPanel({ mechs, faction, selectedTeams, supportAssets }) {
  const lightCount   = mechs.filter(m => m.weightClass === 'Light').length;
  const mediumCount  = mechs.filter(m => m.weightClass === 'Medium').length;
  const heavyCount   = mechs.filter(m => m.weightClass === 'Heavy').length;

  // Build the full agenda list with qualified flag
  const allAgendas = [];

  // 1. Faction agenda
  if (faction) {
    const fdata = FACTIONS[faction];
    const raw = fdata?.agenda || '';
    const colonIdx = raw.indexOf(':');
    const agendaName = colonIdx > -1 ? raw.slice(0, colonIdx).trim() : `${faction} Agenda`;
    const agendaText = colonIdx > -1 ? raw.slice(colonIdx + 1).trim() : raw;
    allAgendas.push({
      name: agendaName,
      tag: faction,
      text: agendaText,
      req: null,
      qualified: true,
      dimReason: null,
      sortKey: 0,
    });
  } else {
    allAgendas.push({
      name: 'Faction Agenda',
      tag: 'Faction',
      text: 'Pick a faction to unlock your faction agenda.',
      req: 'Select a faction.',
      qualified: false,
      dimReason: 'No faction selected.',
      sortKey: 1,
    });
  }

  // 2. Universal agendas
  const universalQual = {
    'Stalkers':     { ok: lightCount  >= 2, reason: `Requires 2+ Light HE-Vs (have ${lightCount}).`  },
    'Brawlers':     { ok: mediumCount >= 2, reason: `Requires 2+ Medium HE-Vs (have ${mediumCount}).` },
    'Enforcers':    { ok: heavyCount  >= 2, reason: `Requires 2+ Heavy HE-Vs (have ${heavyCount}).`  },
    'Titan-Killers':{ ok: null,            reason: 'Depends on opponent\'s force — check before the game.' },
  };
  UNIVERSAL_AGENDAS.forEach(a => {
    const q = universalQual[a.name];
    const qualified = q?.ok === null ? true : (q?.ok ?? false);
    allAgendas.push({
      name: a.name,
      tag: 'Universal',
      text: a.text,
      req: a.req,
      qualified,
      dimReason: qualified ? null : q?.reason,
      sortKey: qualified ? 0 : 1,
    });
  });

  // 3. Team agendas — selected teams first, then the rest
  TEAMS.forEach(t => {
    if (!t.agenda) return;
    const inTeam = selectedTeams.includes(t.name);
    const tRaw = t.agenda || '';
    const tColon = tRaw.indexOf(':');
    const tAgendaName = tColon > -1 ? tRaw.slice(0, tColon).trim() : t.name.replace(' Team', '');
    const tAgendaText = tColon > -1 ? tRaw.slice(tColon + 1).trim() : tRaw;
    allAgendas.push({
      name: tAgendaName,
      tag: 'Team',
      text: tAgendaText,
      req: `Requires ${t.name} in your force.`,
      qualified: inTeam,
      dimReason: inTeam ? null : `${t.name} not in your force.`,
      sortKey: inTeam ? 0 : 1,
    });
  });

  const qualified   = allAgendas.filter(a => a.qualified);
  const unqualified = allAgendas.filter(a => !a.qualified);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ padding: '12px 14px 6px', borderBottom: '2px solid var(--ink)' }}>
        <h2 style={{ fontFamily: 'var(--font-stencil)', fontSize: 19, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          Agendas
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--mute)', fontFamily: 'var(--font-mono)' }}>
          {qualified.length} / {allAgendas.length} available
        </p>
      </div>

      {qualified.length > 0 && (
        <div>
          {qualified.map(a => (
            <AgendaCard key={a.name + a.tag} {...a} />
          ))}
        </div>
      )}

      {unqualified.length > 0 && (
        <div style={{ borderTop: unqualified.length && qualified.length ? '2px solid var(--rule)' : 'none' }}>
          <div style={{ padding: '6px 14px 4px', fontSize: 10, color: 'var(--mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Not available with current force
          </div>
          {unqualified.map(a => (
            <AgendaCard key={a.name + a.tag} {...a} />
          ))}
        </div>
      )}
    </div>
  );
}
