export type ClinicalNoteTemplateId =
  | "blank"
  | "first_visit"
  | "follow_up"
  | "soap"
  | "procedure"

export type ClinicalNoteFieldType =
  | "section"
  | "text"
  | "textarea"
  | "switch"
  | "select"
  | "checklist"

export type ClinicalNoteFieldOption = {
  value: string
  label: string
}

export type ClinicalNoteTemplateField = {
  id: string
  type: ClinicalNoteFieldType
  label: string
  description?: string
  required?: boolean
  options?: ClinicalNoteFieldOption[]
  defaultValue?: unknown
  placeholder?: string
}

export type ClinicalNoteTemplate = {
  id: ClinicalNoteTemplateId
  label: string
  description: string
  fields: ClinicalNoteTemplateField[]
}

function section(id: string, label: string): ClinicalNoteTemplateField {
  return { id, type: "section", label }
}

function textarea(
  id: string,
  label: string,
  options?: Partial<
    Pick<
      ClinicalNoteTemplateField,
      "description" | "required" | "placeholder" | "defaultValue"
    >
  >,
): ClinicalNoteTemplateField {
  return { id, type: "textarea", label, ...options }
}

function text(
  id: string,
  label: string,
  options?: Partial<
    Pick<
      ClinicalNoteTemplateField,
      "description" | "required" | "placeholder" | "defaultValue"
    >
  >,
): ClinicalNoteTemplateField {
  return { id, type: "text", label, ...options }
}

function switchField(
  id: string,
  label: string,
  options?: Partial<
    Pick<ClinicalNoteTemplateField, "description" | "defaultValue">
  >,
): ClinicalNoteTemplateField {
  return {
    id,
    type: "switch",
    label,
    defaultValue: options?.defaultValue ?? false,
    description: options?.description,
  }
}

function select(
  id: string,
  label: string,
  fieldOptions: ClinicalNoteFieldOption[],
  options?: Partial<
    Pick<ClinicalNoteTemplateField, "description" | "required" | "defaultValue">
  >,
): ClinicalNoteTemplateField {
  return { id, type: "select", label, options: fieldOptions, ...options }
}

function checklist(
  id: string,
  label: string,
  fieldOptions: ClinicalNoteFieldOption[],
  options?: Partial<
    Pick<ClinicalNoteTemplateField, "description" | "defaultValue">
  >,
): ClinicalNoteTemplateField {
  return {
    id,
    type: "checklist",
    label,
    options: fieldOptions,
    defaultValue: options?.defaultValue ?? [],
    description: options?.description,
  }
}

/**
 * Declarative clinical form templates.
 * TipTap is compiled from field values on save — not embedded here.
 */
