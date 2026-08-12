import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Rascunho para lançamento — placeholders da empresa controladora.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const TERMS_OF_USE: LegalDocumentContent = {
  title: "Termos de Uso",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Este documento é um rascunho operacional para o produto sclinic. Substitua os placeholders e submeta à revisão de um advogado antes de considerar o texto vinculante.",
  sections: [
    {
      id: "aceitacao",
      title: "1. Aceitação",
      paragraphs: [
        "Ao criar uma conta, acessar ou utilizar o sclinic (“Serviço”), você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não utilize o Serviço.",
        "O Serviço é oferecido por [RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], com sede em [ENDEREÇO] (“Prestadora”, “nós”). A marca comercial do produto é sclinic; a Prestadora opera sob a identidade Vorynt quando indicada na interface.",
      ],
    },
    {
      id: "descricao",
      title: "2. Descrição do Serviço",
      paragraphs: [
        "O sclinic é um software como serviço (SaaS) multi-clínica voltado à gestão de consultórios e clínicas, incluindo, conforme o plano contratado: cadastro de pacientes e profissionais, agenda, atendimento e prontuário eletrônico, cobrança clínica operacional, usuários e papéis, auditoria e assinatura do software.",
        "Funcionalidades marcadas como roadmap, beta ou planejadas podem não estar disponíveis ou podem mudar sem aviso prévio de caráter comercial, observado o razoável para a continuidade do Serviço.",
      ],
    },
    {
      id: "elegibilidade",
      title: "3. Conta e elegibilidade",
      paragraphs: [
        "Você declara ter capacidade civil para contratar e, se agir em nome de uma clínica ou pessoa jurídica, ter poderes para vinculá-la a estes Termos.",
        "Você é responsável por manter a confidencialidade das credenciais, pela veracidade dos dados cadastrais e por todas as atividades realizadas sob sua conta. Notifique-nos imediatamente em caso de uso não autorizado.",
        "Podemos recusar, suspender ou encerrar contas que violem estes Termos, a legislação aplicável ou a segurança do Serviço.",
      ],
    },
    {
      id: "planos",
      title: "4. Planos, trial e cobrança da assinatura",
      paragraphs: [
        "O acesso ao software pode incluir período de teste (trial) e planos pagos. A cobrança da assinatura SaaS é processada por meio de prestador de pagamento (atualmente Stripe), conforme o fluxo de checkout e portal do cliente disponibilizados.",
        "Valores, limites de uso, renovação e cancelamento seguem as condições exibidas no momento da contratação e no painel da conta. Impostos aplicáveis podem ser acrescentados conforme a legislação.",
        "A cobrança de pacientes pela clínica (faturamento clínico no balcão) é distinta da assinatura do software: trata-se de registro operacional entre a clínica e seus pacientes, sob responsabilidade da clínica.",
      ],
    },
    {
      id: "papeis",
      title: "5. Responsabilidades da clínica e da plataforma",
      paragraphs: [
        "A clínica (ou profissional contratante) é responsável pelo conteúdo inserido no sistema, pela relação com pacientes e equipe, pelo cumprimento de normas profissionais de saúde, pelo consentimento e bases legais perante os titulares dos dados clínicos, e pelas decisões clínicas e administrativas tomadas com auxílio do Serviço.",
        "A Prestadora disponibiliza a plataforma tecnológica, busca manter disponibilidade e segurança razoáveis, e processa dados conforme a Política de Privacidade. O sclinic não substitui julgamento clínico, não presta telemedicina por si só e não constitui aconselhamento médico, jurídico ou financeiro.",
      ],
    },
    {
      id: "uso-aceitavel",
      title: "6. Uso aceitável",
      paragraphs: ["É vedado, entre outras condutas:"],
      bullets: [
        "Usar o Serviço de forma ilícita, fraudulenta ou que viole direitos de terceiros",
        "Tentar obter acesso não autorizado a contas, dados ou infraestrutura",
        "Interferir na integridade, desempenho ou segurança do Serviço",
        "Realizar engenharia reversa indevida, scraping abusivo ou sobrecarga intencional",
        "Inserir malware ou conteúdo ilegal",
        "Revender o acesso sem autorização escrita da Prestadora",
      ],
    },
    {
      id: "dados-saude",
      title: "7. Dados de saúde e conteúdo da clínica",
      paragraphs: [
        "Dados de pacientes, prontuário, sinais vitais, alertas clínicos, receitas e documentos clínicos são inseridos e controlados pela clínica. A clínica deve assegurar base legal adequada (LGPD e normas setoriais) e orientar sua equipe quanto ao acesso mínimo necessário.",
        "A Prestadora atua, em regra, como operadora desses dados por conta da clínica, e como controladora dos dados da conta SaaS e da cobrança da assinatura, conforme detalhado na Política de Privacidade.",
      ],
    },
    {
      id: "pi",
      title: "8. Propriedade intelectual",
      paragraphs: [
        "O software, a marca sclinic, layouts, textos de interface e demais elementos da plataforma são de titularidade da Prestadora ou de seus licenciadores. Estes Termos não transferem propriedade intelectual ao usuário.",
        "O conteúdo inserido pela clínica (dados de pacientes, textos clínicos etc.) permanece sob responsabilidade e titularidade aplicável da clínica ou do titular, concedendo à Prestadora apenas a licença necessária para hospedar, processar e exibir o conteúdo no âmbito do Serviço.",
      ],
    },
    {
      id: "disponibilidade",
      title: "9. Disponibilidade e alterações",
      paragraphs: [
        "Envidamos esforços razoáveis para manter o Serviço disponível, sem garantir disponibilidade ininterrupta. Manutenções, incidentes de terceiros (nuvem, e-mail, pagamentos) ou caso fortuito/força maior podem afetar o acesso.",
        "Podemos atualizar funcionalidades e estes Termos. Alterações materiais serão comunicadas por meios razoáveis (por exemplo, e-mail ou aviso no produto). O uso continuado após a vigência das alterações constitui aceitação, quando permitido pela lei.",
      ],
    },
    {
      id: "limitacao",
      title: "10. Limitação de responsabilidade",
      paragraphs: [
        "Na máxima extensão permitida pela legislação brasileira aplicável a relações de consumo e empresariais, a Prestadora não responde por lucros cessantes, danos indiretos ou consequenciais, decisões clínicas tomadas com base em dados incompletos ou incorretos inseridos pela clínica, ou falhas de terceiros (provedores de nuvem, pagamento, e-mail ou analytics).",
        "Em qualquer hipótese, a responsabilidade total da Prestadora relacionada ao Serviço fica limitada ao montante pago pelo contratante nos doze (12) meses anteriores ao evento, salvo dolo ou culpa grave, ou quando a lei consumerista impedir tal limitação.",
      ],
    },
    {
      id: "rescisao",
      title: "11. Rescisão e exclusão",
      paragraphs: [
        "Você pode encerrar o uso cancelando a assinatura e solicitando a exclusão da conta/clínica pelos canais disponibilizados no produto, observadas retenções legais e de auditoria.",
        "Podemos suspender ou encerrar o acesso em caso de inadimplemento, violação destes Termos, risco à segurança ou determinação legal.",
      ],
    },
    {
      id: "lei",
      title: "12. Lei aplicável e foro",
      paragraphs: [
        "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de [CIDADE/UF], com renúncia a qualquer outro, por mais privilegiado que seja, ressalvado o foro do consumidor quando aplicável.",
      ],
    },
    {
      id: "contato",
      title: "13. Contato",
      paragraphs: [
        "Dúvidas sobre estes Termos: [E-MAIL LGPD] ou o canal de suporte indicado no produto.",
      ],
    },
  ],
}
