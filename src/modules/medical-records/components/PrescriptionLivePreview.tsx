"use client";

import { useMemo } from "react";

import type { PrescriptionPartySnapshot } from "@/db/schema";
import { cn } from "@/lib/utils";
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription";

/** A4 CSS pixels at 96dpi — same box used for print fidelity. */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

type PrescriptionLivePreviewProps = {
  layoutHtml: string;
  body: string;
  clinic: PrescriptionPartySnapshot;
  patient: PrescriptionPartySnapshot;
  professional: PrescriptionPartySnapshot | null;
  className?: string;
  /** Scale of the A4 sheet inside the panel (0–1). */
  scale?: number;
};

/**
 * Live print preview using the same HTML pipeline as issue/print.
 * Renders a full A4 page scaled down so the preview matches printed output.
 */
export function PrescriptionLivePreview({
  layoutHtml,
  body,
  clinic,
  patient,
  professional,
  className,
  scale = 0.42,
}: PrescriptionLivePreviewProps) {
  const html = useMemo(
    () =>
      renderPrescriptionHtml({
        layoutHtml,
        body: body.trim()
          ? body
          : '<p style="color:#888">O conteúdo da receita aparece aqui…</p>',
        clinic,
        patient,
        professional,
        issuedAt: new Date(),
      }),
    [layoutHtml, body, clinic, patient, professional],
  );

  return (
    <div
      className={cn(
        "flex justify-center overflow-auto rounded-md border border-border bg-neutral-200/90",
        className,
      )}>
      <div
        className="my-4"
        style={{
          width: A4_WIDTH_PX * scale,
          height: A4_HEIGHT_PX * scale,
        }}>
        <div
          className="bg-white shadow-md"
          style={{
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}>
          <iframe
            title="Visualização da receita"
            srcDoc={html}
            width={A4_WIDTH_PX}
            height={A4_HEIGHT_PX}
            className="pointer-events-none block border-0"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
