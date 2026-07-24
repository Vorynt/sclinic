import { z } from "zod";

export const DEFAULT_LIST_PAGE_SIZE = 10;
export const MAX_LIST_PAGE_SIZE = 100;

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

/**
 * Shared list query for table pages: search + pagination.
 * Modules extend this schema for domain-specific filters later.
 * `sortBy` / `sortDir` are reserved for a future sorting UI.
 */
export const listQuerySchema = z.object({
  q: optionalTrimmed,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIST_PAGE_SIZE)
    .default(DEFAULT_LIST_PAGE_SIZE),
  sortBy: optionalTrimmed,
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
