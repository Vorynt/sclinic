import type { AppError } from "@/shared/errors";

/**
 * Optional UI side-effect callbacks for mutation hooks.
 *
 * Cache invalidation always lives inside the hook — never pass
 * `invalidateQueries` (or query keys) via props.
 *
 * Prefer `mutate()` over `mutateAsync()` when using these callbacks
 * so the client does not need try/catch.
 */
export type MutationCallbacks<TData = unknown> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: AppError) => void;
};
