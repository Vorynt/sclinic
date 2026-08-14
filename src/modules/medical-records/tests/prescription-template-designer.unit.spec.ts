import { describe, expect, it } from "@jest/globals"

import {
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
  compilePrescriptionTemplate,
  createBlockDefaults,
  prescriptionDocumentModelSchema,
} from "@/modules/medical-records/prescription-template-designer"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("prescriptionDocumentModelSchema", () => {
  it("accepts the system default model", () => {
    const parsed = prescriptionDocumentModelSchema.parse(
      DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
    )
    expect(parsed.version).toBe(1)
    expect(parsed.blocks.filter((b) => b.type === "body").length).toBe(1)
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
  })

  it("escapes static text blocks", () => {
    const model: {
      version: 1
      blocks: ReturnType<typeof createBlockDefaults>[]
    } = {
      version: 1,
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
