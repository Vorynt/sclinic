"use client";

import * as React from "react";
import { useMaskInput } from "use-mask-input";

import { Input } from "@/components/ui/input";
import { MASK_INPUT_OPTIONS, MASKS, type MaskName } from "@/utils/mask";

type MaskedInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  mask: MaskName;
  type?: "text" | "tel" | "search" | "url" | "email";
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    ref.current = value;
  }
}

/**
 * Input com máscara via `use-mask-input`.
 * Com `autoUnmask`, o valor do DOM/form fica sem máscara.
 */
function MaskedInput({ mask, ref, type, ...props }: MaskedInputProps) {
  const maskRef = useMaskInput({
    mask: MASKS[mask],
    options: MASK_INPUT_OPTIONS,
  });

  const setRefs = (node: HTMLInputElement | null) => {
    maskRef(node);
    assignRef(ref, node);
  };

  return (
    <Input
      {...props}
      ref={setRefs}
      type={type ?? (mask === "phone" ? "tel" : "text")}
      inputMode={props.inputMode ?? "numeric"}
      autoComplete={
        props.autoComplete ?? (mask === "phone" ? "tel" : undefined)
      }
    />
  );
}

export { MaskedInput };
