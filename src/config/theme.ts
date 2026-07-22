/**
 * Design tokens — espelham CSS variables em `src/app/globals.css`.
 * Fonte de verdade visual: globals.css; este arquivo documenta e tipa o contrato.
 */
export const theme = {
  name: "sclinic",
  fonts: {
    sans: {
      family: "Inter",
      cssVar: "--font-sans",
      usage: "Corpo de texto, labels e UI geral",
    },
    heading: {
      family: "Space Grotesk",
      cssVar: "--font-heading",
      usage: "Títulos e headings (CardTitle, etc.)",
    },
    mono: {
      family: "Geist Mono",
      cssVar: "--font-geist-mono",
      usage: "Código, IDs e dados monoespaçados",
    },
  },
  radius: {
    base: "0.625rem",
    scale: {
      sm: "calc(var(--radius) * 0.6)",
      md: "calc(var(--radius) * 0.8)",
      lg: "var(--radius)",
      xl: "calc(var(--radius) * 1.4)",
      "2xl": "calc(var(--radius) * 1.8)",
      "3xl": "calc(var(--radius) * 2.2)",
      "4xl": "calc(var(--radius) * 2.6)",
    },
  },
  spacing: {
    /** Escala Tailwind padrão (rem); use classes `p-*` / `gap-*` / `m-*`. */
    scale: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const,
    unit: "0.25rem",
  },
  colors: {
    semantic: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "border",
      "input",
      "ring",
    ] as const,
    chart: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const,
    sidebar: [
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ] as const,
  },
  typography: {
    sizes: [
      { name: "xs", className: "text-xs", size: "0.75rem", lineHeight: "1rem" },
      { name: "sm", className: "text-sm", size: "0.875rem", lineHeight: "1.25rem" },
      { name: "base", className: "text-base", size: "1rem", lineHeight: "1.5rem" },
      { name: "lg", className: "text-lg", size: "1.125rem", lineHeight: "1.75rem" },
      { name: "xl", className: "text-xl", size: "1.25rem", lineHeight: "1.75rem" },
      { name: "2xl", className: "text-2xl", size: "1.5rem", lineHeight: "2rem" },
      { name: "3xl", className: "text-3xl", size: "1.875rem", lineHeight: "2.25rem" },
      { name: "4xl", className: "text-4xl", size: "2.25rem", lineHeight: "2.5rem" },
    ],
    weights: [
      { name: "normal", className: "font-normal", value: "400" },
      { name: "medium", className: "font-medium", value: "500" },
      { name: "semibold", className: "font-semibold", value: "600" },
      { name: "bold", className: "font-bold", value: "700" },
    ],
  },
} as const;

export type ThemeColor =
  | (typeof theme.colors.semantic)[number]
  | (typeof theme.colors.chart)[number]
  | (typeof theme.colors.sidebar)[number];
