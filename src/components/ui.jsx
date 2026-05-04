import React from 'react';

// Buttons here are deliberately not a single component spitting out variants.
// Different actions get different shapes — a primary CTA looks nothing like
// an inline +/- stepper, and that's the point.

// Solid primary CTA — used sparingly, for "Add HE-V", "Confirm", "Print"
export function PrimaryButton({ children, onClick, icon: Icon, disabled, fullWidth }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'var(--bg-deep)' : 'var(--ink)',
        color: disabled ? 'var(--mute)' : 'var(--surface)',
        border: 'none',
        padding: '12px 18px',
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        gap: 10,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {Icon && <Icon size={15} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

// Outlined secondary action — most buttons in the app
export function GhostButton({ children, onClick, icon: Icon, disabled, fullWidth, accent = 'ink' }) {
  const colorMap = {
    ink: 'var(--ink)',
    rust: 'var(--rust)',
    olive: 'var(--olive)',
  };
  const c = colorMap[accent];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        color: disabled ? 'var(--mute)' : c,
        border: `1.5px solid ${disabled ? 'var(--rule)' : c}`,
        padding: '10px 14px',
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        gap: 8,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {Icon && <Icon size={14} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

// Pure text link button — for low-emphasis actions ("clear", "cancel")
export function TextButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px 2px',
        color: disabled ? 'var(--mute)' : 'var(--ink-2)',
        fontSize: 12,
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
export function StepButton({ direction, onClick, disabled, accent = 'olive' }) {
  const c = accent === 'olive' ? 'var(--olive)' : 'var(--rust)';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28,
        border: `1.5px solid ${disabled ? 'var(--rule)' : c}`,
        background: direction === 'up' ? c : 'var(--surface)',
        color: direction === 'up' ? 'var(--surface)' : c,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
        opacity: disabled ? 0.4 : 1,
        padding: 0,
      }}
    >
      {direction === 'up' ? '+' : '−'}
    </button>
  );
}

// Pill / chip — used for the mission-size selector and similar small toggles.
// Distinctive look: hard rectangle, not rounded, deliberate retro-data feel
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
      style={{
        background: active ? c : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink)',
        border: `1.5px solid ${active ? c : 'var(--rule-strong)'}`,
        padding: '6px 10px',
        fontFamily: 'var(--font-display)',
        fontSize: 11.5,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        cursor: 'pointer',
        display: 'inline-block',
      }}
    >
      {children}
    </button>
  );
}

// Section heading — keeps a strong rule under the title and a tag in the right margin
export function SectionTitle({ children, tag, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      borderBottom: '2px solid var(--ink)',
      paddingBottom: 4,
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {children}
        </h2>
        {tag && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--mute)' }}>
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
      fontFamily: 'var(--font-display)',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      marginBottom: 6,
      color: 'var(--ink)',
    }}>
      {children}
    </div>
  );
}

// Modal shell — centered overlay with parchment-colored dialog
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

// Trait token — clickable, surfaces a definition in the glossary panel
export function TraitToken({ token, active, onClick }) {
  const display = token.charAt(0).toUpperCase() + token.slice(1);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onClick(token); }}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(token); }}
      className={`tok ${active ? 'active' : ''}`}
      style={{
        fontSize: 11.5,
        marginRight: 4,
      }}
    >
      {display}
    </span>
  );
}

// Render a comma-list of traits with each token clickable
export function TraitList({ traits, activeToken, onToken }) {
  if (!traits) return null;
  // Split on commas but preserve parenthesized sub-content like "Blast (3")"
  const parts = traits.split(/,\s*/);
  return (
    <span style={{ lineHeight: 1.6 }}>
      {parts.map((part, i) => {
        // Pull the keyword (first word, optionally hyphenated, until a paren or end)
        const m = part.match(/^([A-Za-z\-]+)(.*)$/);
        if (!m) return <span key={i}>{part}{i < parts.length - 1 ? ', ' : ''}</span>;
        const [, kw, rest] = m;
        const tokenKey = kw.toLowerCase();
        return (
          <React.Fragment key={i}>
            <TraitToken token={tokenKey} active={activeToken === tokenKey} onClick={onToken} />
            {rest && <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{rest}</span>}
            {i < parts.length - 1 && <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>, </span>}
          </React.Fragment>
        );
      })}
    </span>
  );
}
