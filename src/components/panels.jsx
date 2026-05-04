import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { OFF_TABLE_ASSETS, ADVANCED_ASSETS, FACTIONS, TEAMS } from '../data';
import { checkTeamEligibility, slotsForBand, findAsset } from '../calc';
import { SectionTitle, Chip, TextButton, TraitList, RowExpand, InlineTraitGlossary, collectTraits } from './ui';
import { Tooltip } from './tooltip';

// Resolve absolute asset path through Vite's base
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

// Map team name to its silhouette icon. Icons live in /public/icons/.
const TEAM_ICONS = {
  'Reconnaissance Team':    'icons/team-recon.svg',
  'Security Team':          'icons/team-security.svg',
  'Assassination Team':     'icons/team-assassination.svg',
  'Berserker Team':         'icons/team-berserker.svg',
  'Multirole Team':         'icons/team-multirole.svg',
  'Gunslinger Team':        'icons/team-gunslinger.svg',
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

export function TeamPanel({ mechs, selectedTeams, onToggleTeam, mission }) {
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
            />
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({ team, eligible, minSize, canAssign, slotLeft, selected, onToggle, perReq }) {
  const [open, setOpen] = useState(false);

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
    <div style={{
      borderTop: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
      marginBottom: -1,
      background: selected ? 'var(--surface)' : 'transparent',
    }}>
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
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{team.blurb}</div>
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
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>{team.benefits}</div>
          <div style={{ marginTop: 10 }}><span className="label">Team Agenda</span></div>
          <div style={{ fontSize: 13, color: 'var(--steel)', lineHeight: 1.6, marginTop: 4 }}>{team.agenda}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUPPORT DETAIL VIEW
// Right-pane content when a support asset is added or clicked.
// Shows everything: full description, statline as a table, and an
// inline glossary of any traits referenced.
// ============================================================

export function SupportDetailView({ assetName }) {
  const a = findAsset(assetName);
  if (!a) return null;
  const traitNames = collectTraits(a.stats?.Traits || '');

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="stencil" style={{
        fontSize: 12, color: 'var(--rust)', letterSpacing: '0.22em', marginBottom: 6,
      }}>
        SUPPORT ASSET · {a.kind.toUpperCase()}
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32, fontWeight: 700, letterSpacing: '0.03em',
        textTransform: 'uppercase', margin: '0 0 12px',
        lineHeight: 1.05,
      }}>
        {a.name}
      </h1>
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

      <div className="label" style={{ marginBottom: 6 }}>Rules</div>
      <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 18 }}>
        {a.fullDesc}
      </div>

      {a.stats && (
        <>
          <div className="label" style={{ marginBottom: 6 }}>Statline</div>
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

export function FactionPanel({ faction, perks, onSetFaction, onTogglePerk }) {
  const data = faction ? FACTIONS[faction] : null;

  return (
    <div>
      <SectionTitle tag={faction ? `${perks.length}/2 perks` : 'none'}>Faction</SectionTitle>

      <div className="faction-tiles">
        {Object.keys(FACTIONS).map(f => (
          <button
            key={f}
            onClick={() => onSetFaction(f)}
            className={`faction-tile add-btn ${faction === f ? 'is-active' : ''}`}
          >
            <span className="faction-tile-name">{f}</span>
            <span className="faction-tile-blurb">{FACTIONS[f].blurb.split('.')[0]}.</span>
          </button>
        ))}
      </div>
      {faction && (
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <TextButton onClick={() => onSetFaction(null)}>clear faction</TextButton>
        </div>
      )}

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
