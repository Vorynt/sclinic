/**
 * Copy reference for Resend dashboard templates.
 *
 * HTML pronto para colar (Import HTML no Resend):
 * `src/core/email/templates/html/<alias>.html`
 *
 * Variables: use {{{VAR}}} (triple braces). Create each variable in the
 * Resend UI with the keys listed below, then publish the template.
 */

export const emailTemplateCopy = {
  emailVerification: {
    alias: "email-verification",
    name: "Ativação de conta",
    subject: "Confirme seu e-mail — sclinic",
    variables: [
      { key: "USER_NAME", fallback: "olá" },
      { key: "ACTION_URL", fallback: "https://app.sclinic.com.br" },
    ],
    previewText: "Confirme seu e-mail para ativar sua conta no sclinic.",
    body: [
      "Olá, {{{USER_NAME}}},",
      "",
      "Bem-vindo(a) ao sclinic!",
      "Para ativar sua conta, confirme seu endereço de e-mail clicando no botão abaixo.",
      "",
      "[Botão: Confirmar e-mail] → {{{ACTION_URL}}}",
      "",
      "Se o botão não funcionar, copie e cole este link no navegador:",
      "{{{ACTION_URL}}}",
      "",
      "Se você não criou uma conta no sclinic, ignore este e-mail.",
      "",
      "— Equipe sclinic",
    ].join("\n"),
  },

  passwordReset: {
    alias: "password-reset",
    name: "Recuperação de senha",
    subject: "Redefinição de senha — sclinic",
    variables: [
      { key: "USER_NAME", fallback: "olá" },
      { key: "ACTION_URL", fallback: "https://app.sclinic.com.br" },
    ],
    previewText: "Use o link para criar uma nova senha na sua conta sclinic.",
    body: [
      "Olá, {{{USER_NAME}}},",
      "",
      "Recebemos um pedido para redefinir a senha da sua conta no sclinic.",
      "Clique no botão abaixo para escolher uma nova senha. O link expira em breve por segurança.",
      "",
      "[Botão: Redefinir senha] → {{{ACTION_URL}}}",
      "",
      "Se o botão não funcionar, copie e cole este link no navegador:",
      "{{{ACTION_URL}}}",
      "",
      "Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanecerá a mesma.",
      "",
      "— Equipe sclinic",
    ].join("\n"),
  },

  collaboratorInvite: {
    alias: "collaborator-invite",
    name: "Convite de colaborador",
    subject: "Você foi convidado(a) para {{{CLINIC_NAME}}} — sclinic",
    variables: [
      { key: "USER_NAME", fallback: "olá" },
      { key: "INVITER_NAME", fallback: "um administrador" },
      { key: "CLINIC_NAME", fallback: "a clínica" },
      { key: "ROLE_NAME", fallback: "colaborador" },
      { key: "ACTION_URL", fallback: "https://app.sclinic.com.br" },
    ],
    previewText:
      "Aceite o convite para colaborar na clínica no sclinic.",
    body: [
      "Olá, {{{USER_NAME}}},",
      "",
      "{{{INVITER_NAME}}} convidou você para fazer parte da equipe de {{{CLINIC_NAME}}} no sclinic, com o perfil de {{{ROLE_NAME}}}.",
      "",
      "Abra o link abaixo para criar sua senha e aceitar o convite. Você poderá usar as ferramentas da clínica de acordo com as permissões do seu perfil.",
      "",
      "[Botão: Aceitar convite] → {{{ACTION_URL}}}",
      "",
      "Se o botão não funcionar, copie e cole este link no navegador:",
      "{{{ACTION_URL}}}",
      "",
      "Se você não esperava este convite, pode ignorar este e-mail com segurança.",
      "",
      "— Equipe sclinic",
    ].join("\n"),
  },

  professionalInvite: {
    alias: "professional-invite",
    name: "Convite de profissional",
    subject: "Convite para atuar em {{{CLINIC_NAME}}} — sclinic",
    variables: [
      { key: "USER_NAME", fallback: "olá" },
      { key: "INVITER_NAME", fallback: "um administrador" },
      { key: "CLINIC_NAME", fallback: "a clínica" },
      { key: "ROLE_NAME", fallback: "profissional" },
      { key: "ACTION_URL", fallback: "https://app.sclinic.com.br" },
    ],
    previewText:
      "Crie sua senha, revise seus dados e confirme o convite.",
    body: [
      "Olá, {{{USER_NAME}}},",
      "",
      "{{{INVITER_NAME}}} convidou você para atuar como profissional em {{{CLINIC_NAME}}} no sclinic (perfil: {{{ROLE_NAME}}}).",
      "",
      "Abra o link abaixo para criar sua senha, revisar seus dados profissionais e aceitar o convite.",
      "",
      "[Botão: Revisar dados e aceitar] → {{{ACTION_URL}}}",
      "",
      "Se o botão não funcionar, copie e cole este link no navegador:",
      "{{{ACTION_URL}}}",
      "",
      "Se você não esperava este convite, ignore este e-mail.",
      "",
      "— Equipe sclinic",
    ].join("\n"),
  },
} as const;
