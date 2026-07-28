import {
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
  compilePrescriptionTemplate,
} from "@/modules/medical-records/prescription-template-designer"

/**
 * System default letterhead HTML — compiled from DocumentModel (ADR-008).
 * Clinics without custom templates use this at preview/issue.
 *
 * Placeholders:
 * {{clinic.name}} {{clinic.document}} {{clinic.addressLine}} {{clinic.phone}} {{clinic.email}}
 * {{patient.name}} {{patient.document}}
 * {{professional.name}} {{professional.council}} {{professional.specialty}}
 * {{body}} {{issuedAt}}
 */
export const DEFAULT_PRESCRIPTION_LAYOUT_HTML = compilePrescriptionTemplate(
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
)

export const PRESCRIPTION_LAYOUT_PLACEHOLDERS = [
  "{{clinic.name}}",
  "{{clinic.document}}",
  "{{clinic.addressLine}}",
  "{{clinic.phone}}",
  "{{clinic.email}}",
  "{{patient.name}}",
  "{{patient.document}}",
  "{{professional.name}}",
  "{{professional.council}}",
  "{{professional.specialty}}",
  "{{body}}",
  "{{issuedAt}}",
] as const
