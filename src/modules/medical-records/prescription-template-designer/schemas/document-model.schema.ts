import { z } from "zod"

import { MAX_PRESCRIPTION_TEMPLATE_BLOCKS } from "@/modules/medical-records/prescription-template-designer/types/document-model"

const blockAlignSchema = z.enum(["left", "center", "right"])

const letterheadPropsSchema = z.object({
  align: blockAlignSchema,
  showDocument: z.boolean(),
  showAddress: z.boolean(),
  showPhone: z.boolean(),
  showEmail: z.boolean(),
})

const titlePropsSchema = z.object({
  text: z.string().trim().min(1, "Informe o título.").max(120),
  align: blockAlignSchema,
})

const patientPropsSchema = z.object({
  align: blockAlignSchema,
  showDocument: z.boolean(),
})

const bodyPropsSchema = z.object({
  align: blockAlignSchema,
  minHeightMm: z.number().int().min(20).max(250),
})

const professionalPropsSchema = z.object({
  align: blockAlignSchema,
  showCouncil: z.boolean(),
  showSpecialty: z.boolean(),
  showIssuedAt: z.boolean(),
  showSignLine: z.boolean(),
})

const textPropsSchema = z.object({
  text: z.string().trim().min(1, "Informe o texto.").max(2_000),
  align: blockAlignSchema,
})

const dividerPropsSchema = z.object({
  thicknessPx: z.number().int().min(1).max(8),
})

const spacerPropsSchema = z.object({
  heightMm: z.number().int().min(2).max(80),
})

const blockIdSchema = z.string().uuid("Bloco inválido")

export const prescriptionBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: blockIdSchema,
    type: z.literal("letterhead"),
    props: letterheadPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("title"),
    props: titlePropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("patient"),
    props: patientPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("body"),
    props: bodyPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("professional"),
    props: professionalPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("text"),
    props: textPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("divider"),
    props: dividerPropsSchema,
  }),
  z.object({
    id: blockIdSchema,
    type: z.literal("spacer"),
    props: spacerPropsSchema,
  }),
])

export const prescriptionDocumentModelSchema = z
  .object({
    version: z.literal(1),
    blocks: z
      .array(prescriptionBlockSchema)
      .min(1, "Adicione ao menos um bloco.")
      .max(
        MAX_PRESCRIPTION_TEMPLATE_BLOCKS,
        `No máximo ${MAX_PRESCRIPTION_TEMPLATE_BLOCKS} blocos.`,
      ),
  })
  .superRefine((model, ctx) => {
    const bodyCount = model.blocks.filter((b) => b.type === "body").length
    if (bodyCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O modelo precisa ter exatamente um bloco de conteúdo.",
        path: ["blocks"],
      })
    }

    const ids = model.blocks.map((b) => b.id)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Há blocos duplicados no modelo. Remova ou ajuste e tente novamente.",
        path: ["blocks"],
      })
    }
  })

export type PrescriptionDocumentModelInput = z.infer<
  typeof prescriptionDocumentModelSchema
>
