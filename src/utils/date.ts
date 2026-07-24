import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse `YYYY-MM-DD` as local date (evita shift de fuso). */
export function parseISODate(value: string): Date | undefined {
  const match = ISO_DATE_RE.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

/** Serializa Date local para `YYYY-MM-DD`. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formata data para exibição em pt-BR (`dd/MM/yyyy`). */
export function formatDate(
  date: Date,
  formatString: string = "dd/MM/yyyy",
): string {
  return format(date, formatString, { locale: ptBR });
}

/** Formata `YYYY-MM-DD` para exibição; retorna string vazia se inválido. */
export function formatISODate(value: string): string {
  const date = parseISODate(value);
  return date ? formatDate(date) : "";
}
