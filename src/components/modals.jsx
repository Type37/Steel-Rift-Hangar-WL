import React, { useState, useEffect } from 'react';
import { X, Dices } from 'lucide-react';
import { WC, WC_ORDER } from '../data';
import { POOL_NAMES, rollCallsign } from '../callsigns';
import { Modal, FieldLabel, PrimaryButton, TextButton, Chip } from './ui';

// ============================================================
// ADD HE-V MODAL
// ============================================================

export function AddMechModal({ open, onClose, onConfirm, callsignPool, customCallsigns }) {
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

  const roll = () => setName(rollCallsign(callsignPool, customCallsigns));
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
          <button
            onClick={roll}
            title={`Roll a name from the ${callsignPool} pool`}
            className="add-btn"
            style={{
              border: '1px solid var(--rule)', background: 'var(--surface)',
              padding: '0 16px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-stencil)', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)',
              flexShrink: 0,
            }}
          >
            <Dices size={15} strokeWidth={2.25} />
            Roll
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 18 }}>
          Pool: <strong style={{ color: 'var(--ink-2)' }}>{callsignPool}</strong>. Change in Options.
        </div>

        <FieldLabel>Description (optional)</FieldLabel>
        <textarea
          className="txt"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes about this HE-V: pilot, paint scheme, role"
          style={{ marginBottom: 18 }}
        />

        <FieldLabel>Weight Class</FieldLabel>
        <div style={{ border: '1.5px solid var(--rule)', background: 'var(--bg)' }}>
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
                  gridTemplateColumns: 'auto 1fr auto auto',
                  alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  width: '100%',
                  background: selected ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `2px solid ${selected ? 'var(--ink)' : 'var(--rule-strong)'}`,
                  background: selected ? 'var(--ink)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--surface)', fontWeight: 700, fontSize: 14,
                }}>
                  {selected && '✕'}
                </span>
                <span className="stencil" style={{ fontSize: 17, color: 'var(--ink)' }}>
                  {c}
                </span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--mute)' }}>
                  {w.slots} slots · {w.baseArmor}A / {w.baseStructure}S base
                </span>
                <span className="mono" style={{
                  fontSize: 17, fontWeight: 700, color: 'var(--rust)', minWidth: 46, textAlign: 'right',
                }}>
                  {w.tons}t
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
}) {
  const [draft, setDraft] = useState(customCallsigns.join('\n'));

  useEffect(() => {
    if (open) setDraft(customCallsigns.join('\n'));
  }, [open, customCallsigns]);

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
        <div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 22, lineHeight: 1.5 }}>
          Switching modes hides the optional sections. Your choices in those sections are kept and reapplied if you switch back.
        </div>

        {/* Callsign pool */}
        <FieldLabel>Callsign Pool</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {POOL_NAMES.map(p => (
            <Chip key={p} active={callsignPool === p} onClick={() => setCallsignPool(p)}>
              {p}
            </Chip>
          ))}
          <Chip active={callsignPool === 'Custom'} onClick={() => setCallsignPool('Custom')}>
            Custom
          </Chip>
        </div>
        <div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 18, lineHeight: 1.5 }}>
          The Roll button in the Add HE-V dialog draws from the active pool.
        </div>

        {callsignPool === 'Custom' && (
          <>
            <FieldLabel>Custom Names</FieldLabel>
            <textarea
              className="txt"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={'One per line.\nIronwake\nSaturn Forge\nGravewright\n…'}
              style={{ minHeight: 160, fontFamily: 'var(--font-mono)', fontSize: 13 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextButton onClick={onClose}>Cancel</TextButton>
              <PrimaryButton onClick={save}>Save</PrimaryButton>
            </div>
          </>
        )}

        {callsignPool !== 'Custom' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton onClick={onClose}>Close</PrimaryButton>
          </div>
        )}
      </div>
    </Modal>
  );
}
