import { routes } from "@/config/routes"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ em linguagem simples para o dono (proprietário) da clínica.
 * Evitar jargão técnico. Atualizar quando o produto mudar.
 */
export const HELP_FAQ_OWNER: HelpFaqItem[] = [
  // ─── Começar ─────────────────────────────────────────────────────────────
  {
    id: "what-is-sclinic",
    categoryId: "getting-started",
    question: "Para que serve o sclinic?",
    answer: [
      "É o sistema da sua clínica: você agenda consultas, cadastra pacientes, organiza a equipe, registra o atendimento e acompanha o que foi recebido.",
      "Como dono da clínica, você vê tudo e pode configurar o que precisar.",
    ],
    keywords: ["sclinic", "sistema", "para que serve", "dono", "proprietário"],
    relatedRoutes: [{ label: "Ir para o início", href: routes.home }],
  },
  {
    id: "first-day-checklist",
    categoryId: "getting-started",
    question: "Acabei de criar minha conta. O que faço agora?",
    answer: [
      "No começo, o sclinic pede três coisas: escolher um plano, cadastrar a clínica e informar os horários de funcionamento.",
      "Depois disso, o ideal é chamar sua equipe, cadastrar pacientes e marcar a primeira consulta.",
    ],
    steps: [
      "Escolha o plano, cadastre a clínica e informe os horários.",
      "Em Equipe, convide quem vai trabalhar com você (por exemplo, recepção).",
      "Em Profissionais, cadastre os médicos ou enfermeiros — ou, se você também atende, crie seu próprio perfil por lá.",
      "Em Pacientes, cadastre a primeira pessoa.",
      "Em Agendamentos, marque a primeira consulta.",
    ],
    keywords: ["primeiro dia", "começar", "nova conta", "o que fazer"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Equipe", href: routes.users },
      { label: "Profissionais", href: routes.professionals },
      { label: "Pacientes", href: routes.patients },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "where-is-help",
    categoryId: "getting-started",
    question: "Como volto nesta ajuda depois?",
    answer: [
      "No menu à esquerda, no final, toque em Ajuda (ícone de interrogação).",
      "Você pode pesquisar pelo que precisa ou escolher um assunto acima.",
    ],
    keywords: ["ajuda", "encontrar", "menu", "voltar"],
    relatedRoutes: [{ label: "Abrir ajuda", href: routes.help }],
  },

  // ─── Clínica ─────────────────────────────────────────────────────────────
  {
    id: "edit-clinic-data",
    categoryId: "clinic",
    question: "Como mudo o nome da clínica?",
    answer: [
      "Abra Configurações e depois Geral. Lá você altera o nome e os demais dados da clínica.",
      "Essas informações aparecem no topo do sistema e também em documentos, como a receita.",
    ],
    steps: [
      "No menu, abra Configurações.",
      "Entre em Geral, altere o que precisar e salve.",
    ],
    keywords: ["nome", "clínica", "dados", "configurações", "editar"],
    relatedRoutes: [
      { label: "Abrir configurações", href: routes.settingsGeneral },
    ],
  },
  {
    id: "clinic-hours",
    categoryId: "clinic",
    question: "Como defino os horários de funcionamento?",
    answer: [
      "Em Configurações → Horários você informa em quais dias e horários a clínica atende.",
      "A agenda usa isso para saber quando é possível marcar consulta.",
    ],
    steps: [
      "Abra Configurações → Horários.",
      "Ajuste os dias e os horários.",
      "Salve. A partir daí, a agenda respeita o que você definiu.",
    ],
    keywords: ["horários", "funcionamento", "abrir", "fechar", "agenda"],
    relatedRoutes: [
      { label: "Horários da clínica", href: routes.settingsHours },
      { label: "Ver agenda", href: routes.appointments },
    ],
  },
  {
    id: "delete-clinic",
    categoryId: "clinic",
    question: "Consigo apagar a clínica?",
    answer: [
      "Sim. Em Configurações → Zona de perigo você encontra essa opção. Só o dono da clínica consegue concluir.",
      "Se a assinatura estiver inadimplente ou cancelada, você também pode excluir pela tela de escolher clínica — e a cobrança no Stripe é encerrada na hora.",
      "Atenção: depois de apagar, não dá para desfazer. Use só se tiver certeza.",
    ],
    keywords: ["apagar", "excluir", "remover clínica", "zona de perigo", "assinatura"],
    relatedRoutes: [
      { label: "Zona de perigo", href: routes.settingsDanger },
      { label: "Assinatura", href: routes.accountSubscription },
    ],
  },
  {
    id: "multiple-clinics",
    categoryId: "clinic",
    question: "Posso trabalhar em mais de uma clínica?",
    answer: [
      "Sim. Se você fizer parte de outra clínica (por exemplo, se for convidado), pode trocar pela clínica no topo da tela.",
      "O plano que você assinou cobre a clínica que você criou ao começar.",
    ],
    keywords: ["várias clínicas", "trocar clínica", "outra clínica"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Escolher clínica", href: routes.selectClinic },
    ],
  },

  // ─── Equipe ──────────────────────────────────────────────────────────────
  {
    id: "invite-team",
    categoryId: "team",
    question: "Como convido alguém da equipe?",
    answer: [
      "Em Equipe você envia um convite por e-mail e escolhe a função da pessoa (por exemplo, recepção, administração ou financeiro).",
      "Ela recebe o link, entra na conta e passa a aparecer na sua clínica.",
    ],
    steps: [
      "Abra Equipe.",
      "Toque para convidar e escolha a função.",
      "Digite o e-mail e envie.",
      "Acompanhe se o convite ainda está pendente na mesma tela.",
    ],
    keywords: [
      "convidar",
      "equipe",
      "recepção",
      "funcionário",
      "colaborador",
    ],
    relatedRoutes: [{ label: "Abrir equipe", href: routes.users }],
  },
  {
    id: "invite-professional",
    categoryId: "team",
    question: "Como cadastro um médico ou enfermeiro?",
    answer: [
      "Isso fica em Profissionais. Você envia um convite; a pessoa completa o cadastro (incluindo o número do conselho) e fica pronta para atender.",
      "Seu plano tem um limite de profissionais. Se o convite não for aceito por causa disso, veja Uso do plano.",
    ],
    steps: [
      "Abra Profissionais.",
      "Envie o convite.",
      "Peça para a pessoa abrir o e-mail e concluir o cadastro.",
    ],
    keywords: ["médico", "doutor", "enfermeiro", "profissional", "CRM"],
    relatedRoutes: [
      { label: "Profissionais", href: routes.professionals },
      { label: "Ver meu plano", href: routes.settingsUsage },
    ],
  },
  {
    id: "owner-clinical-profile",
    categoryId: "team",
    question: "Eu sou o dono e também atendo. Preciso de outra conta?",
    answer: [
      "Não. Você continua com a mesma conta de dono.",
      "Em Profissionais dá para criar o seu perfil de atendimento. Assim você agenda e atende sem precisar de um segundo login.",
    ],
    keywords: [
      "dono atende",
      "eu também atendo",
      "consultório sozinho",
      "perfil de atendimento",
    ],
    relatedRoutes: [
      { label: "Profissionais", href: routes.professionals },
    ],
  },
  {
    id: "roles-permissions",
    categoryId: "team",
    question: "Qual a diferença entre as funções da equipe?",
    answer: [
      "Cada função vê menus e botões diferentes, para a pessoa ver só o que precisa no dia a dia.",
      "Em resumo: o dono vê tudo; a administração cuida da operação; a recepção agenda e cadastra pacientes; o financeiro acompanha cobranças; médicos e enfermeiros atendem e usam o prontuário.",
    ],
    keywords: ["função", "papel", "permissão", "diferença", "quem vê o quê"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },
  {
    id: "suspend-member",
    categoryId: "team",
    question: "Como tiro o acesso de alguém?",
    answer: [
      "Na tela de Equipe você pode suspender ou remover a pessoa. Enquanto estiver suspensa, ela não consegue entrar.",
      "Não dá para remover o dono da clínica por esse caminho.",
    ],
    keywords: ["tirar acesso", "suspender", "remover", "desligar", "inativar"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },

  // ─── Pacientes ───────────────────────────────────────────────────────────
  {
    id: "create-patient",
    categoryId: "patients",
    question: "Como cadastro um paciente?",
    answer: [
      "Abra Pacientes e use o botão para cadastrar. O CPF não pode se repetir na mesma clínica.",
      "Depois, ao abrir a ficha, você vê os dados, o histórico de consultas e, se tiver permissão, as anotações clínicas.",
    ],
    steps: [
      "Abra Pacientes.",
      "Toque em cadastrar.",
      "Preencha os dados e salve.",
      "Para achar depois, use a busca na lista.",
    ],
    keywords: ["paciente", "cadastrar", "CPF", "novo", "ficha"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "archive-patient",
    categoryId: "patients",
    question: "Como removo um paciente da lista?",
    answer: [
      "Você pode arquivar o paciente. Ele some da lista do dia a dia, mas o histórico fica guardado na clínica.",
    ],
    keywords: ["arquivar", "remover paciente", "excluir paciente", "apagar"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  // ─── Agenda ──────────────────────────────────────────────────────────────
  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Como marco uma consulta?",
    answer: [
      "Em Agendamentos, escolha o dia e o horário. Informe o paciente, quem vai atender e o tipo de consulta.",
      "Se quiser, já coloque o valor. Isso ajuda a registrar o recebimento depois.",
    ],
    steps: [
      "Abra Agendamentos.",
      "Escolha a data e o horário.",
      "Preencha paciente, profissional e detalhes.",
      "Salve. A consulta começa como Agendada.",
    ],
    keywords: ["marcar", "agendar", "consulta", "calendário", "horário"],
    relatedRoutes: [{ label: "Abrir agenda", href: routes.appointments }],
  },
  {
    id: "appointment-statuses",
    categoryId: "appointments",
    question: "O que significam os status da consulta?",
    answer: [
      "Eles mostram em que etapa a consulta está. O caminho mais comum é: Agendada → Confirmada → Em atendimento → Concluída.",
      "Também existem Cancelada (não vai acontecer) e Faltou (o paciente não apareceu).",
    ],
    keywords: [
      "status",
      "agendada",
      "confirmada",
      "em atendimento",
      "concluída",
      "faltou",
      "cancelada",
    ],
    relatedRoutes: [
      { label: "Agenda", href: routes.appointments },
      { label: "Início", href: routes.home },
    ],
  },
  {
    id: "start-attendance",
    categoryId: "appointments",
    question: "Como começo o atendimento?",
    answer: [
      "Na agenda, abra a consulta e inicie o atendimento. Isso muda o status para Em atendimento.",
      "Aí você pode registrar anotações, sinais vitais e receitas na mesma tela.",
    ],
    keywords: [
      "iniciar atendimento",
      "começar consulta",
      "atender",
      "sala",
    ],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "reschedule-cancel",
    categoryId: "appointments",
    question: "Como remarco ou cancelo uma consulta?",
    answer: [
      "Abra a consulta na agenda. Enquanto ela ainda puder ser alterada, você muda o horário ou cancela.",
      "Consultas concluídas, canceladas ou com falta não podem ser remarcadas.",
    ],
    keywords: ["remarcar", "cancelar", "reagendar", "faltou", "mudar horário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  // ─── Prontuário ──────────────────────────────────────────────────────────
  {
    id: "clinical-notes",
    categoryId: "records",
    question: "Onde escrevo a evolução do paciente?",
    answer: [
      "Durante o atendimento, abra a aba Notas. Dá para usar modelos prontos para escrever mais rápido.",
      "A anotação fica ligada àquela consulta e também aparece depois na ficha do paciente.",
    ],
    keywords: ["nota", "evolução", "anotação", "prontuário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "vitals-alerts",
    categoryId: "records",
    question: "Como registro pressão, peso e alertas?",
    answer: [
      "No atendimento, use a aba Vitais para pressão, peso, altura e outros sinais. O IMC pode ser calculado automaticamente.",
      "Alertas importantes (como alergia) ficam na ficha do paciente, para a equipe ver com facilidade.",
    ],
    keywords: ["vitais", "pressão", "peso", "IMC", "alerta", "alergia"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "prescriptions",
    categoryId: "records",
    question: "Como faço e imprimo uma receita?",
    answer: [
      "No atendimento, abra Receitas. Crie o rascunho, revise, emita e use Imprimir.",
      "Se quiser mudar o visual da receita (cabeçalho, rodapé), vá em Configurações → Receitas.",
    ],
    steps: [
      "No atendimento, abra Receitas.",
      "Crie, revise e emita.",
      "Toque em Imprimir.",
      "Se quiser, personalize o modelo em Configurações → Receitas.",
    ],
    keywords: ["receita", "imprimir", "prescrição", "medicamento"],
    relatedRoutes: [
      { label: "Agenda", href: routes.appointments },
      { label: "Modelos de receita", href: routes.settingsPrescriptions },
    ],
  },

  // ─── Recebimentos ────────────────────────────────────────────────────────
  {
    id: "how-charges-work",
    categoryId: "billing",
    question: "Como funciona a cobrança da consulta?",
    answer: [
      "Cada consulta pode ter um valor a receber. Você informa o valor ao marcar ou registra o pagamento depois.",
      "Em Faturamento você vê o que está pendente, o que já foi pago e pode cancelar uma cobrança se precisar.",
    ],
    keywords: ["cobrança", "valor", "receber", "pagamento", "consulta"],
    relatedRoutes: [
      { label: "Faturamento", href: routes.billing },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "mark-charge-paid",
    categoryId: "billing",
    question: "O paciente pagou. Como registro?",
    answer: [
      "Abra Faturamento, encontre a cobrança em aberto e marque como paga, escolhendo como foi o pagamento (PIX, dinheiro, cartão no balcão, etc.).",
      "Quem tem permissão na recepção também pode registrar o pagamento pela agenda.",
    ],
    keywords: ["marcou pago", "PIX", "dinheiro", "recebi", "pendente"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "saas-vs-clinical-billing",
    categoryId: "billing",
    question: "Faturamento e meu plano do sclinic são a mesma coisa?",
    answer: [
      "Não. Faturamento é o dinheiro das consultas dos seus pacientes.",
      "O plano (assinatura) é o que você paga para usar o sclinic. Isso fica em Minha conta → Assinatura e em Uso do plano.",
    ],
    keywords: [
      "assinatura",
      "plano",
      "diferença",
      "cobrança do paciente",
      "mensalidade",
    ],
    relatedRoutes: [
      { label: "Faturamento", href: routes.billing },
      { label: "Minha assinatura", href: routes.accountSubscription },
      { label: "Uso do plano", href: routes.settingsUsage },
    ],
  },

  // ─── Plano ───────────────────────────────────────────────────────────────
  {
    id: "free-trial",
    categoryId: "subscription",
    question: "Como funciona o teste grátis de 7 dias?",
    answer: [
      "Na primeira assinatura você tem 7 dias grátis. O cartão é cadastrado no Checkout, mas não há cobrança nesse período.",
      "Ao fim dos 7 dias, a mensalidade é cobrada automaticamente no cartão, a menos que você cancele antes em Minha conta → Assinatura.",
      "Reativar uma assinatura cancelada não renova o teste grátis.",
    ],
    keywords: [
      "teste grátis",
      "trial",
      "7 dias",
      "cartão",
      "quando cobra",
      "assinatura",
    ],
    relatedRoutes: [
      { label: "Assinatura", href: routes.accountSubscription },
    ],
  },
  {
    id: "change-plan",
    categoryId: "subscription",
    question: "Como vejo ou mudo meu plano?",
    answer: [
      "Em Minha conta → Assinatura você gerencia o pagamento (cartão, faturas e alterações do plano).",
      "Em Configurações → Uso do plano (só o dono vê) aparece quantas pessoas e profissionais você já usou do limite.",
    ],
    keywords: ["plano", "mudar plano", "assinatura", "upgrade", "mensalidade"],
    relatedRoutes: [
      { label: "Assinatura", href: routes.accountSubscription },
      { label: "Uso do plano", href: routes.settingsUsage },
    ],
  },
  {
    id: "over-limit",
    categoryId: "subscription",
    question: "O que acontece se eu passar do limite do plano?",
    answer: [
      "O sistema avisa e pode impedir ações que aumentam o uso — por exemplo, convidar mais profissionais — até você reduzir o uso ou subir de plano.",
      "Seus dados já cadastrados continuam salvos.",
    ],
    keywords: ["limite", "cota", "bloqueio", "não consigo convidar", "plano"],
    relatedRoutes: [
      { label: "Uso do plano", href: routes.settingsUsage },
      { label: "Assinatura", href: routes.accountSubscription },
    ],
  },
  {
    id: "past-due",
    categoryId: "subscription",
    question: "O pagamento do plano falhou. O que faço?",
    answer: [
      "Abra Minha conta → Assinatura e atualize a forma de pagamento.",
      "Enquanto o pagamento estiver em aberto, o acesso à clínica pode ficar limitado.",
    ],
    keywords: [
      "pagamento falhou",
      "cartão",
      "pendente",
      "não consigo entrar",
      "assinatura",
    ],
    relatedRoutes: [
      { label: "Assinatura", href: routes.accountSubscription },
    ],
  },

  // ─── Conta ───────────────────────────────────────────────────────────────
  {
    id: "update-profile",
    categoryId: "account",
    question: "Como mudo meu nome ou meus dados?",
    answer: [
      "Em Minha conta → Dados pessoais. Isso altera o seu perfil de usuário — não os dados da clínica.",
    ],
    keywords: ["meu nome", "perfil", "dados pessoais", "conta"],
    relatedRoutes: [
      { label: "Dados pessoais", href: routes.accountProfile },
      { label: "Minha conta", href: routes.accountOverview },
    ],
  },
  {
    id: "change-password",
    categoryId: "account",
    question: "Como troco a senha?",
    answer: [
      "Em Minha conta → Segurança. Se você entrou com uma senha temporária (por convite), o sistema pode pedir a troca na primeira vez.",
    ],
    keywords: ["senha", "trocar senha", "segurança", "password"],
    relatedRoutes: [
      { label: "Segurança", href: routes.accountSecurity },
    ],
  },
  {
    id: "audit-logs",
    categoryId: "account",
    question: "Onde vejo o histórico de ações importantes?",
    answer: [
      "Em Configurações → Auditoria. Lá ficam registros do que aconteceu de relevante na clínica, para quem tem permissão de ver.",
    ],
    keywords: ["histórico", "auditoria", "quem fez", "registro"],
    relatedRoutes: [
      { label: "Auditoria", href: routes.settingsAudit },
    ],
  },
  {
    id: "confirm-appointment",
    categoryId: "appointments",
    question: "Como confirmo que o paciente vem?",
    answer: [
      "Na agenda, abra a consulta e marque como Confirmada. Isso ajuda a equipe a ver quem já confirmou o horário.",
      "Se o paciente não aparecer, use o status Faltou. Se precisar desmarcar, cancele a consulta.",
    ],
    keywords: ["confirmar", "confirmada", "paciente vem", "faltou"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "end-to-end-day",
    categoryId: "getting-started",
    question: "Como funciona um dia típico na clínica?",
    answer: [
      "Em geral: a recepção marca e confirma consultas; o profissional inicia o atendimento, registra o prontuário e conclui; depois alguém registra o pagamento.",
      "Na home da recepção existe um quadro do dia com quem ainda vai chegar, quem está em atendimento e quem aguarda pagamento.",
    ],
    steps: [
      "Marque a consulta (com valor, se quiser cobrar depois).",
      "Confirme o horário quando o paciente confirmar.",
      "O profissional inicia e conclui o atendimento.",
      "Registre o pagamento na agenda ou em Faturamento.",
    ],
    keywords: ["fluxo", "dia a dia", "balcão", "quadro", "rotina"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
      { label: "Faturamento", href: routes.billing },
    ],
  },
  {
    id: "prescription-templates",
    categoryId: "clinic",
    question: "Como personalizo o visual da receita?",
    answer: [
      "Em Configurações → Receitas você ajusta cabeçalho, rodapé e outros textos que aparecem na impressão.",
      "Isso vale para as receitas emitidas pelos profissionais da clínica.",
    ],
    keywords: ["modelo", "receita", "cabeçalho", "rodapé", "imprimir"],
    relatedRoutes: [
      { label: "Modelos de receita", href: routes.settingsPrescriptions },
    ],
  },
  {
    id: "cancel-charge",
    categoryId: "billing",
    question: "Como cancelo uma cobrança errada?",
    answer: [
      "Em Faturamento, abra a cobrança e cancele se ainda fizer sentido (por exemplo, consulta cancelada ou valor digitado errado).",
      "Cobranças já pagas pedem cuidado: confira antes de alterar.",
    ],
    keywords: ["cancelar cobrança", "erro", "valor errado", "estornar"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "switch-clinic",
    categoryId: "clinic",
    question: "Como troco de clínica no sistema?",
    answer: [
      "No topo da tela aparece a clínica atual. Toque nela para escolher outra da qual você faz parte.",
      "Cada clínica tem seus pacientes, agenda e equipe — os dados não se misturam.",
    ],
    keywords: ["trocar", "outra clínica", "selecionar clínica", "switcher"],
    relatedRoutes: [
      { label: "Escolher clínica", href: routes.selectClinic },
    ],
  },
  {
    id: "patient-alerts",
    categoryId: "patients",
    question: "Como aviso a equipe sobre alergia ou atenção especial?",
    answer: [
      "Na ficha do paciente você registra alertas (por exemplo, alergia a medicamento). Eles ficam em destaque para quem atende.",
    ],
    keywords: ["alerta", "alergia", "atenção", "ficha"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "invite-not-accepted",
    categoryId: "team",
    question: "A pessoa não aceitou o convite. O que faço?",
    answer: [
      "Em Equipe (ou em Profissionais, se for médico/enfermeiro) você vê convites pendentes.",
      "Peça para a pessoa verificar o e-mail (incluindo spam). Se o link expirou, envie um novo convite.",
    ],
    keywords: ["convite pendente", "não chegou e-mail", "expirado", "reenviar"],
    relatedRoutes: [
      { label: "Equipe", href: routes.users },
      { label: "Profissionais", href: routes.professionals },
    ],
  },
  {
    id: "who-starts-attendance",
    categoryId: "appointments",
    question: "Quem pode iniciar o atendimento?",
    answer: [
      "Quem atende clinicamente: médicos, enfermeiros e, se você também atende, o seu perfil de dono com perfil clínico.",
      "A recepção organiza a agenda e o pagamento, mas não inicia o atendimento clínico.",
    ],
    keywords: ["iniciar", "quem pode", "recepção", "médico"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
]
