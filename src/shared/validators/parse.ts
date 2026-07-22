import { flattenError, type ZodError, type ZodType } from "zod";

import { ValidationError } from "@/shared/errors/validation-error";

export type ParseFormSuccess<T> = { success: true; data: T };
export type ParseFormFailure = {
  success: false;
  fieldErrors: Record<string, string>;
};
export type ParseFormResult<T> = ParseFormSuccess<T> | ParseFormFailure;

function toFieldMessages(error: ZodError): Record<string, string[]> {
  const { fieldErrors, formErrors } = flattenError(error);
  const fields: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fields[key] = messages;
    }
  }

  if (formErrors.length > 0) {
    fields._form = formErrors;
  }

  return fields;
}

function toFirstFieldErrors(
  fields: Record<string, string[]>,
): Record<string, string> {
  const firstErrors: Record<string, string> = {};

  for (const [key, messages] of Object.entries(fields)) {
    if (messages[0]) {
      firstErrors[key] = messages[0];
    }
  }

  return firstErrors;
}

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

  throw new ValidationError(toFieldMessages(result.error), {
    cause: result.error,
  });
}

/**
 * Client/UI helper: validates with the same Zod schema without throwing.
 * Returns parsed data or the first message per field for FieldError.
 */
export function parseForm<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): ParseFormResult<TSchema["_output"]> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    fieldErrors: toFirstFieldErrors(toFieldMessages(result.error)),
  };
}
