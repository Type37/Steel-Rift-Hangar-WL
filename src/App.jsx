import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TEAMS, MISSIONS, MISSION_ORDER, FACTION_LOGOS } from './data';
import { POOL_NAMES } from './callsigns';
import { calcMech, newMech, findAsset } from './calc';

import { Navbar, BottomBar, MechCard, EmptyRoster, SupportRosterCard } from './components/chrome';
import { MechEditor } from './components/editor';
import { SupportPanel, TeamPanel, FactionPanel, SupportDetailView } from './components/panels';
import { AddMechModal, OptionsModal, ListsModal } from './components/modals';
import { PrintView } from './components/print';
import { SectionTitle, GhostButton } from './components/ui';

// localStorage key and helpers. Bump the version if the schema changes
// in a non-backward-compatible way.
const STATE_KEY = 'forge-state-v1';
function loadStored() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
const stored = loadStored();

export default function App() {
  // ---- State ----
  const [forceName, setForceName] = useState(stored.forceName ?? '');
  const [mission, setMission] = useState(stored.mission ?? 'Strike');
  const [customTons, setCustomTons] = useState(stored.customTons ?? 150);

  const [faction, setFaction] = useState(stored.faction ?? null);
  const [perks, setPerks] = useState(stored.perks ?? []);
  const [factionLogo, setFactionLogo] = useState(stored.factionLogo ?? null);

  const [mechs, setMechs] = useState(stored.mechs ?? []);
  const [supportAssets, setSupportAssets] = useState(stored.supportAssets ?? []);
  const [selectedTeams, setSelectedTeams] = useState(stored.selectedTeams ?? []);
  const [selectedMechId, setSelectedMechId] = useState(null);
  // When the user adds or clicks a support asset, it gets shown in the
  // right pane with full details. Lives in memory only (not persisted).
  const [selectedSupportName, setSelectedSupportName] = useState(null);

  const [callsignPools, setCallsignPools] = useState(stored.callsignPools ?? [...POOL_NAMES, 'Custom']);
  const [customCallsigns, setCustomCallsigns] = useState(stored.customCallsigns ?? []);
  // Per-asset nicknames so the user can rename their support units.
  const [supportNicknames, setSupportNicknames] = useState(stored.supportNicknames ?? {});
  // Per-asset sub-unit picks. Shape: { 'LAS-Wing Attack Squadron': ['Strike LAS Wing', 'Strike LAS Wing', 'Reconnaissance and Disruption LAS Wing', 'Strike LAS Wing'], ... }
  // Each entry is the list of sub-unit names the user picked, in order.
  const [supportLoadouts, setSupportLoadouts] = useState(stored.supportLoadouts ?? {});
  // Per-team unit assignments. Shape: { 'Reconnaissance Team': ['mech_id_1', 'support:LAS-Wing Attack Squadron', ...], ... }
  // Drag a unit from the left onto a team row in the right pane to assign.
  const [teamAssignments, setTeamAssignments] = useState(stored.teamAssignments ?? {});

  const [simpleMode, setSimpleMode] = useState(stored.simpleMode ?? false);

  const [addMechOpen, setAddMechOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);

  const [sideTab, setSideTab] = useState('roster');

  // Persist any state change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify({
        forceName, mission, customTons,
        faction, perks, factionLogo,
        mechs, supportAssets, selectedTeams,
        callsignPools, customCallsigns, supportNicknames, supportLoadouts,
        teamAssignments,
        simpleMode,
      }));
    } catch (e) {
      console.warn('Could not persist state:', e?.message || e);
    }
  }, [
    forceName, mission, customTons,
    faction, perks, factionLogo,
    mechs, supportAssets, selectedTeams,
    callsignPools, customCallsigns, supportNicknames, supportLoadouts,
    teamAssignments,
    simpleMode,
  ]);

  // Rename a support asset. Empty string clears the nickname.
  const renameSupport = (assetName, nickname) => {
    setSupportNicknames(prev => {
      const next = { ...prev };
      const trimmed = (nickname || '').trim();
      if (trimmed) next[assetName] = trimmed;
      else delete next[assetName];
      return next;
    });
  };

  // Set the sub-unit loadout for a support asset (e.g. which 4 LAS-Wings).
  const setSupportLoadout = (assetName, loadout) => {
    setSupportLoadouts(prev => ({ ...prev, [assetName]: loadout }));
  };

  // Assign a unit (HE-V or support asset) to a team. Each unit can only be
  // in one team at a time; this method moves the unit if needed.
  const assignToTeam = (teamName, unitId) => {
    setTeamAssignments(prev => {
      const next = {};
      for (const [t, ids] of Object.entries(prev)) {
        next[t] = ids.filter(id => id !== unitId);
      }
      next[teamName] = [...(next[teamName] || []), unitId];
      // Drop any team that ended up empty.
      for (const t of Object.keys(next)) if (next[t].length === 0) delete next[t];
      return next;
    });
  };
  // Remove a unit from any team it's in.
  const unassignFromTeams = (unitId) => {
    setTeamAssignments(prev => {
      const next = {};
      for (const [t, ids] of Object.entries(prev)) {
        const filtered = ids.filter(id => id !== unitId);
        if (filtered.length > 0) next[t] = filtered;
      }
      return next;
    });
  };
  // Clear a team's roster entirely.
  const clearTeamAssignments = (teamName) => {
    setTeamAssignments(prev => {
      if (!prev[teamName]) return prev;
      const next = { ...prev };
      delete next[teamName];
      return next;
    });
  };

  // Auto-scroll to editor pane on phones when picking a mech.
  const editorRef = useRef(null);
  useEffect(() => {
    if (selectedMechId && editorRef.current && window.matchMedia('(max-width: 760px)').matches) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedMechId]);

  // ---- Derived ----
  const selectedMech = mechs.find(m => m.id === selectedMechId) || null;
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const supportLimit = useCustom ? Math.max(1, Math.floor(customTons / 50)) : MISSIONS[mission].support;
  const totalTons = useMemo(
    () =>
      mechs.reduce((s, m) => s + calcMech(m).totalUsed, 0) +
      supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0),
    [mechs, supportAssets]
  );

  const missionObj = useCustom
    ? { ...MISSIONS['Battle'], teamCounts: { '2': 1, '2-3': 2, '3-4': 2 } }
    : MISSIONS[mission];
  const teamMax = Object.values(missionObj.teamCounts).reduce((a, b) => a + b, 0);

  // Reverse index: unitId -> teamName, so left-sidebar cards can show
  // which team they're currently assigned to.
  const assignmentLookup = useMemo(() => {
    const map = {};
    for (const [team, ids] of Object.entries(teamAssignments)) {
      for (const id of ids) map[id] = team;
    }
    return map;
  }, [teamAssignments]);

  // ---- Handlers ----
  const handleConfirmAddMech = ({ name, description, cls }) => {
    const m = newMech(cls, name, description);
    setMechs(prev => [...prev, m]);
    setSelectedMechId(m.id);
    setSideTab('roster');
    setAddMechOpen(false);
  };

  const handleUpdateMech = (updated) => {
    setMechs(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMech = (id) => {
    setMechs(prev => prev.filter(m => m.id !== id));
    if (selectedMechId === id) setSelectedMechId(null);
    unassignFromTeams(`hev:${id}`);
  };

  const toggleSupport = (name) => {
    setSupportAssets(prev => {
      const has = prev.includes(name);
      const next = has ? prev.filter(n => n !== name) : [...prev, name];
      if (!has) {
        setSelectedSupportName(name);
        setSelectedMechId(null);
        const a = findAsset(name);
        if (a?.subunits && a?.unitCount && !supportLoadouts[name]) {
          // Start empty so the user can assemble the squadron deliberately;
          // the + buttons remain enabled until target is reached.
          setSupportLoadouts(prev => ({
            ...prev,
            [name]: [],
          }));
        }
      } else if (selectedSupportName === name) {
        setSelectedSupportName(null);
      }
      return next;
    });
    if (supportAssets.includes(name)) {
      setSupportNicknames(prev => {
        if (!prev[name]) return prev;
        const next = { ...prev }; delete next[name]; return next;
      });
      setSupportLoadouts(prev => {
        if (!prev[name]) return prev;
        const next = { ...prev }; delete next[name]; return next;
      });
      unassignFromTeams(`support:${name}`);
    }
  };


  // Fade out the HTML loading screen once React is mounted.
  useEffect(() => {
    const el = document.getElementById('loading-screen');
    if (el) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.4s ease';
      setTimeout(() => el.remove(), 450);
    }
  }, []);
  const toggleTeam = (name) =>
    setSelectedTeams(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const handleSetFaction = (f) => { setFaction(f); setPerks([]); };

  const togglePerk = (name) =>
    setPerks(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);

  const handleAddSupport = () => {
    setSelectedMechId(null);
    setSideTab('support');
  };

  // ---- Render ----
  return (
    <>
      <PrintView
        forceName={forceName} mission={mission} customTons={customTons}
        mechs={mechs} supportAssets={supportAssets}
        faction={faction} perks={perks} selectedTeams={selectedTeams}
        simpleMode={simpleMode}
        factionLogo={factionLogo}
        supportNicknames={supportNicknames}
        supportLoadouts={supportLoadouts}
      />

      <div className="app-shell no-print">
        <Navbar />

        {/* Two-column layout. Left = your force (static summary).
            Right = workshop with always-visible tabs for picking/customizing. */}
        <div className="layout">
          <aside className="sidebar scroll" style={{
            background: 'var(--bg)',
            borderRight: '1.5px solid var(--rule-strong)',
            padding: '18px 16px 24px',
          }}>
            {/* Force summary heading */}
            <div className="stencil" style={{
              fontSize: 11, color: 'var(--mute)', letterSpacing: '0.22em',
              marginBottom: 18, paddingBottom: 8, borderBottom: '1px solid var(--rule)',
            }}>
              YOUR FORCE
            </div>

            {/* HE-V Roster section */}
            <ForceSection
              title="Roster"
              count={mechs.length}
              empty={mechs.length === 0}
              addLabel="Add HE-V"
              onAdd={() => setAddMechOpen(true)}
              accent="rust"
            >
              {mechs.length === 0 ? (
                <EmptyHint>No HE-Vs yet. Add one to begin.</EmptyHint>
              ) : (
                mechs.map((m, i) => (
                  <MechCard
                    key={m.id}
                    mech={m}
                    index={i}
                    active={selectedMechId === m.id && sideTab === 'roster'}
                    assignedTo={assignmentLookup[`hev:${m.id}`]}
                    onSelect={(id) => {
                      setSelectedMechId(id);
                      setSideTab('roster');
                    }}
                  />
                ))
              )}
            </ForceSection>

            {/* Support section */}
            <ForceSection
              title="Support"
              count={supportAssets.length}
              max={supportLimit}
              addLabel="Browse"
              onAdd={() => {
                setSelectedSupportName(null);
                setSideTab('support');
              }}
            >
              {supportAssets.length === 0 ? (
                <EmptyHint>No support taken.</EmptyHint>
              ) : (
                supportAssets.map(name => {
                  const a = findAsset(name);
                  if (!a) return null;
                  return (
                    <SupportRosterCard
                      key={name}
                      asset={a}
                      customName={supportNicknames[name]}
                      loadout={supportLoadouts[name]}
                      assignedTo={assignmentLookup[`support:${name}`]}
                      onRemove={toggleSupport}
                      onRename={(nick) => renameSupport(name, nick)}
                      active={selectedSupportName === name && sideTab === 'support'}
                      onClick={() => {
                        setSelectedMechId(null);
                        setSelectedSupportName(name);
                        setSideTab('support');
                      }}
                    />
                  );
                })
              )}
            </ForceSection>

            {/* Teams section */}
            <ForceSection
              title="Teams"
              count={selectedTeams.length}
              max={teamMax}
              addLabel="Browse"
              onAdd={() => setSideTab('teams')}
            >
              {selectedTeams.length === 0 ? (
                <EmptyHint>No teams enlisted.</EmptyHint>
              ) : (
                selectedTeams.map(name => (
                  <TeamSummaryCard
                    key={name}
                    teamName={name}
                    onClick={() => setSideTab('teams')}
                    onRemove={() => toggleTeam(name)}
                  />
                ))
              )}
            </ForceSection>

            {/* Faction section */}
            <ForceSection
              title="Faction"
              count={faction ? 1 : 0}
              addLabel={faction ? 'Edit' : 'Pick'}
              onAdd={() => setSideTab('faction')}
            >
              {faction ? (
                <FactionSummaryCard
                  faction={faction}
                  perks={perks}
                  onClick={() => setSideTab('faction')}
                />
              ) : (
                <EmptyHint>No faction picked.</EmptyHint>
              )}
            </ForceSection>
          </aside>

          {/* RIGHT: workshop with tab strip + content */}
          <main ref={editorRef} className="editor-col scroll" style={{
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Tab strip — always all 4 tabs */}
            <div className="workshop-tabs">
              {[
                { id: 'roster', label: 'Roster' },
                { id: 'support', label: 'Support' },
                { id: 'teams', label: 'Teams' },
                { id: 'faction', label: 'Faction' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSideTab(t.id)}
                  className={`workshop-tab ${sideTab === t.id ? 'is-active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="workshop-content scroll">
              {sideTab === 'roster' && selectedMech && (
                <MechEditor
                  mech={selectedMech}
                  mechIndex={mechs.findIndex(m => m.id === selectedMech.id)}
                  onChange={handleUpdateMech}
                  onDelete={handleDeleteMech}
                />
              )}

              {sideTab === 'roster' && !selectedMech && mechs.length > 0 && (
                <EmptyState>Pick an HE-V from your force to load it out.</EmptyState>
              )}

              {sideTab === 'roster' && !selectedMech && mechs.length === 0 && (
                <FirstRunBriefing onAdd={() => setAddMechOpen(true)} simpleMode={simpleMode} />
              )}

              {sideTab === 'support' && selectedSupportName && (
                <SupportDetailView
                  assetName={selectedSupportName}
                  customName={supportNicknames[selectedSupportName]}
                  loadout={supportLoadouts[selectedSupportName]}
                  onSetLoadout={(l) => setSupportLoadout(selectedSupportName, l)}
                  onBack={() => setSelectedSupportName(null)}
                />
              )}

              {sideTab === 'support' && !selectedSupportName && (
                <SupportPanel
                  selected={supportAssets}
                  onToggle={toggleSupport}
                  limit={supportLimit}
                  simpleMode={simpleMode}
                />
              )}

              {sideTab === 'teams' && (
                <TeamPanel
                  mechs={mechs}
                  supportAssets={supportAssets}
                  selectedTeams={selectedTeams}
                  onToggleTeam={toggleTeam}
                  mission={missionObj}
                  teamAssignments={teamAssignments}
                  supportNicknames={supportNicknames}
                  onAssign={assignToTeam}
                  onUnassign={unassignFromTeams}
                  onClearTeam={clearTeamAssignments}
                />
              )}

              {sideTab === 'faction' && (
                <FactionPanel
                  faction={faction}
                  perks={perks}
                  onSetFaction={handleSetFaction}
                  onTogglePerk={togglePerk}
                />
              )}
            </div>
          </main>
        </div>

        <BottomBar
          forceName={forceName} onForceName={setForceName}
          onPrint={() => window.print()}
          onOptions={() => setOptionsOpen(true)}
          onLists={() => setListsOpen(true)}
          mission={mission} customTons={customTons}
          onMission={setMission} onCustomTons={setCustomTons}
          totalTons={totalTons}
          supportCount={supportAssets.length}
          mechCount={mechs.length}
          onAddMech={() => setAddMechOpen(true)}
          onAddSupport={handleAddSupport}
        />
      </div>

      <AddMechModal
        open={addMechOpen}
        onClose={() => setAddMechOpen(false)}
        onConfirm={handleConfirmAddMech}
        callsignPool={callsignPools}
        customCallsigns={customCallsigns}
      />

      <OptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        callsignPool={callsignPools}
        setCallsignPool={setCallsignPools}
        customCallsigns={customCallsigns}
        setCustomCallsigns={setCustomCallsigns}
        simpleMode={simpleMode}
        setSimpleMode={setSimpleMode}
        factionLogo={factionLogo}
        setFactionLogo={setFactionLogo}
      />

      <ListsModal
        open={listsOpen}
        onClose={() => setListsOpen(false)}
        currentState={{
          forceName, mission, customTons,
          faction, perks, factionLogo,
          mechs, supportAssets, selectedTeams,
          callsignPools, customCallsigns,
          supportNicknames, supportLoadouts,
          teamAssignments,
          simpleMode,
        }}
        onLoad={(data) => {
          // Defensive: only restore known keys.
          if (data.forceName != null) setForceName(data.forceName);
          if (data.mission != null) setMission(data.mission);
          if (data.customTons != null) setCustomTons(data.customTons);
          if (data.faction !== undefined) setFaction(data.faction);
          if (data.perks) setPerks(data.perks);
          if (data.factionLogo !== undefined) setFactionLogo(data.factionLogo);
          if (data.mechs) setMechs(data.mechs);
          if (data.supportAssets) setSupportAssets(data.supportAssets);
          if (data.selectedTeams) setSelectedTeams(data.selectedTeams);
          if (data.callsignPools) setCallsignPools(data.callsignPools);
          if (data.customCallsigns) setCustomCallsigns(data.customCallsigns);
          if (data.supportNicknames) setSupportNicknames(data.supportNicknames);
          if (data.supportLoadouts) setSupportLoadouts(data.supportLoadouts);
          if (data.teamAssignments) setTeamAssignments(data.teamAssignments);
          if (data.simpleMode !== undefined) setSimpleMode(data.simpleMode);
          setSelectedMechId(null);
          setSelectedSupportName(null);
        }}
      />
    </>
  );
}

// ============================================================
// EMPTY / CONTEXT STATES
// ============================================================

function EmptyState({ children }) {
  return (
    <div style={{
      maxWidth: 480, marginTop: 48, color: 'var(--ink-2)',
      fontSize: 15, lineHeight: 1.55,
    }}>
      <div className="stencil" style={{
        fontSize: 12, letterSpacing: '0.2em', color: 'var(--mute)', marginBottom: 8,
      }}>
        ─ No selection
      </div>
      {children}
    </div>
  );
}

// ============================================================
// LEFT SIDEBAR HELPERS
// ============================================================

// Wraps each summary section (Roster/Support/Teams/Faction) on the left.
function ForceSection({ title, count, max, addLabel, onAdd, accent, children }) {
  return (
    <section className="force-section" style={{ marginBottom: 22 }}>
      <header style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 8, marginBottom: 8, paddingBottom: 4,
        borderBottom: '1px solid var(--rule-strong)',
      }}>
        <div className="stencil" style={{
          fontSize: 16, color: 'var(--ink)', letterSpacing: '0.14em',
        }}>
          {title}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>
          {count}{max != null ? ` / ${max}` : ''}
        </div>
      </header>
      <div>{children}</div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="add-btn"
          style={{
            marginTop: 8,
            background: 'transparent',
            border: `1.5px ${accent === 'rust' ? 'solid var(--rust)' : 'dashed var(--rule-strong)'}`,
            color: accent === 'rust' ? 'var(--rust)' : 'var(--ink-2)',
            padding: '7px 14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            width: '100%',
          }}
        >
          + {addLabel}
        </button>
      )}
    </section>
  );
}

function EmptyHint({ children }) {
  return (
    <div style={{
      padding: '8px 6px', fontSize: 12.5, color: 'var(--mute)',
      fontStyle: 'italic',
    }}>
      {children}
    </div>
  );
}

// Small clickable card for a selected Team in the left summary.
function TeamSummaryCard({ teamName, onClick, onRemove }) {
  const team = TEAMS.find(t => t.name === teamName);
  if (!team) return null;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8, alignItems: 'center',
        padding: '8px 10px',
        borderTop: '1px solid var(--rule)',
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
          {team.name}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--mute)' }}>
          Team of {team.band}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remove team"
        style={{
          background: 'transparent', border: '1px solid var(--rust)',
          color: 'var(--rust)', padding: '3px 8px', cursor: 'pointer',
          fontFamily: 'var(--font-stencil)', fontSize: 10,
          fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
      >
        ×
      </button>
    </div>
  );
}

// Faction summary card on the left.
function FactionSummaryCard({ faction, perks, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--rule)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17, fontWeight: 700, color: 'var(--ink)',
        letterSpacing: '0.03em', textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {faction}
      </div>
      {perks.length > 0 ? (
        <ul style={{
          margin: 0, paddingLeft: 16,
          fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5,
        }}>
          {perks.map(p => <li key={p}>{p}</li>)}
        </ul>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--mute)', fontStyle: 'italic' }}>
          No perks picked yet.
        </div>
      )}
    </div>
  );
}

function FirstRunBriefing({ onAdd, simpleMode }) {
  return (
    <div style={{ maxWidth: 580, marginTop: 36 }}>
      <div className="stencil" style={{
        fontSize: 13, letterSpacing: '0.22em', color: 'var(--rust)', marginBottom: 8,
      }}>
        BRIEFING
      </div>
      <h1 className="briefing-hero" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 38, fontWeight: 700, letterSpacing: '0.02em',
        textTransform: 'uppercase', margin: '0 0 18px',
        lineHeight: 1.05,
      }}>
        Build your force.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 22px' }}>
        Pick a mission size, add HE-Vs, load them out.
      </p>
      <button onClick={onAdd} className="add-btn cta-mech cta-pulse" style={{
        background: 'var(--rust)', color: 'var(--surface)', border: 'none',
        padding: '15px 26px', cursor: 'pointer',
        fontFamily: 'var(--font-stencil)', fontSize: 15, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 11,
        boxShadow: '0 3px 0 var(--rust-deep)',
      }}>
        <img src={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '/')}icons/hev.svg`} alt="" className="cta-mech-icon" style={{ width: 26, height: 26 }} />
        Add Your First HE-V
      </button>
    </div>
  );
}
