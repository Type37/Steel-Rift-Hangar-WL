import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Check, BookOpen } from 'lucide-react';
import { OFF_TABLE_ASSETS, ADVANCED_ASSETS, FACTIONS, TEAMS } from '../data';
import { checkTeamEligibility, slotsForBand, findAsset } from '../calc';
import { defineToken } from '../glossary';
import { SectionTitle, Chip, TextButton, TraitList } from './ui';

// ============================================================
// SUPPORT PANEL — expandable rows, mission-aware limit surfaced
// ============================================================

export function SupportPanel({ selected, onToggle, limit, activeToken, onToken }) {
  const all = [...OFF_TABLE_ASSETS, ...ADVANCED_ASSETS];
  const [expanded, setExpanded] = useState({});
  const tag = `${selected.length}/${limit} taken`;

  return (
    <div>
      <SectionTitle tag={tag}>Support Assets</SectionTitle>

      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 12, lineHeight: 1.5 }}>
        Each Asset may be included in your force only once. Off-Table assets need a friendly Unit
        with a <em>Target Designator Marker</em> to call them in.
      </div>

      {/* Group: Off-Table */}
      <SubHeader>Off-Table</SubHeader>
      <div style={{ borderTop: '1.5px solid var(--ink)', borderBottom: '1.5px solid var(--ink)', marginBottom: 16 }}>
        {OFF_TABLE_ASSETS.map(a => (
          <SupportRow key={a.name} a={a} eq={selected.includes(a.name)}
            atLimit={selected.length >= limit && !selected.includes(a.name)}
            onToggle={onToggle}
            expanded={expanded[a.name]} onExpand={() => setExpanded(s => ({ ...s, [a.name]: !s[a.name] }))}
            activeToken={activeToken} onToken={onToken} />
        ))}
      </div>

      <SubHeader>Advanced (Vehicles / Air / Garrisons)</SubHeader>
      <div style={{ borderTop: '1.5px solid var(--ink)', borderBottom: '1.5px solid var(--ink)' }}>
        {ADVANCED_ASSETS.map(a => (
          <SupportRow key={a.name} a={a} eq={selected.includes(a.name)}
            atLimit={selected.length >= limit && !selected.includes(a.name)}
            onToggle={onToggle}
            expanded={expanded[a.name]} onExpand={() => setExpanded(s => ({ ...s, [a.name]: !s[a.name] }))}
            activeToken={activeToken} onToken={onToken} />
        ))}
      </div>
    </div>
  );
}

function SubHeader({ children }) {
  return (
    <div className="display" style={{
      fontSize: 11, letterSpacing: '0.18em', color: 'var(--mute)',
      marginTop: 14, marginBottom: 4,
    }}>
      ─ {children}
    </div>
  );
}

