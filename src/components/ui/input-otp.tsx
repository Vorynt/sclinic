"use client";

import { MinusIcon } from "@phosphor-icons/react";
import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

import { cn } from "@/lib/utils";

type InputOTPProps = Omit<
  React.ComponentProps<typeof OTPInput>,
  "render" | "children"
> & {
  containerClassName?: string;
  children: React.ReactNode;
};

function InputOTP({
  className,
  containerClassName,
  children,
  ...props
}: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    >
      {children}
    </OTPInput>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center border-y border-r border-input bg-background text-sm transition-colors outline-none first:rounded-l-lg first:border-l last:rounded-r-lg dark:bg-input/30",
        "aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50",
        "data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-3 data-[active=true]:aria-invalid:ring-destructive/20",
        "dark:aria-invalid:border-destructive/50 dark:data-[active=true]:aria-invalid:border-destructive/50 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  );
}

function InputOTPSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn(
        "flex items-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
