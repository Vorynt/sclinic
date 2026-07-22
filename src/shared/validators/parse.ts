import { flattenError, type ZodType } from "zod";

import { ValidationError } from "@/shared/errors/validation-error";

/**
 * Parses unknown input with a Zod schema.
 * On failure, throws ValidationError with field → messages for the UI.
 */
export function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): TSchema["_output"] {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const { fieldErrors, formErrors } = flattenError(result.error);
  const fields: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fields[key] = messages;
    }
  }

  if (formErrors.length > 0) {
    fields._form = formErrors;
  }

  throw new ValidationError(fields, { cause: result.error });
}