function SupportRow({ a, eq, atLimit, onToggle, expanded, onExpand, activeToken, onToken }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--rule)',
      background: eq ? 'var(--surface)' : 'transparent',
      opacity: atLimit ? 0.45 : 1,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto', alignItems: 'center', gap: 12,
        padding: '10px 12px',
      }}>
        <button onClick={onExpand} aria-label="Expand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--mute)' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="display" style={{
          fontSize: 10, padding: '2px 6px', border: '1.5px solid var(--steel)',
          color: 'var(--steel)', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          {a.kind}
        </span>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{a.name}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--rust)', fontWeight: 700 }}>{a.cost}t</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2 }}>
            {a.summary}
          </div>
        </div>
        <span />
        <button
          onClick={() => onToggle(a.name)}
          disabled={atLimit}
          style={{
            border: `1.5px solid ${eq ? 'var(--rust)' : (atLimit ? 'var(--rule)' : 'var(--olive)')}`,
            background: eq ? 'transparent' : (atLimit ? 'var(--bg-deep)' : 'var(--olive)'),
            color: eq ? 'var(--rust)' : (atLimit ? 'var(--mute)' : 'var(--surface)'),
            padding: '6px 14px', cursor: atLimit ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}
        >
          {eq ? 'Remove' : 'Add'}
        </button>
      </div>
      {expanded && (
        <div style={{
          padding: '4px 14px 14px 36px',
          background: 'var(--bg-deep)',
          borderTop: '1px dashed var(--rule)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 8 }}>
            {a.fullDesc}
          </div>
          {a.stats && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4,
              fontSize: 12,
            }}>
              {Object.entries(a.stats).map(([k, v]) => (
                <React.Fragment key={k}>
                  <div className="label" style={{ fontSize: 10 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>
                    {/* Try to render traits in v as clickable tokens if it looks trait-y */}
                    {/Trait/i.test(k) ? <TraitList traits={v} activeToken={activeToken} onToken={onToken} /> : v}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TEAMS PANEL — surfaces the mission's team-band slot limits
// ============================================================

export function TeamPanel({ mechs, selectedTeams, onToggleTeam, mission }) {
  const slotsRemaining = slotsForBand(mission, selectedTeams, TEAMS);
  const results = TEAMS.map(t => ({ t, ...checkTeamEligibility(t, mechs) }));

  return (
    <div>
      <SectionTitle tag={`${selectedTeams.length} active`}>HE-V Teams</SectionTitle>

      {/* Mission slot summary — surfaced loudly */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
        background: 'var(--ink)', padding: 4, marginBottom: 14,
      }}>
        {[
          { label: 'Teams of 2', key: '2' },
          { label: 'Teams of 2-3', key: '2-3' },
          { label: 'Teams of 3-4', key: '3-4' },
        ].map(b => {
          const total = mission.teamCounts[b.key];
          const left = slotsRemaining[b.key];
          const used = total - left;
          return (
            <div key={b.key} style={{
              background: total > 0 ? 'var(--surface)' : 'var(--bg-deep)',
              padding: '10px 8px', textAlign: 'center',
              opacity: total === 0 ? 0.4 : 1,
            }}>
              <div className="label" style={{ fontSize: 9.5, marginBottom: 2 }}>{b.label}</div>
              <div className="mono" style={{
                fontSize: 18, fontWeight: 700,
                color: total === 0 ? 'var(--mute)' : (left === 0 ? 'var(--rust)' : 'var(--ink)'),
              }}>
                {used}/{total}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 10, lineHeight: 1.5 }}>
        Eligibility checks weight class, required upgrades, and weapon constraints from the rules. The team grants its benefits only when 2+ HE-Vs meet its requirements.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {results.map(({ t, eligible, minsMet, perReq }) => {
          const sel = selectedTeams.includes(t.name);
          const ready = minsMet && eligible >= 2;
          const slotLeft = slotsRemaining[t.band] > 0 || sel;
          return (
            <TeamRow key={t.name} team={t} eligible={eligible} ready={ready}
              selected={sel} canTake={ready && slotLeft}
              onToggle={onToggleTeam} perReq={perReq} />
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({ team, eligible, ready, selected, canTake, onToggle, perReq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderTop: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
      marginBottom: -1,
      background: selected ? 'var(--surface)' : 'transparent',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 12,
        padding: '10px 12px',
      }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)', padding: 4 }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span className="display" style={{ fontSize: 13, letterSpacing: '0.12em' }}>{team.name}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--mute)' }}>band: {team.band}</span>
            {ready ? (
              <span className="mono" style={{
                fontSize: 10, color: 'var(--olive)', fontWeight: 700,
                border: '1px solid var(--olive)', padding: '1px 5px',
              }}>
                ✓ {eligible} ELIGIBLE
              </span>
            ) : (
              <span className="mono" style={{
                fontSize: 10, color: 'var(--mute)',
                border: '1px dashed var(--rule)', padding: '1px 5px',
              }}>
                {eligible} eligible
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2 }}>{team.blurb}</div>
        </div>
        <span />
        <button
          onClick={() => onToggle(team.name)}
          disabled={!canTake && !selected}
          style={{
            border: `1.5px solid ${selected ? 'var(--rust)' : (canTake ? 'var(--olive)' : 'var(--rule)')}`,
            background: selected ? 'transparent' : (canTake ? 'var(--olive)' : 'var(--bg-deep)'),
            color: selected ? 'var(--rust)' : (canTake ? 'var(--surface)' : 'var(--mute)'),
            padding: '5px 12px', cursor: canTake || selected ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}
        >
          {selected ? 'Remove' : 'Take'}
        </button>
      </div>
      {open && (
        <div style={{ padding: '0 14px 14px 36px', background: 'var(--bg-deep)', borderTop: '1px dashed var(--rule)' }}>
          <div style={{ marginTop: 10 }}>
            <span className="label">Requirements</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>
            {team.req.map((r, i) => {
              const matchCount = perReq[i]?.total ?? 0;
              const met = matchCount >= r.min;
              return (
                <div key={i} style={{
                  borderLeft: `3px solid ${met ? 'var(--olive)' : 'var(--rule-strong)'}`,
                  paddingLeft: 10, marginBottom: 6,
                }}>
                  <span className="mono" style={{ fontSize: 11.5, color: met ? 'var(--olive)' : 'var(--mute)', fontWeight: 700 }}>
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
          <div style={{ marginTop: 10 }}>
            <span className="label">Benefits</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>{team.benefits}</div>
          <div style={{ marginTop: 10 }}>
            <span className="label">Team Agenda</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--steel)', lineHeight: 1.6, marginTop: 4 }}>{team.agenda}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FACTION PANEL
// ============================================================

export function FactionPanel({ faction, perks, onSetFaction, onTogglePerk }) {
  const data = faction ? FACTIONS[faction] : null;
  return (
    <div>
      <SectionTitle tag={faction ? `${perks.length}/2 perks` : 'none'}>Faction</SectionTitle>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.keys(FACTIONS).map(f => (
          <Chip key={f} active={faction === f} onClick={() => onSetFaction(f)} accent="steel">
            {f}
          </Chip>
        ))}
        {faction && <TextButton onClick={() => onSetFaction(null)}>clear</TextButton>}
      </div>

      {data && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 12px' }}>
            {data.blurb}
          </p>
          <div style={{
            background: 'var(--surface)',
            borderLeft: '3px solid var(--steel)',
            padding: '10px 12px',
            marginBottom: 18,
          }}>
            <div className="label" style={{ marginBottom: 4 }}>Faction Agenda</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.5 }}>
              {data.agenda}
            </div>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>Perks (pick 2, max 1 per group)</div>
          {Object.entries(data.perks).map(([group, opts]) => {
            const inGroup = opts.find(o => perks.includes(o.name));
            return (
              <div key={group} style={{ marginBottom: 14 }}>
                <div className="display" style={{
                  fontSize: 11, letterSpacing: '0.18em', color: 'var(--mute)',
                  paddingBottom: 2, borderBottom: '1px dotted var(--rule)', marginBottom: 6,
                }}>
                  ─ {group}
                </div>
                {opts.map(o => {
                  const eq = perks.includes(o.name);
                  const blocked = !eq && (inGroup || perks.length >= 2);
                  return (
                    <button
                      key={o.name}
                      onClick={() => !blocked && onTogglePerk(o.name)}
                      disabled={blocked}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 10, alignItems: 'flex-start',
                        background: eq ? 'var(--surface)' : 'transparent',
                        border: 'none',
                        padding: '6px 8px',
                        width: '100%', textAlign: 'left',
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        opacity: blocked ? 0.45 : 1,
                        marginBottom: 2,
                      }}
                    >
                      <span style={{
                        marginTop: 2, width: 16, height: 16,
                        border: '1.5px solid var(--ink)',
                        background: eq ? 'var(--ink)' : 'transparent',
                        color: 'var(--surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {eq && <Check size={11} strokeWidth={3} />}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{o.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 2 }}>
                          {o.text}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GLOSSARY PANEL — uses dead space at the bottom for trait definitions
// ============================================================

export function GlossaryPanel({ activeToken, onClear }) {
  const def = activeToken ? defineToken(activeToken) : null;

  return (
    <div style={{
      background: 'var(--ink)',
      color: 'var(--surface)',
      padding: '12px 18px',
      borderBottom: '2px solid var(--rust)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <BookOpen size={16} strokeWidth={2.25} style={{ flexShrink: 0, opacity: 0.7 }} />
      {def ? (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{
              fontSize: 12, letterSpacing: '0.2em', color: 'var(--rust)', marginBottom: 2,
            }}>
              {def.title}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, opacity: 0.92 }}>
              {def.text}
            </div>
          </div>
          <button onClick={onClear} style={{
            background: 'transparent', border: '1px solid rgba(241,234,218,0.4)',
            color: 'var(--surface)', padding: '4px 8px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            Close
          </button>
        </>
      ) : (
        <div style={{ flex: 1 }}>
          <span className="display" style={{
            fontSize: 11, letterSpacing: '0.2em', color: 'rgba(241,234,218,0.55)',
          }}>
            Glossary
          </span>
          <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 12 }}>
            click any underlined trait to surface its definition here
          </span>
        </div>
      )}
    </div>
  );
}
