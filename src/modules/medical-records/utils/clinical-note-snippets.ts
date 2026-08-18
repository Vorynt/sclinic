import type { JSONContent } from "@tiptap/react"

import {
  CLINICAL_NOTE_TEMPLATES,
  type ClinicalNoteTemplateId,
} from "@/modules/medical-records/constants/clinical-note-templates"

export type ClinicalNoteSnippet = {
  id: ClinicalNoteTemplateId
  label: string
  description: string
  content: JSONContent[]
}

function heading(text: string): JSONContent {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text }],
  }
}

const EMPTY_PARAGRAPH: JSONContent = { type: "paragraph" }

function section(title: string): JSONContent[] {
  return [heading(title), EMPTY_PARAGRAPH]
}

const SNIPPET_CONTENT: Record<
  Exclude<ClinicalNoteTemplateId, "blank">,
  JSONContent[]
> = {
  soap: [
    ...section("S — Subjetivo"),
    ...section("O — Objetivo"),
    ...section("A — Avaliação"),
    ...section("P — Plano"),
  ],
  follow_up: [
    ...section("Contexto do retorno"),
    ...section("Evolução"),
    ...section("Adesão e tratamento"),
    ...section("Exame físico de hoje"),
    ...section("Plano atualizado"),
  ],
  first_visit: [
    ...section("Queixa principal"),
    ...section("História da doença atual"),
    ...section("Antecedentes pessoais"),
    ...section("Antecedentes familiares"),
    ...section("Exame físico"),
    ...section("Hipóteses diagnósticas"),
    ...section("Plano e conduta"),
  ],
  procedure: [
    ...section("Identificação do procedimento"),
    ...section("Preparação"),
    ...section("Descrição técnica"),
    ...section("Intercorrências"),
    ...section("Pós-procedimento"),
  ],
}

export const CLINICAL_NOTE_SNIPPETS: ClinicalNoteSnippet[] =
  CLINICAL_NOTE_TEMPLATES.filter((template) => template.id !== "blank").map(
    (template) => ({
      id: template.id,
      label: template.label,
      description: template.description,
      content: SNIPPET_CONTENT[template.id as Exclude<ClinicalNoteTemplateId, "blank">],
    }),
  )

export function getClinicalNoteSnippet(
  id: ClinicalNoteTemplateId,
): ClinicalNoteSnippet | null {
  return CLINICAL_NOTE_SNIPPETS.find((snippet) => snippet.id === id) ?? null
}
