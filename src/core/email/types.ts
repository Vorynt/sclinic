/**
 * Provider-agnostic email contract.
 * Swap the concrete provider in `./index.ts` only.
 */

export type EmailAddress = string | string[];

export type EmailTemplateVariables = Record<string, string | number>;

/** Raw HTML/text send (escape hatch — prefer `template` for transactional mail). */
export type SendEmailContentInput = {
  to: EmailAddress;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: EmailAddress;
};

/**
 * Send via a provider-hosted template (Resend Templates).
 * `templateId` is the published template id or alias from the dashboard.
 */
export type SendEmailTemplateInput = {
  to: EmailAddress;
  templateId: string;
  variables?: EmailTemplateVariables;
  /** Overrides template default subject when set. */
  subject?: string;
  from?: string;
  replyTo?: EmailAddress;
};

export type SendEmailInput = SendEmailContentInput | SendEmailTemplateInput;

export type SendEmailResult = {
  id: string;
};

export function isTemplateEmail(
  input: SendEmailInput,
): input is SendEmailTemplateInput {
  return "templateId" in input;
}

export interface EmailProvider {
  send(
    input: (SendEmailContentInput | SendEmailTemplateInput) & { from: string },
  ): Promise<SendEmailResult>;
}
