"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type TotpCodeInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
};

const SLOT_COUNT = 6;

const slotClassName =
  "h-12 w-0 min-w-0 flex-1 text-base font-medium tabular-nums";

export function TotpCodeInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  autoFocus,
}: TotpCodeInputProps) {
  const invalidAttr = invalid || undefined;

  return (
    <InputOTP
      id={id}
      maxLength={SLOT_COUNT}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete="one-time-code"
      inputMode="numeric"
      aria-invalid={invalidAttr}
      containerClassName="relative w-full gap-3"
    >
      <InputOTPGroup className="min-w-0 flex-1">
        <InputOTPSlot
          index={0}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
        <InputOTPSlot
          index={1}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
        <InputOTPSlot
          index={2}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
      </InputOTPGroup>
      <InputOTPSeparator className="shrink-0" />
      <InputOTPGroup className="min-w-0 flex-1">
        <InputOTPSlot
          index={3}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
        <InputOTPSlot
          index={4}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
        <InputOTPSlot
          index={5}
          aria-invalid={invalidAttr}
          className={slotClassName}
        />
      </InputOTPGroup>
    </InputOTP>
  );
}
