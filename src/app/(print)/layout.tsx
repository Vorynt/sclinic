import type { ReactNode } from "react";

/**
 * Minimal chrome for print surfaces (prescription letterhead, billing report).
 * Always a white sheet: dark theme on html/body otherwise prints as a black PDF frame.
 */
export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          background: #fff !important;
          color-scheme: light !important;
        }
      `}</style>
      <div className="min-h-svh bg-white text-black print:bg-white">
        {children}
      </div>
    </>
  );
}
