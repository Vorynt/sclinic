"use client";

import {
  ArrowsClockwiseIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type QueryErrorStateProps = {
  /** Override the default title. */
  title?: string;
  /** Context-specific explanation of what failed to load. */
  description?: string;
  /** Called when the user clicks retry (typically `query.refetch`). */
  onRetry: () => void;
  /** Override the retry button label. */
  retryLabel?: string;
  /** Disables the button and spins the icon while a refetch is in flight. */
  isRetrying?: boolean;
  className?: string;
};

/**
 * Inline error state for failed queries — mirrors Empty list styling with a retry CTA.
 */
export function QueryErrorState({
  title = "Não foi possível carregar",
  description = "Ocorreu um erro ao buscar os dados. Tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  isRetrying = false,
  className,
}: QueryErrorStateProps) {
  return (
    <Empty
      role="alert"
      className={cn("border border-dashed py-10", className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive/10 text-destructive">
          <WarningCircleIcon weight="duotone" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          disabled={isRetrying}
          onClick={onRetry}>
          <ArrowsClockwiseIcon
            className={isRetrying ? "animate-spin" : undefined}
          />
          {retryLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
