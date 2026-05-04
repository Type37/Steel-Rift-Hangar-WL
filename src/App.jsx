import React, { useState, useMemo } from 'react';
import { TEAMS, MISSIONS, MISSION_ORDER } from './data';
import { calcMech, newMech, findAsset } from './calc';

import { TopBar, BottomBar, MechCard, EmptyRoster } from './components/chrome';
import { MechEditor } from './components/editor';
import { SupportPanel, TeamPanel, FactionPanel, GlossaryPanel } from './components/panels';
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

  const [mechs, setMechs] = useState([]);
  const [supportAssets, setSupportAssets] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedMechId, setSelectedMechId] = useState(null);

  const [callsignPool, setCallsignPool] = useState('Mixed');
  const [customCallsigns, setCustomCallsigns] = useState([]);

  const [addMechOpen, setAddMechOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [activeToken, setActiveToken] = useState(null);

  // Sidebar tab
  const [sideTab, setSideTab] = useState('roster'); // roster | support | teams | faction

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

  const toggleSupport = (name) => {
    setSupportAssets(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const toggleTeam = (name) => {
    setSelectedTeams(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSetFaction = (f) => {
    setFaction(f);
    setPerks([]);
  };

  const togglePerk = (name) => {
    setPerks(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const onToken = (t) => setActiveToken(prev => prev === t ? null : t);

  const handleAddSupport = () => {
    setSelectedMechId(null);
    setSideTab('support');
  };

  // ---- Render ----
  return (
    <>
      {/* Print version is hidden until @media print kicks in */}
      <PrintView
        forceName={forceName} mission={mission} customTons={customTons}
        mechs={mechs} supportAssets={supportAssets}
        faction={faction} perks={perks} selectedTeams={selectedTeams}
      />

      <div className="no-print" style={{
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <TopBar
          forceName={forceName} onForceName={setForceName}
          onPrint={() => window.print()}
          onOptions={() => setOptionsOpen(true)}
        />

        {/* Glossary lives in the dead space above the main grid */}
        <GlossaryPanel activeToken={activeToken} onClear={() => setActiveToken(null)} />

        {/* Main two-column layout */}
        <div className="layout" style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {/* LEFT — sidebar with tabs (roster/support/teams/faction) */}
          <aside className="scroll" style={{
            background: 'var(--bg)',
            borderRight: '1.5px solid var(--rule-strong)',
            overflowY: 'auto',
            padding: '18px 16px 24px',
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
              marginBottom: 18, border: '1.5px solid var(--ink)',
            }}>
              {[
                { id: 'roster', label: 'Roster', count: mechs.length },
                { id: 'support', label: 'Support', count: supportAssets.length },
                { id: 'teams', label: 'Teams', count: selectedTeams.length },
                { id: 'faction', label: 'Faction', count: perks.length },
              ].map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setSideTab(t.id)}
                  style={{
                    background: sideTab === t.id ? 'var(--ink)' : 'transparent',
                    color: sideTab === t.id ? 'var(--surface)' : 'var(--ink)',
                    border: 'none',
                    borderRight: i < 3 ? '1.5px solid var(--ink)' : 'none',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  }}
                >
                  {t.label}
                  <span className="mono" style={{
                    fontSize: 10.5, fontWeight: 700,
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
                activeToken={activeToken}
                onToken={onToken}
              />
            )}

            {sideTab === 'teams' && (
              <TeamPanel
                mechs={mechs}
                selectedTeams={selectedTeams}
                onToggleTeam={toggleTeam}
                mission={useCustom ? { ...MISSIONS['Battle'], teamCounts: { '2': 1, '2-3': 2, '3-4': 2 } } : MISSIONS[mission]}
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
          </aside>

          {/* RIGHT — editor or context-appropriate empty state */}
          <main className="editor-col scroll" style={{
            overflowY: 'auto',
            padding: '24px 28px 36px',
            background: 'var(--surface)',
          }}>
            {sideTab === 'roster' && selectedMech && (
              <MechEditor
                mech={selectedMech}
                mechIndex={mechs.findIndex(m => m.id === selectedMech.id)}
                onChange={handleUpdateMech}
                onDelete={handleDeleteMech}
                activeToken={activeToken}
                onToken={onToken}
              />
            )}

            {sideTab === 'roster' && !selectedMech && mechs.length > 0 && (
              <EmptyState>
                Select an HE-V from the roster to load it out.
              </EmptyState>
            )}

            {sideTab === 'roster' && !selectedMech && mechs.length === 0 && (
              <FirstRunBriefing onAdd={() => setAddMechOpen(true)} />
            )}

            {sideTab === 'support' && (
              <EmptyState>
                Pick assets in the sidebar. Each entry expands for full rules and stats before you commit.
              </EmptyState>
            )}

            {sideTab === 'teams' && (
              <EmptyState>
                Teams unlock when 2+ HE-Vs in your roster meet a team's requirements. The mission's allowed team-bands are shown above the list.
              </EmptyState>
            )}

            {sideTab === 'faction' && (
              <EmptyState>
                Pick a Faction Type and 2 Perks (no more than one from any single Grouping). Faction Agendas are an additional way to score a VP every Round.
              </EmptyState>
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
      />
    </>
  );
}

// ============================================================
// EMPTY STATES
// ============================================================

function EmptyState({ children }) {
  return (
    <div style={{
      maxWidth: 480, marginTop: 48, color: 'var(--ink-2)',
      fontSize: 14, lineHeight: 1.55,
    }}>
      <div className="display" style={{
        fontSize: 12, letterSpacing: '0.2em', color: 'var(--mute)', marginBottom: 8,
      }}>
        ─ No selection
      </div>
      {children}
    </div>
  );
}

function FirstRunBriefing({ onAdd }) {
  return (
    <div style={{ maxWidth: 560, marginTop: 36 }}>
      <div className="display" style={{
        fontSize: 13, letterSpacing: '0.22em', color: 'var(--rust)', marginBottom: 8,
      }}>
        BRIEFING
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 38, fontWeight: 700, letterSpacing: '0.02em',
        textTransform: 'uppercase', margin: '0 0 18px',
        lineHeight: 1.05,
      }}>
        Build a force for the next deployment.
      </h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 14px' }}>
        Set the mission size in the bottom bar (or pick a custom tonnage). Add an HE-V to begin loading out armor, weapons, upgrades, and defensive gear. The roster card on the left tracks tonnage and slot usage. Support Assets, HE-V Teams, and Faction perks live in the sidebar tabs.
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 22px' }}>
        Every weapon, upgrade, and asset in the catalog can be expanded to read its rules and per-class statistics before adding. Click any underlined trait token to surface its definition in the band at the top of the screen.
      </p>
      <button onClick={onAdd} style={{
        background: 'var(--rust)', color: 'var(--surface)', border: 'none',
        padding: '14px 20px', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        + Add Your First HE-V
      </button>
    </div>
  );
}
