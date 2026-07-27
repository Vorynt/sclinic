import type { JSONContent } from "@tiptap/react"

import type {
  ClinicalNoteTemplate,
  ClinicalNoteTemplateField,
} from "@/modules/medical-records/constants/clinical-note-templates"

export type CompileClinicalNoteFormResult = {
  content: JSONContent
  plainText: string
}

function heading(text: string): JSONContent {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text }],
  }
}

function paragraph(text: string): JSONContent {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  }
}

function bulletList(items: string[]): JSONContent {
  return {
    type: "bulletList",
    content: items.map((text) => ({
      type: "listItem",
      content: [paragraph(text)],
    })),
  }
}

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

function optionLabel(
  field: ClinicalNoteTemplateField,
  value: string,
): string {
  return field.options?.find((option) => option.value === value)?.label ?? value
}

function formatSwitch(value: unknown): string {
  return value === true ? "Sim" : "Não"
}

function formatFieldValue(
  field: ClinicalNoteTemplateField,
  values: Record<string, unknown>,
): JSONContent[] {
  const raw = values[field.id]

  switch (field.type) {
    case "section":
      return [heading(field.label)]
    case "switch": {
      // Always emit switches so yes/no answers are visible in the note.
      return [paragraph(`${field.label}: ${formatSwitch(raw)}`)]
    }
    case "text":
    case "textarea": {
      if (isBlank(raw)) return []
      const text = String(raw).trim()
      return [paragraph(`${field.label}: ${text}`)]
    }
    case "select": {
      if (isBlank(raw)) return []
      const value = String(raw)
      return [paragraph(`${field.label}: ${optionLabel(field, value)}`)]
    }
    case "checklist": {
      if (!Array.isArray(raw) || raw.length === 0) return []
      const labels = raw.map((item) => optionLabel(field, String(item)))
      return [paragraph(`${field.label}:`), bulletList(labels)]
    }
    default:
      return []
  }
}

function collectPlainText(nodes: JSONContent[]): string {
  const lines: string[] = []
  for (const node of nodes) {
    if (node.type === "heading") {
      const text = node.content?.[0]?.text
      if (typeof text === "string") lines.push(text)
      continue
    }
    if (node.type === "paragraph") {
      const text = node.content?.[0]?.text
      if (typeof text === "string") lines.push(text)
      continue
    }
    if (node.type === "bulletList" && Array.isArray(node.content)) {
      for (const item of node.content) {
        const para = item.content?.[0]
        const text = para?.content?.[0]?.text
        if (typeof text === "string") lines.push(`- ${text}`)
      }
    }
  }
  return lines.join("\n").trim()
}

/**
 * Compiles structured form values into TipTap JSON + plain text.
 * Empty text/select/checklist fields are omitted; switches always render.
 * Sections without any following content are dropped.
 */
export function compileClinicalNoteForm(
  template: ClinicalNoteTemplate,
  values: Record<string, unknown>,
): CompileClinicalNoteFormResult {
  const nodes: JSONContent[] = []
  let pendingSection: JSONContent | null = null

  function flushSection() {
    pendingSection = null
  }

  function pushWithSection(parts: JSONContent[]) {
    if (parts.length === 0) return
    if (pendingSection) {
      nodes.push(pendingSection)
      pendingSection = null
    }
    nodes.push(...parts)
  }

  for (const field of template.fields) {
    if (field.type === "section") {
      flushSection()
      pendingSection = heading(field.label)
      continue
    }
    pushWithSection(formatFieldValue(field, values))
  }

  const content: JSONContent =
    nodes.length > 0
      ? { type: "doc", content: nodes }
      : { type: "doc", content: [paragraph("")] }

  const plainText = collectPlainText(nodes)

  return { content, plainText }
}

/** True when compiled note would have no meaningful text. */
export function isCompiledNoteEmpty(plainText: string): boolean {
  return plainText.trim().length === 0
}
