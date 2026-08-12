import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Documento de governança — não publicar detalhes operacionais sensíveis.
 * Revisão jurídica/técnica obrigatória antes de uso produtivo.
 */
export const INFORMATION_SECURITY_POLICY: LegalDocumentContent = {
  title: "Política de Segurança da Informação",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Documento interno de governança, publicado para transparência. Deve ser ajustado à infraestrutura real. Não publica detalhes operacionais que, por segurança, devam permanecer confidenciais. Campos entre colchetes e revisão jurídica são obrigatórios antes da publicação vinculante.",
  sections: [
    {
      id: "objetivo",
      title: "1. Objetivo",
      paragraphs: [
        "Estabelecer princípios e controles mínimos para proteger dados, sistemas, credenciais e infraestrutura do sclinic contra acesso não autorizado, perda, alteração, indisponibilidade ou tratamento inadequado.",
      ],
    },
    {
      id: "principios",
      title: "2. Princípios",
      paragraphs: [],
      bullets: [
        "Privilégio mínimo.",
        "Defesa em profundidade.",
        "Segregação por tenant.",
        "Confidencialidade, integridade e disponibilidade.",
        "Privacy by design e by default.",
        "Rastreabilidade de operações relevantes.",
        "Gestão baseada em risco.",
      ],
    },
    {
      id: "controle-acesso",
      title: "3. Controle de acesso",
      paragraphs: [],
      bullets: [
        "Usuários devem receber apenas permissões necessárias à função.",
        "Acesso de administradores deve ser restrito e revisado periodicamente.",
        "Credenciais não podem ser compartilhadas.",
        "Tokens, chaves e segredos devem ser armazenados em mecanismos apropriados.",
        "Revogação de acesso deve ocorrer na saída ou mudança de função.",
      ],
    },
    {
      id: "isolamento-multi-tenant",
      title: "4. Isolamento multi-tenant",
      paragraphs: [
        "Toda operação de acesso a dados clínicos deve validar server-side a associação entre usuário, membership, tenant (clínica), papel RBAC e recurso. O frontend não é mecanismo de autorização. Consultas e mutações aplicam filtros e políticas de autorização no servidor, incluindo isolamento multi-tenant no banco quando aplicável (RLS / contexto de tenant).",
      ],
    },
    {
      id: "desenvolvimento-seguro",
      title: "5. Desenvolvimento seguro",
      paragraphs: [],
      bullets: [
        "Revisão de código para mudanças sensíveis.",
        "Validação de entrada e autorização server-side.",
        "Proteção de segredos e variáveis de ambiente.",
        "Dependências monitoradas e atualizadas.",
        "Testes automatizados de autorização e isolamento de tenants.",
        "Logs sem exposição de prontuário, senhas, tokens ou segredos desnecessários.",
      ],
    },
    {
      id: "criptografia",
      title: "6. Criptografia",
      paragraphs: [
        "Dados devem ser protegidos em trânsito por protocolos seguros. Credenciais de usuário devem ser armazenadas com hash apropriado para senhas; não devem ser armazenadas em texto aberto. Segredos e chaves devem seguir mecanismo de armazenamento seguro.",
      ],
    },
    {
      id: "logs-auditoria",
      title: "7. Logs e auditoria",
      paragraphs: [
        "Logs devem registrar eventos necessários à segurança, diagnóstico e auditoria, evitando conteúdo clínico desnecessário. Registros de auditoria devem considerar integridade, acesso restrito e retenção proporcional à finalidade.",
      ],
    },
    {
      id: "backups-recuperacao",
      title: "8. Backups e recuperação",
      paragraphs: [],
      bullets: [
        "Backups devem ser realizados segundo criticidade e arquitetura.",
        "Acesso aos backups deve ser restrito.",
        "Testes de restauração devem ocorrer periodicamente.",
        "Ciclos de retenção devem estar documentados.",
        "A eliminação solicitada não implica necessariamente remoção imediata de cópias em backups ainda dentro do ciclo técnico, desde que protegidas e sem uso operacional indevido.",
      ],
    },
    {
      id: "gestao-vulnerabilidades",
      title: "9. Gestão de vulnerabilidades",
      paragraphs: [
        "Vulnerabilidades devem ser identificadas, classificadas por risco e tratadas segundo criticidade. Vulnerabilidades críticas que possam comprometer isolamento de tenants ou dados de saúde devem receber prioridade máxima.",
      ],
    },
    {
      id: "suboperadores",
      title: "10. Suboperadores",
      paragraphs: [
        "Antes da utilização de fornecedor que trate dados pessoais, deve ser avaliada a finalidade, categoria de dados, segurança, localização, transferência internacional, subcontratação e obrigações contratuais.",
      ],
    },
    {
      id: "incidentes",
      title: "11. Incidentes",
      paragraphs: [
        "Qualquer suspeita de acesso não autorizado, exfiltração, indisponibilidade maliciosa, exposição acidental ou alteração indevida de dados deve ser tratada pelo Procedimento de Resposta a Incidentes. Incidentes com dados pessoais devem ser classificados também para fins da Resolução CD/ANPD nº 15/2024.",
      ],
    },
    {
      id: "revisao",
      title: "12. Revisão",
      paragraphs: [
        "Esta política deve ser revisada ao menos anualmente e sempre que houver alteração relevante de arquitetura, processamento, fornecedor crítico ou requisito regulatório.",
      ],
    },
  ],
}
