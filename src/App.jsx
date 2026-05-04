import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TEAMS, MISSIONS, MISSION_ORDER } from './data';
import { calcMech, newMech, findAsset } from './calc';

import { Navbar, TopBar, BottomBar, MechCard, EmptyRoster } from './components/chrome';
import { MechEditor } from './components/editor';
import { SupportPanel, TeamPanel, FactionPanel } from './components/panels';
import { AddMechModal, OptionsModal } from './components/modals';
import { PrintView } from './components/print';
import { SectionTitle, GhostButton } from './components/ui';

export default function App() {
  // ---- State ----
  const [forceName, setForceName] = useState('');
  const [mission, setMission] = useState('Strike');
  const [customTons, setCustomTons] = useState(150);

  const [faction, setFaction] = useState(null);
  const [perks, setPerks] = useState([]);
  // Optional faction logo (data URL) used in the print header.
  const [factionLogo, setFactionLogo] = useState(null);

  const [mechs, setMechs] = useState([]);
  const [supportAssets, setSupportAssets] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedMechId, setSelectedMechId] = useState(null);

  const [callsignPool, setCallsignPool] = useState('Mixed');
  const [customCallsigns, setCustomCallsigns] = useState([]);

  // Simple mode hides factions, teams, advanced support assets, secondary agendas.
  // Advanced is the default (full game).
  const [simpleMode, setSimpleMode] = useState(false);

  const [addMechOpen, setAddMechOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Sidebar tab. In simple mode only roster + support are reachable.
  const [sideTab, setSideTab] = useState('roster');

  // If simple mode is enabled while sitting on a now-hidden tab, fall back to roster.
  useEffect(() => {
    if (simpleMode && (sideTab === 'teams' || sideTab === 'faction')) {
      setSideTab('roster');
    }
  }, [simpleMode, sideTab]);

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
  };

  const toggleSupport = (name) =>
    setSupportAssets(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const toggleTeam = (name) =>
    setSelectedTeams(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const handleSetFaction = (f) => { setFaction(f); setPerks([]); };

  const togglePerk = (name) =>
    setPerks(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);

  const handleAddSupport = () => {
    setSelectedMechId(null);
    setSideTab('support');
  };

  // Tab list rebuilt per mode
  const tabs = simpleMode
    ? [
        { id: 'roster', label: 'Roster', count: mechs.length },
        { id: 'support', label: 'Support', count: supportAssets.length },
      ]
    : [
        { id: 'roster', label: 'Roster', count: mechs.length },
        { id: 'support', label: 'Support', count: supportAssets.length },
        { id: 'teams', label: 'Teams', count: selectedTeams.length },
        { id: 'faction', label: 'Faction', count: perks.length },
      ];

  // ---- Render ----
  return (
    <>
      <PrintView
        forceName={forceName} mission={mission} customTons={customTons}
        mechs={mechs} supportAssets={supportAssets}
        faction={faction} perks={perks} selectedTeams={selectedTeams}
        simpleMode={simpleMode}
        factionLogo={factionLogo}
      />

      <div className="app-shell no-print">
        <Navbar />
        <TopBar
          forceName={forceName} onForceName={setForceName}
          onPrint={() => window.print()}
          onOptions={() => setOptionsOpen(true)}
          totalTons={totalTons} capTons={cap}
          mechCount={mechs.length}
          supportCount={supportAssets.length} supportLimit={supportLimit}
          teamCount={selectedTeams.length} teamMax={teamMax}
        />

        {/* Main two-column layout */}
        <div className="layout">
          <aside className="sidebar scroll" style={{
            background: 'var(--bg)',
            borderRight: '1.5px solid var(--rule-strong)',
            padding: '18px 16px 24px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
              gap: 0,
              marginBottom: 18,
              border: '1.5px solid var(--ink)',
            }}>
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setSideTab(t.id)}
                  className="add-btn"
                  style={{
                    background: sideTab === t.id ? 'var(--ink)' : 'transparent',
                    color: sideTab === t.id ? 'var(--surface)' : 'var(--ink)',
                    border: 'none',
                    borderRight: i < tabs.length - 1 ? '1.5px solid var(--ink)' : 'none',
                    padding: '10px 4px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-stencil)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  }}
                >
                  {t.label}
                  <span className="mono" style={{
                    fontSize: 11, fontWeight: 700,
                    color: sideTab === t.id ? 'var(--surface)' : 'var(--mute)',
                  }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {sideTab === 'roster' && (
              <div>
                <SectionTitle tag={mechs.length === 0 ? 'empty' : `${mechs.length} ${mechs.length === 1 ? 'unit' : 'units'}`}>
                  Roster
                </SectionTitle>
                {mechs.length === 0 ? (
                  <EmptyRoster onAdd={() => setAddMechOpen(true)} />
                ) : (
                  <div style={{ borderBottom: '1px solid var(--rule)', marginBottom: 12 }}>
                    {mechs.map((m, i) => (
                      <MechCard
                        key={m.id}
                        mech={m}
                        index={i}
                        active={selectedMechId === m.id}
                        onSelect={setSelectedMechId}
                      />
                    ))}
                  </div>
                )}

                {mechs.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <GhostButton onClick={() => setAddMechOpen(true)} fullWidth accent="rust">
                      + Add Another HE-V
                    </GhostButton>
                  </div>
                )}
              </div>
            )}

            {sideTab === 'support' && (
              <SupportPanel
                selected={supportAssets}
                onToggle={toggleSupport}
                limit={supportLimit}
                simpleMode={simpleMode}
              />
            )}

            {!simpleMode && sideTab === 'teams' && (
              <TeamPanel
                mechs={mechs}
                selectedTeams={selectedTeams}
                onToggleTeam={toggleTeam}
                mission={missionObj}
              />
            )}

            {!simpleMode && sideTab === 'faction' && (
              <FactionPanel
                faction={faction}
                perks={perks}
                onSetFaction={handleSetFaction}
                onTogglePerk={togglePerk}
                factionLogo={factionLogo}
                onSetFactionLogo={setFactionLogo}
              />
            )}
          </aside>

          <main ref={editorRef} className="editor-col scroll" style={{
            padding: '24px 28px 36px',
            background: 'var(--surface)',
          }}>
            {sideTab === 'roster' && selectedMech && (
              <MechEditor
                mech={selectedMech}
                mechIndex={mechs.findIndex(m => m.id === selectedMech.id)}
                onChange={handleUpdateMech}
                onDelete={handleDeleteMech}
              />
            )}

            {sideTab === 'roster' && !selectedMech && mechs.length > 0 && (
              <EmptyState>Select an HE-V from the roster to load it out.</EmptyState>
            )}

            {sideTab === 'roster' && !selectedMech && mechs.length === 0 && (
              <FirstRunBriefing onAdd={() => setAddMechOpen(true)} simpleMode={simpleMode} />
            )}

            {sideTab === 'support' && (
              <SupportContextPane count={supportAssets.length} limit={supportLimit} />
            )}

            {!simpleMode && sideTab === 'teams' && (
              <TeamsContextPane mission={missionObj} />
            )}

            {!simpleMode && sideTab === 'faction' && (
              <FactionContextPane faction={faction} />
            )}
          </main>
        </div>

        <BottomBar
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
        callsignPool={callsignPool}
        customCallsigns={customCallsigns}
      />

      <OptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        callsignPool={callsignPool}
        setCallsignPool={setCallsignPool}
        customCallsigns={customCallsigns}
        setCustomCallsigns={setCustomCallsigns}
        simpleMode={simpleMode}
        setSimpleMode={setSimpleMode}
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

// Right-pane context for the Support tab: numbers, no waffle.
function SupportContextPane({ count, limit }) {
  return (
    <div style={{ marginTop: 36, maxWidth: 520 }}>
      <div className="stencil" style={{ fontSize: 12, color: 'var(--rust)', letterSpacing: '0.22em', marginBottom: 8 }}>
        SUPPORT
      </div>
      <h2 style={{
        fontFamily: 'var(--font-stencil)',
        fontSize: 24, fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', margin: '0 0 6px',
      }}>
        {count} of {limit} taken
      </h2>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        Mission tonnage scales the support cap. The chevron on each row reveals full rules and the statline.
      </div>
    </div>
  );
}

function TeamsContextPane({ mission }) {
  const counts = mission.teamCounts;
  return (
    <div style={{ marginTop: 36, maxWidth: 520 }}>
      <div className="stencil" style={{ fontSize: 12, color: 'var(--rust)', letterSpacing: '0.22em', marginBottom: 8 }}>
        TEAMS
      </div>
      <h2 style={{
        fontFamily: 'var(--font-stencil)',
        fontSize: 24, fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', margin: '0 0 10px',
      }}>
        Mission allows {counts['2']}·2 / {counts['2-3']}·2-3 / {counts['3-4']}·3-4
      </h2>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        A team needs at least two qualifying HE-Vs from your roster. The sidebar marks each team eligible or short.
      </div>
    </div>
  );
}

function FactionContextPane({ faction }) {
  return (
    <div style={{ marginTop: 36, maxWidth: 520 }}>
      <div className="stencil" style={{ fontSize: 12, color: 'var(--rust)', letterSpacing: '0.22em', marginBottom: 8 }}>
        FACTION
      </div>
      <h2 style={{
        fontFamily: 'var(--font-stencil)',
        fontSize: 24, fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', margin: '0 0 10px',
      }}>
        {faction ? `${faction} selected` : 'Pick a faction'}
      </h2>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        {faction
          ? 'Take 2 perks, no more than one per group. Faction Agendas score additional VPs each round.'
          : 'Each faction has a doctrine, an agenda, and a perk catalog. Choose at left.'}
      </div>
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
        Build a force for the next deployment.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 22px' }}>
        Pick a mission size below, add an HE-V, and start loading it out. Tonnage and slot use are tracked live.
        {!simpleMode && ' Faction perks and HE-V Teams sit in the sidebar tabs once your roster fills out.'}
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
