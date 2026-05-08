import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip } from './tooltip';
import { defineToken, resolveTraitDefs } from '../glossary';

// Schibsted Grotesk for buttons (was Chakra Petch; restricted now to banner heads only)
const stencilButton = {
  fontFamily: 'var(--font-stencil)',
  textTransform: 'uppercase',
};

// Solid primary CTA. Used sparingly
export function PrimaryButton({ children, onClick, icon: Icon, disabled, fullWidth }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="add-btn"
      style={{
        ...stencilButton,
        background: disabled ? 'var(--bg-deep)' : 'var(--ink)',
        color: disabled ? 'var(--mute)' : 'var(--surface)',
        border: 'none',
        padding: '12px 18px',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.14em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        gap: 10,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

// Outlined secondary action
export function GhostButton({ children, onClick, icon: Icon, disabled, fullWidth, accent = 'ink' }) {
  const colorMap = { ink: 'var(--ink)', rust: 'var(--rust)', olive: 'var(--olive)' };
  const c = colorMap[accent];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="add-btn"
      style={{
        ...stencilButton,
        background: 'transparent',
        color: disabled ? 'var(--mute)' : c,
        border: `1.5px solid ${disabled ? 'var(--rule)' : c}`,
        padding: '10px 14px',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.12em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        gap: 8,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {Icon && <Icon size={15} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

// Pure text link button. Low-emphasis actions
export function TextButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: '5px 2px',
        color: disabled ? 'var(--mute)' : 'var(--ink-2)',
        fontSize: 13,
        textDecoration: 'underline',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </button>
  );
}

// Tiny circular +/- buttons used in catalog rows
export function StepButton({ direction, onClick, disabled, accent = 'olive', label, title }) {
  const c = accent === 'olive' ? 'var(--olive)' : 'var(--rust)';
  // When a label is provided (e.g. "6t" for next-copy cost), use a tighter
  // typographic style than the default symbolic + / − glyph.
  const hasLabel = label != null && label !== '';
  const symbolFont = { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 };
  const labelFont = { fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' };

  // Click feedback: bumping a counter creates a new key on the pulse ring so
  // the CSS animation re-fires every press, not just the first one.
  const [pulseId, setPulseId] = useState(0);
  const handleClick = (e) => {
    if (disabled) return;
    setPulseId(id => id + 1);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`step-hover step-button step-button--${accent} ${direction === 'up' ? 'step-button--up' : 'step-button--down'}`}
      title={title}
      style={{
        width: 36, height: 32,
        border: `1.5px solid ${disabled ? 'var(--rule)' : c}`,
        background: direction === 'up' ? c : 'var(--surface)',
        color: direction === 'up' ? 'var(--surface)' : c,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        padding: 0,
        position: 'relative',
        ...(hasLabel ? labelFont : symbolFont),
      }}
    >
      <span style={{ position: 'relative', zIndex: 2, lineHeight: 1 }}>
        {hasLabel ? label : (direction === 'up' ? '+' : '−')}
      </span>
      {pulseId > 0 && (
        <span
          key={pulseId}
          aria-hidden="true"
          className="step-pulse-ring"
          style={{ borderColor: c }}
        />
      )}
    </button>
  );
}

// Material Design "edit" pencil used as a hover affordance on left-rail
// cards and team chips. The parent needs class "has-edit-hint" plus
// position: relative; the CSS controls the fade-in on hover.
export function HoverEditHint({ size = 'md' }) {
  const s = size === 'sm' ? 11 : 13;
  return (
    <span className="hover-edit-hint" aria-hidden="true">
      <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      <span className="hover-edit-hint-label">Edit</span>
    </span>
  );
}

// Pill / chip used for the mission-size selector
export function Chip({ active, onClick, children, accent = 'ink' }) {
  const colorMap = {
    ink: 'var(--ink)',
    rust: 'var(--rust)',
    olive: 'var(--olive)',
    steel: 'var(--steel)',
  };
  const c = colorMap[accent];
  return (
    <button
      onClick={onClick}
      className={`chip-hover ${active ? 'is-active' : ''}`}
      style={{
        ...stencilButton,
        background: active ? c : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink)',
        border: `1.5px solid ${active ? c : 'var(--rule-strong)'}`,
        padding: '7px 12px',
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: '0.12em',
        cursor: 'pointer',
        display: 'inline-block',
      }}
    >
      {children}
    </button>
  );
}

// Section heading
export function SectionTitle({ children, tag, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      borderBottom: '2px solid var(--ink)',
      paddingBottom: 5,
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{
          fontFamily: 'var(--font-stencil)',
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {children}
        </h2>
        {tag && (
          <span className="mono" style={{ fontSize: 12, color: 'var(--mute)' }}>
            [{tag}]
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// Tiny label above an input
export function FieldLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-stencil)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      marginBottom: 6,
      color: 'var(--ink)',
    }}>
      {children}
    </div>
  );
}

// Modal shell
export function Modal({ open, onClose, children, width = 560 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20, 17, 13, 0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '6vh 16px 16px',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scroll"
        style={{
          width: '100%', maxWidth: width, maxHeight: '88vh', overflow: 'auto',
          background: 'var(--surface)',
          border: '2px solid var(--ink)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Bigger, more obvious row-expand button. Used in catalog and panel rows
// where the previous tiny chevron was too easy to miss.
export function RowExpand({ open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`row-expand ${open ? 'open' : ''}`}
      title={open ? 'Collapse' : 'Expand for full rules'}
      aria-label={open ? 'Collapse' : 'Expand'}
    >
      {open ? '−' : '+'}
    </button>
  );
}

// Trait token wrapped in tooltip for definition on hover or tap
export function TraitToken({ token, displayOverride }) {
  const def = defineToken(token);
  const display = displayOverride || (def ? def.title : token.charAt(0).toUpperCase() + token.slice(1));

  if (!def) {
    // Unknown trait. Render plain text without a tooltip.
    return <span style={{ fontSize: 'inherit' }}>{display}</span>;
  }

  return (
    <Tooltip title={def.title} body={def.bullets ? def.bullets.join(' ') : def.text}>
      <span className="tok" style={{ fontSize: 'inherit' }}>
        {display}
      </span>
    </Tooltip>
  );
}

// Render a comma-list of traits with each token clickable/hoverable
export function TraitList({ traits }) {
  if (!traits) return null;
  const parts = traits.split(/,\s*/);
  return (
    <span style={{ lineHeight: 1.6 }}>
      {parts.map((part, i) => {
        // Build the lookup key: full phrase minus parentheticals, lowercase
        const displayParen = part.match(/\s*(\([^)]*\))\s*$/)?.[1] || '';
        const phraseKey = part.replace(/\s*\([^)]*\)/g, '').replace(/"/g, '').trim().toLowerCase();
        return (
          <React.Fragment key={i}>
            <TraitToken token={phraseKey} displayOverride={part.replace(/\s*\([^)]*\)/g, '').trim()} />
            {displayParen && <span style={{ color: 'var(--ink-2)' }}> {displayParen}</span>}
            {i < parts.length - 1 && <span style={{ color: 'var(--mute)' }}>, </span>}
          </React.Fragment>
        );
      })}
    </span>
  );
}

// Pull the trait keywords out of a comma-separated trait string.
// "Blast (6\"), Limited (3)" → ["blast", "limited"]
export function collectTraits(str) {
  if (!str) return [];
  const seen = new Set();
  str.split(/,\s*/).forEach(part => {
    // Strip trailing parentheticals and quotes, then take the full word sequence
    const clean = part.replace(/\s*\([^)]*\)/g, '').replace(/"/g, '').trim();
    const key = clean.toLowerCase();
    if (key) seen.add(key);
  });
  return [...seen];
}

// Inline glossary block: shows every referenced trait with its full rule text.
// Use after expanding a row so the user sees all the rules without having to
// hover each tag.
// Pass traitStr (raw comma-separated trait string) to get X-value resolved definitions.
// Falls back to the old key-array path for backwards compatibility.

const ORDER_WORDS = new Set([
  'ENGAGE','SMASH','MOVE','JUMP','SUPPORT','CAPTURE','LOCK ON','OVERDRIVE',
  'DASH','RETURN FIRE','FLYING MOVE',
]);

export function RulesText({ text, size = 13 }) {
  if (!text) return null;
  const parts = text.split(/(\bENGAGE\b|\bSMASH\b|\bMOVE\b|\bJUMP\b|\bSUPPORT\b|\bCAPTURE\b|\bLOCK ON\b|\bOVERDRIVE\b|\bDASH\b|\bRETURN FIRE\b|\bFLYING MOVE\b)/g);
  return (
    <span style={{ fontSize: size, lineHeight: 1.65, color: 'var(--ink-2)' }}>
      {parts.map((part, i) =>
        ORDER_WORDS.has(part)
          ? <span key={i} style={{
              fontFamily: 'var(--font-stencil)', fontWeight: 700,
              fontSize: size - 1, letterSpacing: '0.06em', color: 'var(--ink)',
              background: 'rgba(21,17,13,0.07)', borderRadius: 2, padding: '0 3px',
            }}>{part}</span>
          : part
      )}
    </span>
  );
}

export function InlineTraitGlossary({ traits, traitStr, cls }) {
  const defs = traitStr
    ? resolveTraitDefs(traitStr, cls)
    : (traits || []).map(t => { const d = defineToken(t); return d ? { key: t, ...d } : null; }).filter(Boolean);
  if (!defs || defs.length === 0) return null;
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dotted var(--rule)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {defs.map((def) => (
          <div key={def.key || def.title} style={{ borderLeft: '2px solid var(--rule-strong)', paddingLeft: 10 }}>
            <div style={{
              fontFamily: 'var(--font-stencil)', fontSize: 11.5, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 4,
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span>{def.title}</span>
              {def.page && (
                <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 400, color: 'var(--mute)', letterSpacing: '0.04em', textTransform: 'none' }}>
                  p. {def.page}
                </span>
              )}
            </div>
            {def.bullets ? (
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {def.bullets.map((b, i) => <li key={i}><RulesText text={b} size={12} /></li>)}
              </ul>
            ) : (
              <RulesText text={def.text} size={12.5} />
            )}
            {def.note && (
              <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--mute)', fontStyle: 'italic', lineHeight: 1.55 }}>
                {def.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

