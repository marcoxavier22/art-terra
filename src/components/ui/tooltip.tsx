import * as React from 'react';

/**
 * Lightweight CSS tooltip (hover + keyboard focus). The accessible name still comes
 * from the child's own `aria-label`; this bubble is the visual hint only.
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        aria-hidden
        className="bg-ink shadow-lift pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 origin-bottom-left scale-95 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition duration-150 group-focus-within/tip:scale-100 group-focus-within/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
