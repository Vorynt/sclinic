"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getClientMessage } from "@/shared/errors";

type FormErrorAlertProps = {
  message: string;
  className?: string;
};

const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]+$/;

/**
 * Maps a leaked error code to a client-facing sentence when needed.
 * Keeps custom messages (e.g. "Data inválida") unchanged.
 */
function toReadableMessage(message: string): string {
  if (ERROR_CODE_PATTERN.test(message)) {
    return getClientMessage(message);
  }
  return message;
}

function FormErrorAlert({ message, className }: FormErrorAlertProps) {
  const readableMessage = toReadableMessage(message);

  return (
    <Alert variant="destructive" className={cn(className)}>
      <WarningCircleIcon className="size-5" />
      <AlertTitle>Não foi possível continuar</AlertTitle>
      <AlertDescription>{readableMessage}</AlertDescription>
    </Alert>
  );
}

function isOverflowScrollable(overflowY: string): boolean {
  return overflowY === "auto" || overflowY === "scroll";
}

function canScroll(element: HTMLElement): boolean {
  const { overflowY } = getComputedStyle(element);
  return (
    isOverflowScrollable(overflowY) &&
    element.scrollHeight > element.clientHeight
  );
}

function findScrollableAncestor(
  element: HTMLElement | null,
): HTMLElement | null {
  let current = element;
  while (current) {
    if (canScroll(current)) return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * Scrolls a form (or any container) to the top so form-level errors are visible.
 * Does not use scrollIntoView — that scrolls overflow:hidden ancestors and
 * breaks dialog chrome (header clipped, gap below footer).
 */
function scrollFormToTop(element: HTMLElement | null) {
  if (!element) return;

  const designated = element.querySelector<HTMLElement>("[data-form-scroll]");
  if (designated) {
    designated.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (canScroll(element)) {
    element.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const ancestor = findScrollableAncestor(element.parentElement);
  if (ancestor) {
    ancestor.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const top = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
}

export { FormErrorAlert, scrollFormToTop };
