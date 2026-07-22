import { env } from "@/config/env";

import { createEmailMessages } from "@/core/email/messages";
import { ResendEmailProvider } from "@/core/email/providers/resend";
import {
  isTemplateEmail,
  type EmailProvider,
  type SendEmailInput,
  type SendEmailResult,
} from "@/core/email/types";

/**
 * Single place to swap the email provider.
 * Callers always use `email.send` / `email.messages` — never import Resend directly.
 */
function createEmailProvider(): EmailProvider {
  return new ResendEmailProvider(env.RESEND_API_KEY);
  // Example when swapping later:
  // return new SesEmailProvider(env.AWS_REGION, …);
}

let provider: EmailProvider | null = null;

function getProvider(): EmailProvider {
  if (!provider) {
    provider = createEmailProvider();
  }
  return provider;
}

async function send(input: SendEmailInput): Promise<SendEmailResult> {
  return getProvider().send({
    ...input,
    from: input.from ?? env.EMAIL_FROM,
  });
}

export const email = {
  send,
  messages: createEmailMessages((input) =>
    send({
      to: input.to,
      templateId: input.templateId,
      variables: input.variables,
      subject: input.subject,
    }),
  ),
};

export type {
  EmailAddress,
  SendEmailContentInput,
  SendEmailInput,
  SendEmailResult,
  SendEmailTemplateInput,
} from "@/core/email/types";
export { isTemplateEmail } from "@/core/email/types";
export { emailTemplateAlias } from "@/core/email/catalog";
export { emailTemplateCopy } from "@/core/email/templates/copy";
