"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const readableMessage = toReadableMessage(message);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [readableMessage]);

  return (
    <div ref={ref}>
      <Alert variant="destructive" className={cn(className)}>
        <WarningCircleIcon className="size-5" />
        <AlertTitle>Não foi possível continuar</AlertTitle>
        <AlertDescription>{readableMessage}</AlertDescription>
      </Alert>
    </div>
  );
}

/** Scrolls a form (or any container) to the top so form-level errors are visible. */
function scrollFormToTop(element: HTMLElement | null) {
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export { FormErrorAlert, scrollFormToTop };
