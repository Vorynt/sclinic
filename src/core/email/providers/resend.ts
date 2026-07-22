import { Resend } from "resend";

import { TechnicalError } from "@/shared/errors/technical-error";
import { ErrorCode } from "@/shared/errors/codes";
import {
  isTemplateEmail,
  type EmailProvider,
  type SendEmailContentInput,
  type SendEmailResult,
  type SendEmailTemplateInput,
} from "@/core/email/types";

function toArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Resend implementation of EmailProvider.
 * Do not import this from outside `core/email` — use `email` from `@/core/email`.
 */
export class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(
    input: (SendEmailContentInput | SendEmailTemplateInput) & { from: string },
  ): Promise<SendEmailResult> {
    const base = {
      from: input.from,
      to: toArray(input.to),
      replyTo: input.replyTo ? toArray(input.replyTo) : undefined,
    };

    const { data, error } = isTemplateEmail(input)
      ? await this.client.emails.send({
          ...base,
          subject: input.subject,
          template: {
            id: input.templateId,
            variables: input.variables,
          },
        })
      : await this.client.emails.send({
          ...base,
          subject: input.subject,
          html: input.html,
          text: input.text,
        });

    if (error || !data) {
      throw new TechnicalError(ErrorCode.EMAIL_SEND_FAILED, {
        message: error?.message ?? "Failed to send email",
        meta: { name: error?.name },
      });
    }

    return { id: data.id };
  }
}
