/**
 * Lightweight HTML sanitizer for prescription layouts and body fragments.
 * Strips scripts, event handlers, and dangerous URLs. No external dependency.
 */

const FORBIDDEN_TAGS =
  /<\/?(?:script|iframe|object|embed|link|meta|base|form|input|button|textarea|select|svg|math)\b[^>]*>/gi

const EVENT_HANDLER_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

const DANGEROUS_URL_ATTR =
  /(\s+(?:href|src|xlink:href)\s*=\s*)(["'])\s*(?:javascript|data|vbscript):[^"']*\2/gi

const STYLE_EXPRESSION =
  /(\s+style\s*=\s*)(["'])(?:(?!\2).)*expression\s*\([^"']*\2/gi

export function sanitizePrescriptionHtml(html: string): string {
  return html
    .replace(FORBIDDEN_TAGS, "")
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(DANGEROUS_URL_ATTR, "$1$2#$2")
    .replace(STYLE_EXPRESSION, "$1$2$2")
}
