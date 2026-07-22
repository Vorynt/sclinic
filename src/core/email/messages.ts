import {
  emailTemplateAlias,
  type CollaboratorInviteVars,
  type EmailVerificationVars,
  type PasswordResetVars,
  type ProfessionalInviteVars,
} from "@/core/email/catalog";
import type { EmailAddress, SendEmailResult } from "@/core/email/types";

type SendTemplateFn = (input: {
  to: EmailAddress;
  templateId: string;
  variables: Record<string, string | number>;
  subject?: string;
}) => Promise<SendEmailResult>;

function displayName(name?: string | null): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "olá";
}

/**
 * Typed transactional sends mapped to Resend dashboard templates.
 * Domain/auth code should call these — never hardcode template ids elsewhere.
 */
export function createEmailMessages(sendTemplate: SendTemplateFn) {
  return {
    emailVerification(params: {
      to: EmailAddress;
      name?: string | null;
      verifyUrl: string;
    }) {
      const variables: EmailVerificationVars = {
        USER_NAME: displayName(params.name),
        ACTION_URL: params.verifyUrl,
      };

      return sendTemplate({
        to: params.to,
        templateId: emailTemplateAlias.emailVerification,
        variables,
        subject: "Confirme seu e-mail — sclinic",
      });
    },

    passwordReset(params: {
      to: EmailAddress;
      name?: string | null;
      resetUrl: string;
    }) {
      const variables: PasswordResetVars = {
        USER_NAME: displayName(params.name),
        ACTION_URL: params.resetUrl,
      };

      return sendTemplate({
        to: params.to,
        templateId: emailTemplateAlias.passwordReset,
        variables,
        subject: "Redefinição de senha — sclinic",
      });
    },

    collaboratorInvite(params: {
      to: EmailAddress;
      name?: string | null;
      inviterName: string;
      clinicName: string;
      roleName: string;
      inviteUrl: string;
    }) {
      const variables: CollaboratorInviteVars = {
        USER_NAME: displayName(params.name),
        INVITER_NAME: params.inviterName,
        CLINIC_NAME: params.clinicName,
        ROLE_NAME: params.roleName,
        ACTION_URL: params.inviteUrl,
      };

      return sendTemplate({
        to: params.to,
        templateId: emailTemplateAlias.collaboratorInvite,
        variables,
        subject: `Você foi convidado(a) para ${params.clinicName} — sclinic`,
      });
    },

    professionalInvite(params: {
      to: EmailAddress;
      name?: string | null;
      inviterName: string;
      clinicName: string;
      roleName: string;
      /** URL of the review-before-accept screen. */
      reviewUrl: string;
    }) {
      const variables: ProfessionalInviteVars = {
        USER_NAME: displayName(params.name),
        INVITER_NAME: params.inviterName,
        CLINIC_NAME: params.clinicName,
        ROLE_NAME: params.roleName,
        ACTION_URL: params.reviewUrl,
      };

      return sendTemplate({
        to: params.to,
        templateId: emailTemplateAlias.professionalInvite,
        variables,
        subject: `Convite para atuar em ${params.clinicName} — sclinic`,
      });
    },
  };
}
