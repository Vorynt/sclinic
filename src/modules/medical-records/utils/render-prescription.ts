import type { PrescriptionPartySnapshot } from "@/db/schema"

export type PrescriptionRenderContext = {
  layoutHtml: string
  body: string
  clinic: PrescriptionPartySnapshot
  patient: PrescriptionPartySnapshot
  professional: PrescriptionPartySnapshot | null
  issuedAt: Date | null
  /** Locale for date formatting. */
  locale?: string
}

function formatCouncil(snapshot: PrescriptionPartySnapshot | null): string {
  if (!snapshot) return ""
  const parts = [
    snapshot.councilType,
    snapshot.councilNumber,
    snapshot.councilState ? `/${snapshot.councilState}` : null,
  ].filter(Boolean)
  return parts.join(" ").replace(" /", "/").trim()
}

function formatIssuedAt(issuedAt: Date | null, locale: string): string {
  if (!issuedAt) return ""
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(issuedAt)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function replaceAll(haystack: string, placeholder: string, value: string): string {
  return haystack.replace(
    new RegExp(escapeRegExp(placeholder), "g"),
    value ?? "",
  )
}

/**
 * Injects party snapshots + body into a letterhead HTML template.
 * Does not re-sanitize; callers should sanitize layout/body on write.
 */
export function renderPrescriptionHtml(
  ctx: PrescriptionRenderContext,
): string {
  const locale = ctx.locale ?? "pt-BR"
  const clinic = ctx.clinic
  const patient = ctx.patient
  const professional = ctx.professional

  let html = ctx.layoutHtml
  html = replaceAll(html, "{{clinic.name}}", clinic.name ?? "")
  html = replaceAll(html, "{{clinic.document}}", clinic.document ?? "")
  html = replaceAll(html, "{{clinic.addressLine}}", clinic.addressLine ?? "")
  html = replaceAll(html, "{{clinic.phone}}", clinic.phone ?? "")
  html = replaceAll(html, "{{clinic.email}}", clinic.email ?? "")
  html = replaceAll(html, "{{patient.name}}", patient.name ?? "")
  html = replaceAll(html, "{{patient.document}}", patient.document ?? "")
  html = replaceAll(html, "{{professional.name}}", professional?.name ?? "")
  html = replaceAll(
    html,
    "{{professional.council}}",
    formatCouncil(professional),
  )
  html = replaceAll(
    html,
    "{{professional.specialty}}",
    professional?.specialty ?? "",
  )
  html = replaceAll(html, "{{body}}", ctx.body ?? "")
  html = replaceAll(
    html,
    "{{issuedAt}}",
    formatIssuedAt(ctx.issuedAt, locale),
  )
  return html
}
