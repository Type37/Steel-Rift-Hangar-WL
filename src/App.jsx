import React, { useState, useMemo, useRef, useEffect } from 'react';
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;
import { TEAMS, MISSIONS, MISSION_ORDER, FACTION_LOGOS, FREEFORM_MISSION, FACTIONS } from './data';
import { POOL_NAMES } from './callsigns';
import { calcMech, newMech, findAsset, effectivePerks } from './calc';
import { WC } from './data';

import { Navbar, BottomBar, MechCard, EmptyRoster, SupportRosterCard } from './components/chrome';
import { MechEditor } from './components/editor';
import { SupportPanel, TeamPanel, FactionPanel, SupportDetailView, AgendasPanel } from './components/panels';
import { AddMechModal, OptionsModal, ListsModal, AboutModal } from './components/modals';
import { PrintView } from './components/print';
import { SectionTitle, GhostButton, HoverEditHint } from './components/ui';

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
  const [subPerkSelections, setSubPerkSelections] = useState(stored.subPerkSelections ?? {});

  const [mechs, setMechs] = useState(stored.mechs ?? []);
  const [supportAssets, setSupportAssets] = useState(stored.supportAssets ?? []);
  const [selectedTeams, setSelectedTeams] = useState(stored.selectedTeams ?? []);
  const [selectedMechId, setSelectedMechId] = useState(null);
  // Print preview overlay. When true, the PrintView renders on screen
  // wrapped in preview chrome (gray bg, page shadows, top toolbar).
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
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
  // Garrison unit selections per asset. Shape: { 'Infantry Outpost': [['Rifle','Rifle',...], ['Anti-Tank',...]] }
  const [garrisonLoadouts, setGarrisonLoadouts] = useState(stored.garrisonLoadouts ?? {});
  // Per-team unit assignments. Shape: { 'Reconnaissance Team': ['mech_id_1', 'support:LAS-Wing Attack Squadron', ...], ... }
  // Drag a unit from the left onto a team row in the right pane to assign.
  const [teamAssignments, setTeamAssignments] = useState(stored.teamAssignments ?? {});

  const [simpleMode, setSimpleMode] = useState(stored.simpleMode ?? false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [focusTeamName, setFocusTeamName] = useState(null);
  const [weaponSort, setWeaponSort] = useState(stored.weaponSort ?? 'cost');

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
        mechs, supportAssets, selectedTeams, subPerkSelections,
        callsignPools, customCallsigns, supportNicknames, supportLoadouts, garrisonLoadouts, weaponSort,
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

  // ESC closes the print preview overlay.
  useEffect(() => {
    if (!printPreviewOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setPrintPreviewOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [printPreviewOpen]);

  // ---- Derived ----
  const selectedMech = mechs.find(m => m.id === selectedMechId) || null;
  const useCustom = mission === 'Custom';
  const isFreeform = mission === FREEFORM_MISSION;
  const cap = isFreeform ? Infinity : (useCustom ? customTons : MISSIONS[mission].tons);
  const supportLimit = isFreeform ? Infinity : (useCustom ? Math.max(1, Math.floor(customTons / 50)) : MISSIONS[mission].support);
  // Resolve full effective perk list including sub-perks from Tech Pirates / Disgraced Trillionaire
  const activePerks = useMemo(
    () => effectivePerks(perks, subPerkSelections),
    [perks, subPerkSelections]
  );

  // Rules p.18: each HE-V costs its flat weight-class tonnage (20/30/40/50)
  // from the force budget. Weapons/upgrades are paid from within that
  // tonnage, not on top of it.
  // Outrageous Support Budget: one off-table asset costing ≤10t is free.
  const totalTons = useMemo(() => {
    const mechTons = mechs.reduce((s, m) => s + WC[m.weightClass].tons, 0);
    let assetTons = supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0);
    if (activePerks.includes('Outrageous Support Budget')) {
      // Find the most expensive off-table asset costing ≤10t and make it free
      const qualifying = supportAssets
        .map(n => findAsset(n))
        .filter(a => a && a.kind === 'Off-Table' && a.cost <= 10)
        .sort((a, b) => b.cost - a.cost);
      if (qualifying.length > 0) assetTons -= qualifying[0].cost;
    }
    return mechTons + assetTons;
  }, [mechs, supportAssets, activePerks]);

  const missionObj = isFreeform
    ? { ...MISSIONS['All-Out War'], teamCounts: { '2-3': 99, '3-4': 99 } }
    : useCustom
      ? { ...MISSIONS['Battle'], teamCounts: { '2-3': 2, '3-4': 2 } }
      : MISSIONS[mission];
  const teamMax = isFreeform ? 999 : Object.values(missionObj.teamCounts).reduce((a, b) => a + b, 0);

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

  const handleSetFaction = (f) => { setFaction(prev => prev === f ? null : f); setPerks([]); setSubPerkSelections({}); };

  const togglePerk = (name) => {
    // Radio behavior: selecting a perk removes any other perk from the same group
    if (!faction) return;
    const factionPerks = FACTIONS[faction]?.perks || {};
    // Find which group this perk belongs to
    const groupPerks = Object.values(factionPerks).find(opts => opts.some(o => o.name === name)) || [];
    const groupNames = groupPerks.map(o => o.name);
    setPerks(prev => {
      if (prev.includes(name)) return prev.filter(p => p !== name); // click again to deselect
      // Remove any existing selection from this group, add new one
      const withoutGroup = prev.filter(p => !groupNames.includes(p));
      if (withoutGroup.length >= 2) return prev; // already have 2 from other groups
      return [...withoutGroup, name];
    });
  };

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
        activePerks={activePerks}
        simpleMode={simpleMode}
        factionLogo={factionLogo}
        supportNicknames={supportNicknames}
        supportLoadouts={supportLoadouts}
        previewMode={printPreviewOpen}
        onClosePreview={() => setPrintPreviewOpen(false)}
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
                    mechs={mechs}
                    assignments={teamAssignments[name] || []}
                    onClick={() => { setSideTab('teams'); setFocusTeamName(name); }}
                    onRemove={() => toggleTeam(name)}
                  />
                ))
              )}
            </ForceSection>

            {/* Faction section */}
            <ForceSection
              title="Faction"
              addLabel={faction ? 'Edit' : 'Pick'}
              onAdd={() => setSideTab('faction')}
            >
              {faction ? (
                <FactionSummaryCard
                  faction={faction}
                  perks={perks}
                  subPerkSelections={subPerkSelections}
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
                { id: 'agendas', label: 'Agendas' },
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
                  weaponSort={weaponSort}
                  onChange={handleUpdateMech}
                  onDelete={handleDeleteMech}
                  activePerks={activePerks}
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
                  garrisonLoadout={garrisonLoadouts[selectedSupportName]}
                  garrisonCount={supportAssets.filter(n => n === selectedSupportName).length}
                  onSetGarrisonLoadout={(v) => setGarrisonLoadouts(prev => ({ ...prev, [selectedSupportName]: v }))}
                  onSetLoadout={(l) => setSupportLoadout(selectedSupportName, l)}
                  onBack={() => setSelectedSupportName(null)}
                  activePerks={activePerks}
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
                  focusTeamName={focusTeamName}
                  onFocusConsumed={() => setFocusTeamName(null)}
                  onSelectMech={(id) => { setSelectedMechId(id); setSideTab('roster'); }}
                />
              )}

              {sideTab === 'faction' && (
                <FactionPanel
                  faction={faction}
                  perks={perks}
                  subPerkSelections={subPerkSelections}
                  onSetSubPerk={(perk, sub) => setSubPerkSelections(s => ({ ...s, [perk]: sub }))}
                  onSetFaction={handleSetFaction}
                  onTogglePerk={togglePerk}
                />
              )}

              {sideTab === 'agendas' && (
                <AgendasPanel
                  mechs={mechs}
                  faction={faction}
                  selectedTeams={selectedTeams}
                  supportAssets={supportAssets}
                />
              )}
            </div>
          </main>
        </div>

        <BottomBar
          forceName={forceName} onForceName={setForceName}
          onPrint={() => setPrintPreviewOpen(true)}
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
        setCallsignPool={setCallsignPools}
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
        weaponSort={weaponSort}
        setWeaponSort={setWeaponSort}
        factionLogo={factionLogo}
        setFactionLogo={setFactionLogo}
      />

      <ListsModal
        open={listsOpen}
        onClose={() => setListsOpen(false)}
        currentState={{
          forceName, mission, customTons,
          faction, perks, factionLogo,
          mechs, supportAssets, selectedTeams, subPerkSelections,
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
          if (data.subPerkSelections) setSubPerkSelections(data.subPerkSelections);
          if (data.factionLogo !== undefined) setFactionLogo(data.factionLogo);
          if (data.mechs) setMechs(data.mechs);
          if (data.supportAssets) setSupportAssets(data.supportAssets);
          if (data.selectedTeams) setSelectedTeams(data.selectedTeams);
          if (data.callsignPools) setCallsignPools(data.callsignPools);
          if (data.customCallsigns) setCustomCallsigns(data.customCallsigns);
          if (data.supportNicknames) setSupportNicknames(data.supportNicknames);
          if (data.supportLoadouts) setSupportLoadouts(data.supportLoadouts);
          if (data.garrisonLoadouts) setGarrisonLoadouts(data.garrisonLoadouts);
          if (data.weaponSort) setWeaponSort(data.weaponSort);
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


const TEAM_ICONS = {
  'Reconnaissance Team': 'icons/team-recon.svg',
  'Security Team':        'icons/team-security.svg',
  'Assassination Team':   'icons/team-assassination.svg',
  'Berserker Team':       'icons/team-berserker.svg',
  'Multirole Team':       'icons/team-multirole.svg',
  'Gunslinger Team':      'icons/team-gunslinger.svg',
  'Fire Support Team':    'icons/team-fire-support.svg',
  'Networked AI Team':    'icons/team-networked-ai.svg',
  'Coordinated Assets Team': 'icons/team-coordinated-assets.svg',
};

// Small clickable card for a selected Team in the left summary.
function TeamSummaryCard({ teamName, mechs = [], assignments = [], onClick, onRemove }) {
  const team = TEAMS.find(t => t.name === teamName);
  if (!team) return null;

  // Count qualifying mechs per requirement row
  const reqRows = Array.isArray(team.req) ? team.req : [];

  const countFor = (req) => {
    return mechs.filter(m => {
      if (m.weightClass !== req.cls) return false;
      if (req.melee) {
        const hasMelee = m.weapons.some(w => {
          const wdef = WC[m.weightClass]; // just check names
          return w.name && w.name.toLowerCase().includes('melee') ||
            w.name && ['combat blade','demolition cutter','impact hammer','mass tetsubo','mega glaive','plasma blade','shock net','basic melee weapon'].includes(w.name.toLowerCase());
        });
        if (!hasMelee) return false;
      }
      if (req.needs) {
        const allItems = [...m.weapons.map(w => w.name.toLowerCase()), ...m.upgrades.map(u => u.toLowerCase())];
        const hasAll = req.needs.every(n => allItems.some(i => i.includes(n.toLowerCase())));
        if (!hasAll) return false;
      }
      return true;
    }).length;
  };

  return (
    <div
      onClick={onClick}
      style={{ padding: '8px 10px', borderTop: '1px solid var(--rule)', cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: reqRows.length ? 5 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {TEAM_ICONS[team.name] && (
            <img src={asset(TEAM_ICONS[team.name])} alt="" style={{ width: 22, height: 22, opacity: 0.7, flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{team.name}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--mute)' }}>Team of {team.band}</div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove team"
          style={{
            background: 'transparent', border: '1px solid var(--rust)',
            color: 'var(--rust)', padding: '3px 8px', cursor: 'pointer',
            fontFamily: 'var(--font-stencil)', fontSize: 10,
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
          }}
        >×</button>
      </div>

      {reqRows.length > 0 && (
        <div style={{
          marginTop: 6,
          borderTop: '1px solid var(--rule)',
          paddingTop: 7,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {reqRows.map((req, i) => {
            const count = countFor(req);
            const min = req.min || 0;
            const max = req.max;
            const met = count >= min;
            const over = count > max;
            const needsMet = met && !over;
            const accentColor = over ? 'var(--rust)' : needsMet ? 'var(--olive)' : 'var(--rule-strong)';

            // Build the constraint text pieces
            const constraints = [
              req.needs ? `with ${req.needs.join(needsMet ? ' / ' : ', ')}` : null,
              req.needsDefensive ? 'any Defensive Config' : null,
              req.melee ? 'equipping a Melee weapon' : null,
              req.noReach ? 'no Reach' : null,
              req.stripped ? 'both Armor + Structure Stripped' : null,
              req.reinforced ? 'Armor or Structure Reinforced' : null,
              req.noStripped ? 'not Stripped' : null,
              req.shortMeleeOnly ? 'only Short or Melee weapons' : null,
              req.noBlast ? 'no Blast weapons' : null,
              req.hasDrone ? 'any Companion Drone' : null,
              req.noDup ? 'no duplicate weapons' : null,
            ].filter(Boolean);

            return (
              <div key={i} style={{
                borderLeft: `3px solid ${accentColor}`,
                paddingLeft: 8,
              }}>
                {/* Count + class on one line */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: constraints.length ? 2 : 0 }}>
                  <span className="mono" style={{
                    fontSize: 13, fontWeight: 700, color: accentColor, flexShrink: 0,
                  }}>
                    {count}/{min === max ? max : `${min}–${max}`}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>
                    {req.cls}
                  </span>
                </div>
                {/* Constraints on second line */}
                {constraints.length > 0 && (
                  <div style={{ fontSize: 11.5, color: 'var(--mute)', lineHeight: 1.4 }}>
                    {constraints.join(' · ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Assigned units */}
      {assignments.length > 0 ? (
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {assignments.map(id => {
            const mechId = id.startsWith('hev:') ? id.slice(4) : null;
            const m = mechId ? mechs.find(m => m.id === mechId) : null;
            const label = m ? (m.name || `${m.weightClass} HE-V`) : id.replace(/^(hev|support):/, '');
            return (
              <span key={id} style={{
                fontSize: 10.5, fontFamily: 'var(--font-stencil)', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: 'var(--olive)', color: 'var(--surface)',
                padding: '2px 6px',
              }}>{label}</span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// Find a perk's text across all groups in a faction's perk definition.
function findPerkText(factionName, perkName, subPerkSelections) {
  const factionData = FACTIONS[factionName];
  if (!factionData) return null;

  // Search direct faction perks
  for (const group of Object.values(factionData.perks || {})) {
    const match = group.find(o => o.name === perkName);
    if (match) return match.text;
  }

  // Sub-perk grants — search Corporations and Authorities
  for (const factionKey of ['Corporations', 'Authorities']) {
    const fData = FACTIONS[factionKey];
    for (const group of Object.values(fData?.perks || {})) {
      const match = group.find(o => o.name === perkName);
      if (match) return match.text;
    }
  }
  return null;
}

// Faction summary card on the left — shows perk names + truncated text,
// including Freelancer sub-perks from Tech Pirates / Disgraced Trillionaire.
function FactionSummaryCard({ faction, perks, subPerkSelections = {}, onClick }) {
  const factionData = FACTIONS[faction];

  // Build list of perks to display: selected perks + any sub-perk grants
  const displayPerks = perks.map(perkName => {
    const text = findPerkText(faction, perkName, subPerkSelections);
    const subPerk = subPerkSelections[perkName];
    const subText = subPerk ? findPerkText(faction, subPerk, {}) : null;
    return { name: perkName, text, subPerk, subText };
  });

  return (
    <div
      onClick={onClick}
      className="has-edit-hint"
      style={{ padding: '10px 12px', borderTop: '1px solid var(--rule)', cursor: 'pointer', position: 'relative' }}
    >
      <HoverEditHint />
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
        color: 'var(--ink)', letterSpacing: '0.03em', textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {faction}
      </div>

      {/* Faction agenda — name bolded, body truncated */}
      {factionData?.agenda && (() => {
        const raw = factionData.agenda;
        const colon = raw.indexOf(':');
        const agendaName = colon > -1 ? raw.slice(0, colon).trim() : faction;
        const agendaBody = colon > -1 ? raw.slice(colon + 1).trim() : raw;
        return (
          <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 2 }}>
              Agenda
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 700, marginBottom: 2 }}>
              {agendaName}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              {agendaBody}
            </div>
          </div>
        );
      })()}

      {/* Selected perks with text */}
      {displayPerks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayPerks.map(({ name, text, subPerk, subText }) => (
            <div key={name}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
                {name}
              </div>
              {text && (
                <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {text}
                </div>
              )}
              {/* Freelancer sub-perk (Tech Pirates / Disgraced Trillionaire) */}
              {subPerk && (
                <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: '2px solid var(--perk)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--perk)', marginBottom: 1 }}>
                    {subPerk}
                  </div>
                  {subText && (
                    <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {subText}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--mute)', fontStyle: 'italic' }}>No perks picked.</div>
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
