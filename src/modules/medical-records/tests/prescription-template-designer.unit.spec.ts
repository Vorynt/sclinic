import { describe, expect, it } from "@jest/globals"

import {
  DEFAULT_PRESCRIPTION_ACCENT_COLOR,
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
  compilePrescriptionTemplate,
  createBlockDefaults,
  prescriptionDocumentModelSchema,
  type PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("prescriptionDocumentModelSchema", () => {
  it("accepts the system default model", () => {
    const parsed = prescriptionDocumentModelSchema.parse(
      DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
    )
    expect(parsed.version).toBe(1)
    expect(parsed.accentColor).toBe(DEFAULT_PRESCRIPTION_ACCENT_COLOR)
    expect(parsed.blocks.filter((b) => b.type === "body").length).toBe(1)
  })

  it("defaults accentColor when omitted", () => {
    const parsed = prescriptionDocumentModelSchema.parse({
      version: DEFAULT_PRESCRIPTION_DOCUMENT_MODEL.version,
      blocks: DEFAULT_PRESCRIPTION_DOCUMENT_MODEL.blocks,
    })
    expect(parsed.accentColor).toBe(DEFAULT_PRESCRIPTION_ACCENT_COLOR)
  })

  it("rejects invalid accentColor", () => {
    const invalid = ["#fff", "red", "#gg0000"]
    for (const accentColor of invalid) {
      expect(() =>
        prescriptionDocumentModelSchema.parse({
          ...DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
          accentColor,
        }),
      ).toThrow()
    }
  })

  it("rejects models without exactly one body block", () => {
    expect(() => prescriptionDocumentModelSchema.parse({
              version: 1,
              blocks: [
                createBlockDefaults("title", VALID_UUID),
                createBlockDefaults(
                  "letterhead",
                  "22222222-2222-4222-8222-222222222222",
                ),
              ],
            })).toThrow()
  })
})

describe("compilePrescriptionTemplate", () => {
  it("emits placeholders and title text", () => {
    const html = compilePrescriptionTemplate(DEFAULT_PRESCRIPTION_DOCUMENT_MODEL)
    expect(html).toMatch(/\{\{clinic\.name\}\}/)
    expect(html).toMatch(/\{\{body\}\}/)
    expect(html).toMatch(/Receita médica/)
    expect(html).toMatch(/\{\{issuedAt\}\}/)
    expect(html).toMatch(/--rx-accent:\s*#1e4d6b/)
  })

  it("emits the chosen accent color as a CSS variable", () => {
    const html = compilePrescriptionTemplate({
      ...DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
      accentColor: "#0a7a4a",
    })
    expect(html).toMatch(/--rx-accent:\s*#0a7a4a/)
    expect(html).toMatch(/var\(--rx-accent\)/)
    expect(html).not.toMatch(/--rx-accent:\s*#1e4d6b/)
  })

  it("falls back to the default accent when the hex is not allowlisted", () => {
    const html = compilePrescriptionTemplate({
      ...DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
      accentColor: "red; } body { display:none",
    } as PrescriptionDocumentModel)
    expect(html).toMatch(/--rx-accent:\s*#1e4d6b/)
    expect(html.includes("display:none")).toBe(false)
    expect(html.includes("red;")).toBe(false)
  })

  it("escapes static text blocks", () => {
    const model: PrescriptionDocumentModel = {
      version: 1,
      accentColor: DEFAULT_PRESCRIPTION_ACCENT_COLOR,
      blocks: [
        createBlockDefaults("body", VALID_UUID),
        createBlockDefaults(
          "text",
          "22222222-2222-4222-8222-222222222222",
        ),
      ],
    }
    const textBlock = model.blocks[1]
    if (textBlock?.type === "text") {
      textBlock.props = {
        text: '<script>alert("x")</script>',
        align: "left",
      }
    }
    const html = compilePrescriptionTemplate(model)
    expect(html.includes("<script>")).toBe(false)
    expect(html).toMatch(/&lt;script&gt;/)
  })

  it("compiles to HTML that renderPrescriptionHtml can fill", () => {
    const layoutHtml = compilePrescriptionTemplate(
      DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
    )
    const html = renderPrescriptionHtml({
      layoutHtml,
      body: "<p>Amoxicilina</p>",
      clinic: { id: VALID_UUID, name: "Clínica X" },
      patient: { id: VALID_UUID, name: "Ana" },
      professional: { id: VALID_UUID, name: "Dr. B" },
      issuedAt: new Date("2026-07-28T12:00:00.000Z"),
    })
    expect(html).toMatch(/Clínica X/)
    expect(html).toMatch(/Amoxicilina/)
    expect(html.includes("{{body}}")).toBe(false)
  })
})
