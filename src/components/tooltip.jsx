import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

// Tooltip wrapper. Wraps any inline element (a trait token).
// - Desktop: hover opens, leave closes (small delay to allow moving onto tooltip if needed)
// - Mobile/touch: tap toggles
// Positions itself with position: fixed, computed against the viewport so it's
// never clipped by an overflow:hidden parent.
export function Tooltip({ children, title, body }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const closeTimer = useRef(null);

  const computePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const margin = 12;

    // Default: above the trigger, horizontally aligned to its left
    let left = trigger.left;
    let top = trigger.top - th - 8;

    // Flip below if no room above
    if (top < margin) top = trigger.bottom + 8;

    // Clamp horizontally
    if (left + tw > window.innerWidth - margin) {
      left = window.innerWidth - tw - margin;
    }
    if (left < margin) left = margin;

    setPos({ left, top });
  }, []);

  useEffect(() => {
    if (!open) { setPos(null); return; }
    // Compute after the tooltip has rendered with its content
    requestAnimationFrame(computePosition);
  }, [open, title, body, computePosition]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, computePosition]);

  // Click outside / press escape to close (mainly for the touch case)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (tooltipRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => { cancelClose(); setOpen(true); }}
        onMouseLeave={scheduleClose}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{ display: 'inline' }}
      >
        {children}
      </span>
      {open && ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          className="tooltip-popover"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed',
            left: pos?.left ?? 0,
            top: pos?.top ?? 0,
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          {title && <div className="tooltip-title">{title}</div>}
          {body && <div style={{ whiteSpace: 'pre-line' }}>{body}</div>}
        </div>,
        document.body
      )}
    </>
  );
}