export const CLINICAL_NOTE_TEMPLATES: ClinicalNoteTemplate[] = [
  {
    id: "blank",
    label: "Em branco",
    description: "Anotação livre em texto (sem formulário estruturado).",
    fields: [
      textarea("body", "Anotação", {
        required: true,
        placeholder: "Escreva a evolução clínica…",
      }),
    ],
  },
  {
    id: "first_visit",
    label: "Primeira consulta",
    description:
      "Anamnese completa: queixa, HDA, antecedentes, exame físico e conduta.",
    fields: [
      section("sec_id", "Identificação da consulta"),
      select(
        "visit_type",
        "Tipo de consulta",
        [
          { value: "first", label: "Primeira consulta" },
          { value: "initial_eval", label: "Avaliação inicial" },
          { value: "other", label: "Outro" },
        ],
        { defaultValue: "first" },
      ),
      switchField("has_companion", "Paciente acompanhado?"),
      text("companion_relation", "Parentesco do acompanhante", {
        placeholder: "Ex.: cônjuge, filho(a)",
      }),
      select(
        "referral",
        "Encaminhamento",
        [
          { value: "spontaneous", label: "Espontâneo" },
          { value: "professional", label: "Profissional de saúde" },
          { value: "other", label: "Outro" },
        ],
        { defaultValue: "spontaneous" },
      ),

      section("sec_cc", "Queixa principal"),
      textarea("chief_complaint", "Motivo da consulta", {
        required: true,
        placeholder: "Nas palavras do paciente…",
      }),
      text("symptom_duration", "Duração / quando começou"),
      text("symptom_intensity", "Intensidade (0–10) / impacto"),

      section("sec_hpi", "História da doença atual (HDA)"),
      textarea("hpi_onset", "Início e evolução"),
      textarea("hpi_character", "Característica / localização / irradiação"),
      textarea("hpi_modifiers", "Fatores de melhora e piora"),
      textarea("hpi_associated", "Sintomas associados"),
      textarea("hpi_prior_tx", "Tratamentos já tentados e resposta"),
      textarea("hpi_prior_exams", "Exames prévios relevantes"),

      section("sec_pmh", "Antecedentes pessoais"),
      checklist(
        "chronic_conditions",
        "Doenças crônicas",
        [
          { value: "htn", label: "HAS" },
          { value: "dm", label: "DM" },
          { value: "asthma", label: "Asma" },
          { value: "thyroid", label: "Tireoide" },
          { value: "other", label: "Outras" },
        ],
      ),
      textarea("surgeries", "Cirurgias / internações"),
      textarea("allergies", "Alergias"),
      textarea("current_meds", "Medicações em uso"),
      checklist(
        "habits",
        "Hábitos",
        [
          { value: "tobacco", label: "Tabaco" },
          { value: "alcohol", label: "Álcool" },
          { value: "exercise", label: "Atividade física regular" },
          { value: "sleep_issue", label: "Alteração do sono" },
        ],
      ),
      textarea("habits_notes", "Detalhes de hábitos / gestação / ciclo"),

      section("sec_fh", "Antecedentes familiares"),
      textarea("family_history", "História familiar relevante"),

      section("sec_pe", "Exame físico"),
      textarea("vitals", "Sinais vitais / antropometria"),
      textarea("pe_general", "Exame geral"),
      textarea("pe_focused", "Achados direcionados ao motivo da consulta"),

      section("sec_dx", "Hipóteses diagnósticas"),
      textarea("primary_dx", "Hipótese principal", { required: true }),
      textarea("differential_dx", "Diferenciais"),
      text("cid_codes", "CID sugerido", { placeholder: "Ex.: J06.9" }),

      section("sec_plan", "Plano e conduta"),
      textarea("plan_exams", "Exames solicitados"),
      textarea("plan_rx", "Prescrição / orientações terapêuticas"),
      textarea("plan_referral", "Encaminhamentos"),
      textarea("plan_alarm", "Orientações de alarme / retorno"),
      text("next_visit", "Próxima consulta / prazo"),
    ],
  },
  {
    id: "follow_up",
    label: "Retorno / evolução",
    description:
      "Comparação com a consulta anterior, adesão, novos achados e ajustes.",
    fields: [
      section("sec_ctx", "Contexto do retorno"),
      text("return_reason", "Motivo do retorno", { required: true }),
      text("interval_since_last", "Intervalo desde a última consulta"),
      textarea("complaint_vs_prior", "Queixa atual vs. anterior"),

      section("sec_course", "Evolução"),
      select(
        "clinical_course",
        "Curso clínico",
        [
          { value: "improved", label: "Melhora" },
          { value: "stable", label: "Estabilização" },
          { value: "worsened", label: "Piora" },
        ],
        { required: true },
      ),
      textarea("course_details", "Detalhes da evolução"),
      switchField("new_symptoms", "Há sintomas novos?"),
      textarea("new_symptoms_detail", "Descrever sintomas novos"),
      switchField("er_visit", "Procurou emergência desde a última consulta?"),
      textarea("adverse_events", "Efeitos adversos / eventos agudos"),

      section("sec_adherence", "Adesão e tratamento"),
      select(
        "adherence",
        "Adesão à medicação",
        [
          { value: "full", label: "Conforme prescrito" },
          { value: "partial", label: "Parcial / falhas" },
          { value: "none", label: "Não aderente" },
          { value: "na", label: "Não se aplica" },
        ],
      ),
      textarea("tolerance", "Tolerância e efeitos colaterais"),
      textarea("nonpharm", "Medidas não farmacológicas"),
      textarea("exam_results_today", "Resultados de exames trazidos hoje"),

      section("sec_pe", "Exame físico de hoje"),
      textarea("vitals_today", "Sinais vitais relevantes"),
      textarea("pe_today", "Achados comparativos / novos"),

      section("sec_assess", "Avaliação"),
      textarea("response_to_plan", "Resposta ao plano anterior"),
      textarea("current_dx", "Diagnóstico atual / atualização"),
      text("cid_codes", "CID", { placeholder: "Ex.: I10" }),

      section("sec_plan", "Plano atualizado"),
      textarea("plan_meds", "Manter / ajustar / suspender terapêutica"),
      textarea("plan_exams", "Novos exames"),
      textarea("plan_goals", "Orientações e metas"),
      text("next_visit", "Prazo do próximo retorno"),
    ],
  },
  {
    id: "soap",
    label: "SOAP clínico",
    description:
      "Subjetivo, Objetivo, Avaliação e Plano com campos de consultório.",
    fields: [
      section("sec_s", "S — Subjetivo"),
      textarea("s_chief", "Queixa principal e duração", { required: true }),
      textarea("s_hpi", "História atual"),
      textarea("s_ros", "Revisão de sintomas pertinentes"),
      textarea("s_meds_allergies", "Medicações, alergias e adesão"),
      textarea("s_concerns", "Preocupações / expectativas do paciente"),

      section("sec_o", "O — Objetivo"),
      textarea("o_vitals", "Sinais vitais / antropometria"),
      textarea("o_exam", "Exame físico direcionado"),
      textarea("o_labs", "Resultados de exames disponíveis"),
      text("o_scores", "Escalas / escores (se usados)"),

      section("sec_a", "A — Avaliação"),
      select(
        "a_status",
        "Status do problema",
        [
          { value: "new", label: "Novo" },
          { value: "stable", label: "Estável" },
          { value: "decompensated", label: "Descompensado" },
        ],
      ),
      textarea("a_primary", "Hipótese diagnóstica principal", {
        required: true,
      }),
      textarea("a_differential", "Diagnósticos diferenciais"),
      text("a_cid", "CID(s)", { placeholder: "Ex.: J45.0" }),
      textarea("a_risks", "Riscos / alertas clínicos"),

      section("sec_p", "P — Plano"),
      textarea("p_workup", "Investigação complementar"),
      textarea("p_treatment", "Tratamento (farmacológico e não farmacológico)"),
      textarea("p_education", "Educação em saúde / orientações de alarme"),
      textarea("p_referral", "Encaminhamentos"),
      text("p_followup", "Seguimento (quando retornar)"),
    ],
  },
  {
    id: "procedure",
    label: "Procedimento",
    description:
      "Registro de procedimento ambulatorial: indicação, técnica e orientações.",
    fields: [
      section("sec_id", "Identificação do procedimento"),
      text("procedure_name", "Procedimento realizado", { required: true }),
      textarea("indication", "Indicação clínica", { required: true }),
      text("laterality", "Lateralidade / topografia"),
      switchField("consent_obtained", "Consentimento informado obtido", {
        defaultValue: true,
      }),

      section("sec_prep", "Preparação"),
      textarea("allergies_reviewed", "Alergias e contraindicações revisadas"),
      textarea("antisepsis", "Antissepsia / preparo"),
      textarea("anesthesia", "Anestesia (tipo, volume)"),
      textarea("materials", "Materiais / dispositivos"),

      section("sec_tech", "Descrição técnica"),
      textarea("technique", "Técnica e achados", { required: true }),
      textarea("closure", "Hemostasia / fechamento / curativo"),
      switchField("specimen_sent", "Material enviado a anatomia/cultura?"),
      textarea("specimen_detail", "Detalhe do material enviado"),

      section("sec_comp", "Intercorrências"),
      switchField("had_complication", "Houve intercorrência?"),
      textarea("complication_detail", "Descrever intercorrência e conduta"),

      section("sec_post", "Pós-procedimento"),
      textarea("patient_status", "Estado do paciente ao final"),
      textarea("post_rx", "Prescrições"),
      textarea("home_care", "Cuidados domiciliares e restrições"),
      textarea("alarm_signs", "Sinais de alarme"),
      text("follow_up", "Retorno / retirada de pontos / resultados"),
    ],
  },
]

export function getClinicalNoteTemplate(
  id: ClinicalNoteTemplateId | string,
): ClinicalNoteTemplate | null {
  return CLINICAL_NOTE_TEMPLATES.find((template) => template.id === id) ?? null
}

export function getClinicalNoteTemplateOrThrow(
  id: ClinicalNoteTemplateId | string,
): ClinicalNoteTemplate {
  const template = getClinicalNoteTemplate(id)
  if (!template) {
    throw new Error(`Unknown clinical note template: ${id}`)
  }
  return template
}

/** Default form values from template field defaults. */
export function getTemplateDefaultValues(
  template: ClinicalNoteTemplate,
): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of template.fields) {
    if (field.type === "section") continue
    if (field.defaultValue !== undefined) {
      values[field.id] = field.defaultValue
      continue
    }
    if (field.type === "switch") values[field.id] = false
    else if (field.type === "checklist") values[field.id] = []
    else values[field.id] = ""
  }
  return values
}

export const CLINICAL_NOTE_TEMPLATE_IDS = CLINICAL_NOTE_TEMPLATES.map(
  (template) => template.id,
) as [ClinicalNoteTemplateId, ...ClinicalNoteTemplateId[]]
