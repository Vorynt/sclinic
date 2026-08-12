import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Política de retenção — critérios operacionais de governança.
 * Revisão jurídica/contábil obrigatória antes de uso produtivo.
 */
export const DATA_RETENTION_POLICY: LegalDocumentContent = {
  title: "Política de Retenção e Exclusão de Dados",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Documento interno e referência contratual, publicado para transparência. Os prazos abaixo são critérios operacionais de governança e devem ser validados com o fluxo tributário, contratual e regulatório efetivamente adotado. Revisão jurídica obrigatória antes de considerar o texto vinculante.",
  sections: [
    {
      id: "objetivo",
      title: "1. Objetivo",
      paragraphs: [
        "Definir critérios para retenção, exclusão, anonimização quando aplicável e descarte seguro de dados pessoais e registros técnicos.",
      ],
    },
    {
      id: "principio-retencao",
      title: "2. Princípio de retenção",
      paragraphs: [
        "Dados não devem ser mantidos por período superior ao necessário à finalidade, à execução contratual, ao cumprimento de obrigação legal/regulatória, à segurança ou ao exercício regular de direitos. A existência de backup ou log não autoriza retenção indefinida.",
      ],
    },
    {
      id: "matriz-retencao",
      title: "3. Matriz de retenção",
      paragraphs: [],
      table: {
        headers: ["Categoria", "Regra operacional", "Observação"],
        rows: [
          [
            "Conta SaaS",
            "Vigência + período de saída + retenções legais aplicáveis",
            "Conta pode ser desativada antes da eliminação",
          ],
          [
            "Billing/financeiro SaaS",
            "Período necessário às obrigações fiscais/contratuais e registros Stripe",
            "Definir com contabilidade e contrato; distinto da cobrança clínica manual",
          ],
          [
            "Logs de segurança",
            "Prazo definido por risco e necessidade de investigação/defesa",
            "Evitar conteúdo clínico",
          ],
          [
            "Auditoria (audit_logs)",
            "Prazo necessário à rastreabilidade e defesa de direitos; append-only",
            "Acesso restrito (permissão audit.read)",
          ],
          [
            "Dados clínicos",
            "Enquanto necessários à relação da clínica, conforme instruções da controladora e legislação aplicável; soft-delete não elimina de imediato todas as cópias",
            "A clínica deve manter sua própria política de prontuário/guarda; documentos atuais: nota, vitais, alertas, receita e declaração",
          ],
          [
            "Backups",
            "Ciclo técnico definido pela infraestrutura",
            "Backups não são usados para operação diária após exclusão",
          ],
          [
            "Solicitação de suporte",
            "Prazo necessário para resolução e eventual comprovação",
            "Minimizar dados",
          ],
        ],
      },
    },
    {
      id: "exclusao-conta",
      title: "4. Exclusão de conta",
      paragraphs: [],
      bullets: [
        "Registrar a solicitação e validar legitimidade.",
        "Identificar dados sob papel de controladora e dados sob papel de operadora.",
        "Bloquear acessos que não devam permanecer ativos.",
        "Executar exportação quando contratualmente devida.",
        "Aplicar exclusão lógica e, quando aplicável, eliminação definitiva nos sistemas produtivos.",
        "Permitir que backups expirem conforme o ciclo técnico, sem restauração para uso operacional salvo necessidade legítima.",
        "Registrar o resultado da operação.",
      ],
    },
    {
      id: "exclusao-titular",
      title: "5. Exclusão por solicitação de titular",
      paragraphs: [
        "Pedidos referentes a prontuários e dados clínicos devem ser direcionados à clínica controladora. A Prestadora apoiará tecnicamente a operação quando necessário, observadas as hipóteses legais que autorizem a conservação do dado.",
      ],
    },
    {
      id: "preservacao-legal-hold",
      title: "6. Preservação e legal hold",
      paragraphs: [
        "Quando existir obrigação legal, ordem judicial, investigação, incidente ou necessidade documentada de defesa de direitos, determinados dados poderão ser preservados pelo período necessário, com acesso restrito e finalidade delimitada.",
      ],
    },
    {
      id: "descarte-seguro",
      title: "7. Descarte seguro",
      paragraphs: [
        "Dados em sistemas ativos devem ser removidos ou tornados inacessíveis de maneira tecnicamente adequada. Mídias e dispositivos de infraestrutura devem seguir procedimento de descarte seguro do respectivo fornecedor.",
      ],
    },
    {
      id: "revisao",
      title: "8. Revisão",
      paragraphs: [
        "A matriz deve ser revisada anualmente e sempre que houver alteração regulatória, contratual ou arquitetural relevante.",
      ],
    },
  ],
}
