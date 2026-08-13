import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Ajustada à configuração real do produto (sessão Better Auth, sidebar,
 * Vercel Analytics/Speed Insights). Sem pixels de marketing no MVP.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const COOKIE_POLICY: LegalDocumentContent = {
  title: "Política de Cookies",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Esta Política reflete as tecnologias efetivamente utilizadas pelo sclinic na configuração atual do produto. Não há banner de consentimento (CMP) nem pixels de publicidade no núcleo clínico. Revisão jurídica obrigatória antes da publicação vinculante.",
  sections: [
    {
      id: "o-que-sao-cookies",
      title: "1. O que são cookies",
      paragraphs: [
        "Cookies e tecnologias semelhantes são pequenos identificadores ou mecanismos armazenados ou utilizados no dispositivo do usuário para permitir funcionalidades, segurança, medição de desempenho e outras finalidades.",
      ],
    },
    {
      id: "categorias",
      title: "2. Categorias utilizadas pelo sclinic",
      paragraphs: [
        "A tabela abaixo descreve o que está presente no produto hoje. Tecnologias futuras só serão declaradas após avaliação e atualização desta Política.",
      ],
      table: {
        headers: ["Categoria", "Finalidade", "Obrigatório?", "Exemplos no produto"],
        rows: [
          [
            "Essenciais",
            "Autenticação, sessão, segurança e funcionamento básico",
            "Sim",
            "Cookie/sessão Better Auth usado pelo proxy e pelas páginas autenticadas",
          ],
          [
            "Funcionalidade",
            "Preferências de interface que melhoram a experiência sem serem indispensáveis ao login",
            "Não (o app funciona sem elas, com UX reduzida)",
            "Cookie sidebar_state (estado expandido/recolhido da barra lateral no app)",
          ],
          [
            "Performance/analytics",
            "Medição de desempenho, erros e utilização da interface",
            "Habilitado na configuração atual",
            "Vercel Analytics e Vercel Speed Insights (sem conteúdo de prontuário)",
          ],
          [
            "Publicidade/marketing",
            "Não utilizada no núcleo clínico do Serviço",
            "Não",
            "Ausente — sem Google Analytics, Meta Pixel, Hotjar ou similares no código atual",
          ],
        ],
      },
    },
    {
      id: "cookies-essenciais",
      title: "3. Cookies essenciais",
      paragraphs: [
        "A sessão de autenticação é necessária para manter o login, o contexto da clínica ativa e a segurança do acesso. Não há opção in-app de desativar cookies essenciais; bloqueá-los no navegador pode impedir o login ou provocar perda de funcionalidades.",
      ],
    },
    {
      id: "analytics-performance",
      title: "4. Analytics e performance",
      paragraphs: [
        "O sclinic utiliza Vercel Analytics e Speed Insights no layout da aplicação para métricas de desempenho e uso da interface. Esses recursos não são alimentados com texto de prontuário, sinais vitais, conteúdo de receitas ou demais dados clínicos do paciente.",
      ],
    },
    {
      id: "gestao-usuario",
      title: "5. Gestão pelo usuário",
      paragraphs: [
        "O navegador permite bloquear ou apagar cookies. Preferências de interface (como o estado da sidebar) podem ser limpas ao remover cookies do domínio. O bloqueio de cookies essenciais impede o uso autenticado do Serviço. Não há, no momento, painel próprio de consentimento de cookies no produto.",
      ],
    },
    {
      id: "terceiros",
      title: "6. Terceiros",
      paragraphs: [
        "Vercel (hospedagem, Analytics e Speed Insights), Neon (banco), Resend (e-mail) e Stripe (assinatura SaaS) podem empregar identificadores técnicos próprios conforme seus termos. A relação permanece sincronizada com a Política de Privacidade e com o DPA, quando aplicável.",
      ],
    },
    {
      id: "atualizacoes",
      title: "7. Atualizações",
      paragraphs: [
        "Esta Política será atualizada quando forem adicionadas ou removidas tecnologias, fornecedores ou finalidades relevantes (por exemplo, CMP, novos analytics ou cookies de marketing).",
      ],
    },
    {
      id: "referencias-normativas",
      title: "Referências normativas principais",
      paragraphs: [],
      bullets: [
        "Lei nº 13.709/2018 (LGPD), especialmente arts. 5º, 6º, 7º, 11, 18, 33 a 36, 41, 46 a 49.",
        "Guia Orientativo da ANPD sobre Cookies e Proteção de Dados Pessoais, quando aplicável à operação.",
      ],
    },
  ],
}
