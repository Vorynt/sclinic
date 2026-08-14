"use client";

import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-8 w-full min-w-0 rounded-lg bg-background border border-input px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&::-ms-reveal]:hidden";

function InputControl({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  );
}

function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative w-full min-w-0" data-slot="password-input">
      <InputControl
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-8", className)}
        {...props}
      />
      <div className="absolute inset-y-0 right-0.5 flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground active:translate-y-0"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}>
          {isVisible ? <EyeClosedIcon /> : <EyeIcon weight="duotone" />}
        </Button>
      </div>
    </div>
  );
}

function Input({ type, ...props }: React.ComponentProps<"input">) {
  if (type === "password") {
    return <PasswordInput {...props} />;
  }

  return <InputControl type={type} {...props} />;
}

export { Input };
