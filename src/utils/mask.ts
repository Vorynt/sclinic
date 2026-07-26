import { formatWithMask, unformatWithMask, type Mask } from "use-mask-input";

export type MaskName = "cpf" | "cnpj" | "phone" | "cep" | "currency";

/** Padrões/aliases usados no input e na formatação. */
export const MASKS: Record<MaskName, Mask> = {
  cpf: "cpf",
  cnpj: "cnpj",
  phone: ["(99) 9999-9999", "(99) 99999-9999"],
  cep: "99999-999",
  /** Alias built-in: R$ + milhar `.` + decimal `,` (autoUnmask). */
  currency: "brl-currency",
};

/** Opções padrão: valor lido do input/form sem máscara. */
export const MASK_INPUT_OPTIONS = {
  autoUnmask: true,
  showMaskOnHover: false,
  showMaskOnFocus: false,
} as const;

/** Currency: same unmask defaults, left-aligned like other form fields. */
export const CURRENCY_MASK_OPTIONS = {
  ...MASK_INPUT_OPTIONS,
  rightAlign: false,
} as const;

/** Formata valor bruto para exibição. */
export function formatMask(value: string, name: MaskName): string {
  if (!value) return "";
  return formatWithMask(value, MASKS[name]);
}

/** Remove a máscara (valor canônico do formulário). */
export function unmaskValue(value: string, name?: MaskName): string {
  if (!value) return "";
  if (name) return unformatWithMask(value, MASKS[name]);
  return value.replace(/\D/g, "");
}
