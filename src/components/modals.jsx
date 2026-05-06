import React, { useState, useEffect } from 'react';
import { X, Dices, Info, ChevronDown } from 'lucide-react';
import { WC, WC_ORDER, FACTION_LOGOS } from '../data';
import { POOL_NAMES, rollCallsign } from '../callsigns';
import { Modal, FieldLabel, PrimaryButton, TextButton, Chip } from './ui';

// Resolve absolute asset path through Vite's base
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

// ============================================================
// ADD HE-V MODAL
// ============================================================

export function AddMechModal({ open, onClose, onConfirm, callsignPool: callsignPools, setCallsignPool, customCallsigns }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cls, setCls] = useState('Light');

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setCls('Light');
    }
  }, [open]);

  const [poolOpen, setPoolOpen] = useState(false);
  const roll = () => setName(rollCallsign(callsignPools, customCallsigns));
  const submit = () => onConfirm({ name: name.trim(), description: description.trim(), cls });

  return (
    <Modal open={open} onClose={onClose} width={580}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1.5px solid var(--ink)',
        background: 'var(--ink)', color: 'var(--surface)',
      }}>
        <div>
          <div className="display" style={{ fontSize: 19, letterSpacing: '0.18em' }}>
            New HE-V
          </div>
          <div className="mono" style={{
            fontSize: 10.5, opacity: 0.7, marginTop: 2, letterSpacing: '0.18em',
          }}>
            ROSTER ENTRY
          </div>
        </div>
        <button onClick={onClose} className="add-btn" style={{
          background: 'transparent', border: '1.5px solid var(--surface)',
          color: 'var(--surface)', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div style={{ padding: '22px' }}>
        <FieldLabel>Callsign</FieldLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            className="txt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ironwake, Saturn Forge, Silt-7"
            autoFocus
          />
          <div style={{ display: 'flex', flexShrink: 0, border: '1px solid var(--rule)' }}>
            <button onClick={roll} title="Roll a random callsign" className="add-btn"
              style={{ background: 'var(--surface)', padding: '0 14px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                borderRight: '1px solid var(--rule)',
                fontFamily: 'var(--font-stencil)', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)',
              }}>
              <Dices size={15} strokeWidth={2.25} />
              Roll
            </button>
            <button onClick={() => setPoolOpen(p => !p)} title="Callsign pool options"
              className="add-btn"
              style={{ background: poolOpen ? 'var(--surface-2)' : 'var(--surface)',
                padding: '0 9px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', color: 'var(--mute)',
              }}>
              <ChevronDown size={13} strokeWidth={2.5}
                style={{ transform: poolOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>
          </div>
        </div>

        {poolOpen && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--rule)',
            borderTop: 'none', padding: '10px 14px 12px', marginBottom: 6 }}>
            <div className="label" style={{ fontSize: 10, marginBottom: 8 }}>CALLSIGN POOLS</div>
            {POOL_NAMES.map(p => {
              const on = callsignPools.includes(p);
              return (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', fontSize: 13, color: 'var(--ink)', marginBottom: 4 }}>
                  <input type="checkbox" checked={on}
                    onChange={e => {
                      e.stopPropagation();
                      const next = on ? callsignPools.filter(x => x !== p) : [...callsignPools, p];
                      if (next.length > 0 && setCallsignPool) setCallsignPool(next);
                    }}
                    style={{ accentColor: 'var(--rust)', cursor: 'pointer', width: 16, height: 16 }} />
                  {p}
                </label>
              );
            })}
          </div>
        )}

        <textarea
          className="txt"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes about this HE-V: pilot, paint scheme, role"
          style={{ marginBottom: 18 }}
        />

        <FieldLabel>Weight Class</FieldLabel>
        <div style={{ border: '1.5px solid var(--rule)' }}>
          {WC_ORDER.map((c, i) => {
            const w = WC[c];
            const selected = cls === c;
            return (
              <button
                key={c}
                onClick={() => setCls(c)}
                className="add-btn"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center', gap: 14,
                  padding: '12px 16px',
                  width: '100%',
                  background: selected ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${selected ? 'var(--rust)' : 'var(--rule-strong)'}`,
                  background: selected ? 'var(--rust)' : 'transparent',
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink)',
                }}>
                  {c}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                    color: selected ? 'var(--rust)' : 'var(--ink)',
                  }}>{w.tons}t</span>
                  <span style={{
                    display: 'block', fontSize: 10.5, color: 'var(--mute)',
                    fontFamily: 'var(--font-body)', letterSpacing: '0.06em',
                  }}>{w.slots} slots</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <TextButton onClick={onClose}>Cancel</TextButton>
          <PrimaryButton onClick={submit}>
            Add to Roster
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// OPTIONS MODAL: callsign pool + simple/advanced mode
// ============================================================

export function OptionsModal({
  open, onClose,
  callsignPool, setCallsignPool,
  customCallsigns, setCustomCallsigns,
  simpleMode, setSimpleMode,
  weaponSort, setWeaponSort,
  factionLogo, setFactionLogo,
}) {
  const [draft, setDraft] = useState(customCallsigns.join('\n'));

  useEffect(() => {
    if (open) setDraft(customCallsigns.join('\n'));
  }, [open, customCallsigns]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pick an image file (PNG, JPG, SVG, or WebP).');
      return;
    }
    if (file.size > 1024 * 1024) {
      alert('Image is larger than 1 MB. Compress it or pick a smaller one.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFactionLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    const list = draft.split('\n').map(s => s.trim()).filter(Boolean);
    setCustomCallsigns(list);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1.5px solid var(--ink)',
        background: 'var(--ink)', color: 'var(--surface)',
      }}>
        <div>
          <div className="display" style={{ fontSize: 19, letterSpacing: '0.18em' }}>
            Options
          </div>
          <div className="mono" style={{
            fontSize: 10.5, opacity: 0.7, marginTop: 2, letterSpacing: '0.18em',
          }}>
            FORGE PREFERENCES
          </div>
        </div>
        <button onClick={onClose} className="add-btn" style={{
          background: 'transparent', border: '1.5px solid var(--surface)',
          color: 'var(--surface)', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div style={{ padding: '22px' }}>
        {/* Mode toggle */}
        <FieldLabel>Mode</FieldLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          border: '1.5px solid var(--ink)', marginBottom: 8,
        }}>
          <button
            onClick={() => setSimpleMode(false)}
            className="add-btn"
            style={{
              padding: '12px 14px',
              background: !simpleMode ? 'var(--ink)' : 'transparent',
              color: !simpleMode ? 'var(--surface)' : 'var(--ink)',
              border: 'none',
              borderRight: '1.5px solid var(--ink)',
              cursor: 'pointer',
              fontFamily: 'var(--font-stencil)', fontSize: 13,
              fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              textAlign: 'left',
            }}
          >
            <div>Advanced</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 400,
              letterSpacing: 0, textTransform: 'none', marginTop: 4,
              opacity: 0.85,
            }}>
              Full game: factions, teams, advanced support, secondary agendas.
            </div>
          </button>
          <button
            onClick={() => setSimpleMode(true)}
            className="add-btn"
            style={{
              padding: '12px 14px',
              background: simpleMode ? 'var(--ink)' : 'transparent',
              color: simpleMode ? 'var(--surface)' : 'var(--ink)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-stencil)', fontSize: 13,
              fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              textAlign: 'left',
            }}
          >
            <div>Simple</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 400,
              letterSpacing: 0, textTransform: 'none', marginTop: 4,
              opacity: 0.85,
            }}>
              Core only: HE-Vs, off-table support, missions.
            </div>
          </button>
        </div>


        {/* Faction logo. Pick a shipped default or upload a custom one. */}
        <FieldLabel>Faction Logo</FieldLabel>
        <div style={{
          border: '1.5px dashed var(--rule-strong)',
          background: 'var(--bg-deep)',
          padding: '12px 14px',
          marginBottom: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            paddingBottom: 12, marginBottom: 12,
            borderBottom: '1px dotted var(--rule)',
          }}>
            <div style={{
              width: 60, height: 60, flexShrink: 0,
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {factionLogo ? (
                <img src={factionLogo} alt="Faction logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.18em' }}>
                  NO LOGO
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 6 }}>
      
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <label className="add-btn" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: '1.5px solid var(--ink)', background: 'transparent',
                  color: 'var(--ink)', padding: '6px 12px', cursor: 'pointer',
                  fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
                  letterSpacing: '0.10em', textTransform: 'uppercase',
                }}>
                  Upload Custom
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {factionLogo && (
                  <button onClick={() => setFactionLogo(null)} className="add-btn"
                    style={{
                      border: '1.5px solid var(--rust)', background: 'transparent',
                      color: 'var(--rust)', padding: '6px 12px', cursor: 'pointer',
                      fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                    }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <FactionLogoPicker selected={factionLogo} onPick={setFactionLogo} />
        </div>


        {/* Callsign pools - checkboxes, all on by default */}
        <FieldLabel>Weapon Sort Order</FieldLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[
            { id: 'cost', label: 'Cost (cheap first)' },
            { id: 'alpha', label: 'A–Z' },
          ].map(opt => (
            <button key={opt.id}
              onClick={() => setWeaponSort && setWeaponSort(opt.id)}
              className="add-btn"
              style={{
                border: '1.5px solid var(--ink)',
                background: weaponSort === opt.id ? 'var(--ink)' : 'transparent',
                color: weaponSort === opt.id ? 'var(--surface)' : 'var(--ink)',
                padding: '6px 14px', cursor: 'pointer',
                fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <FieldLabel>Callsign Pools</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          {[...POOL_NAMES, 'Custom'].map(p => {
            const on = callsignPool.includes(p);
            return (
              <label key={p} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', fontSize: 13, color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
              }}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setCallsignPool(
                    on ? callsignPool.filter(x => x !== p)
                       : [...callsignPool, p]
                  )}
                  style={{ accentColor: 'var(--rust)', width: 14, height: 14 }}
                />
                {p}
              </label>
            );
          })}
        </div>

        {callsignPool.includes('Custom') && (
          <>
            <FieldLabel>Custom Names</FieldLabel>
            <textarea
              className="txt"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={'One per line.\nIronwake\nSaturn Forge\nGravewright\n…'}
              style={{ minHeight: 160, fontFamily: 'var(--font-body)', fontSize: 13 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextButton onClick={onClose}>Cancel</TextButton>
              <PrimaryButton onClick={save}>Save</PrimaryButton>
            </div>
          </>
        )}

        {!callsignPool.includes('Custom') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton onClick={onClose}>Close</PrimaryButton>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// FACTION LOGO PICKER
// Gallery of shipped organization logos grouped by faction. Click any
// logo to set it as the active faction logo. The user's selection is
// converted to a data URL and stored alongside the rest of state.
// ============================================================
function FactionLogoPicker({ selected, onPick }) {
  const handlePick = async (filePath) => {
    const url = asset(filePath);
    try {
      // Fetch then convert to data URL so the choice persists in
      // localStorage even if the file path or build hash changes later.
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => onPick(reader.result);
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn('Could not load default logo:', e?.message || e);
      // Fall back to setting the URL directly.
      onPick(url);
    }
  };

  return (
    <div>
      {Object.entries(FACTION_LOGOS).map(([factionName, logos]) => (
        <div key={factionName} style={{ marginBottom: 12 }}>
          <div className="stencil" style={{
            fontSize: 10.5, color: 'var(--mute)', letterSpacing: '0.18em',
            marginBottom: 6,
          }}>
            {factionName}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 6,
          }}>
            {logos.map(l => (
              <button
                key={l.file}
                onClick={() => handlePick(l.file)}
                title={l.name}
                className="logo-tile"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--rule)',
                  padding: 4,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  aspectRatio: '1 / 1',
                }}
              >
                <img
                  src={asset(l.file)}
                  alt={l.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// LISTS MODAL: save / load / export / import named force builds.
// Saved lists are stored under 'forge-saved-lists-v1' in localStorage.
// ============================================================
const LISTS_KEY = 'forge-saved-lists-v1';

function loadSavedLists() {
  try {
    const raw = window.localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function persistSavedLists(obj) {
  try {
    window.localStorage.setItem(LISTS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Could not persist saved lists:', e?.message || e);
  }
}

export function ListsModal({ open, onClose, currentState, onLoad }) {
  const [lists, setLists] = useState({});
  const [saveName, setSaveName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (open) {
      setLists(loadSavedLists());
      setSaveName(currentState?.forceName || '');
      setConfirmDelete(null);
    }
  }, [open, currentState]);

  const sortedNames = Object.keys(lists).sort();

  const save = () => {
    const name = saveName.trim();
    if (!name) return;
    const next = { ...lists, [name]: { ...currentState, savedAt: Date.now() } };
    setLists(next);
    persistSavedLists(next);
    setSaveName('');
  };

  const remove = (name) => {
    const next = { ...lists };
    delete next[name];
    setLists(next);
    persistSavedLists(next);
    setConfirmDelete(null);
  };

  const load = (name) => {
    const data = lists[name];
    if (!data) return;
    onLoad(data);
    onClose();
  };

  // Export current build to a JSON file the user can save anywhere.
  const exportCurrent = () => {
    const safeName = (currentState?.forceName || 'force').replace(/[^a-z0-9_-]/gi, '_');
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.forge.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onLoad(data);
        onClose();
      } catch (err) {
        alert('Could not parse that file as a saved force.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal open={open} onClose={onClose} title="Saved Lists" maxWidth={620}>
      <div style={{ padding: '18px 22px 22px', maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Save current */}
        <FieldLabel>Save current build</FieldLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }}
            placeholder="List name"
            style={{
              flex: 1,
              border: '1.5px solid var(--rule-strong)',
              background: 'var(--surface)',
              padding: '8px 10px',
              fontFamily: 'var(--font-body)',
              fontSize: 14, color: 'var(--ink)', outline: 'none',
            }}
          />
          <button
            onClick={save}
            disabled={!saveName.trim()}
            className="add-btn"
            style={{
              background: saveName.trim() ? 'var(--olive)' : 'var(--bg-deep)',
              color: saveName.trim() ? 'var(--surface)' : 'var(--mute)',
              border: '2px solid ' + (saveName.trim() ? 'var(--olive-deep)' : 'var(--rule)'),
              padding: '6px 16px', cursor: saveName.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-stencil)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
            }}
          >
            Save
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 22, lineHeight: 1.5 }}>
          Saving with an existing name overwrites that list. Saves stay on this device.
        </div>

        {/* Saved list grid */}
        <FieldLabel>Saved builds ({sortedNames.length})</FieldLabel>
        {sortedNames.length === 0 ? (
          <div style={{
            border: '1.5px dashed var(--rule)', padding: 18, textAlign: 'center',
            color: 'var(--mute)', fontSize: 13, marginBottom: 22,
          }}>
            No saved builds yet.
          </div>
        ) : (
          <div style={{ marginBottom: 22, border: '1px solid var(--rule)', background: 'var(--surface)' }}>
            {sortedNames.map(name => {
              const list = lists[name];
              const ago = list.savedAt ? new Date(list.savedAt).toLocaleDateString() : '';
              const summary = `${list.mechs?.length || 0} HE-V · ${list.supportAssets?.length || 0} support · ${list.faction || 'no faction'}`;
              return (
                <div key={name} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 10, alignItems: 'center',
                  padding: '10px 12px',
                  borderTop: '1px solid var(--rule)',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 16, fontWeight: 700, color: 'var(--ink)',
                      letterSpacing: '0.02em', textTransform: 'uppercase',
                    }}>
                      {name}
                    </div>
                    <div className="mono" style={{
                      fontSize: 11, color: 'var(--mute)', marginTop: 2,
                    }}>
                      {summary}{ago ? ` · saved ${ago}` : ''}
                    </div>
                  </div>
                  {confirmDelete === name ? (
                    <>
                      <button
                        onClick={() => remove(name)}
                        style={smallBtn('var(--rust)', 'var(--surface)', 'var(--rust)')}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={smallBtn('transparent', 'var(--ink-2)', 'var(--rule)')}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => load(name)}
                        style={smallBtn('var(--ink)', 'var(--surface)', 'var(--ink)')}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => setConfirmDelete(name)}
                        style={smallBtn('transparent', 'var(--rust)', 'var(--rust)')}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Export / import */}
        <FieldLabel>Backup & transfer</FieldLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <button
            onClick={exportCurrent}
            className="add-btn"
            style={smallBtn('transparent', 'var(--ink)', 'var(--rule-strong)')}
          >
            Export current as JSON
          </button>
          <label
            className="add-btn"
            style={{ ...smallBtn('transparent', 'var(--ink)', 'var(--rule-strong)'), display: 'inline-flex' }}
          >
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={importFromFile}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div style={{ fontSize: 12, color: 'var(--mute)', lineHeight: 1.5 }}>
          Export downloads a file you can mail to yourself or share. Import replaces your current build.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <PrimaryButton onClick={onClose}>Close</PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

function smallBtn(bg, color, border) {
  return {
    background: bg,
    color,
    border: `1.5px solid ${border}`,
    padding: '6px 12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-stencil)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}
