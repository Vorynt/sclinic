/**
 * Resend template aliases + typed variables.
 *
 * Create each template in the Resend dashboard with the same alias,
 * publish it, then send via `email.messages.*`.
 *
 * Variable rules (Resend):
 * - Only A–Z, 0–9, underscore
 * - Reserved (do not use): FIRST_NAME, LAST_NAME, EMAIL, RESEND_UNSUBSCRIBE_URL
 * - In the editor: {{{VARIABLE_NAME}}}
 */

export const emailTemplateAlias = {
  emailVerification: "email-verification",
  passwordReset: "password-reset",
  collaboratorInvite: "collaborator-invite",
  professionalInvite: "professional-invite",
} as const;

export type EmailTemplateAlias =
  (typeof emailTemplateAlias)[keyof typeof emailTemplateAlias];

export type EmailVerificationVars = {
  USER_NAME: string;
  ACTION_URL: string;
};

export type PasswordResetVars = {
  USER_NAME: string;
  ACTION_URL: string;
};

export type CollaboratorInviteVars = {
  USER_NAME: string;
  INVITER_NAME: string;
  CLINIC_NAME: string;
  ROLE_NAME: string;
  ACTION_URL: string;
};

export type ProfessionalInviteVars = {
  USER_NAME: string;
  INVITER_NAME: string;
  CLINIC_NAME: string;
  ROLE_NAME: string;
  ACTION_URL: string;
};
