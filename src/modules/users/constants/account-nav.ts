import { routes } from "@/config/routes";

export type AccountNavItem = {
  title: string;
  href: string;
  description: string;
  /** When true, item is shown only if the user has a SaaS subscription row (any status). */
  requiresAccountSubscription?: boolean;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    title: "Visão geral",
    href: routes.accountOverview,
    description: "Resumo da conta e clínicas vinculadas",
  },
  {
    title: "Assinatura",
    href: routes.accountSubscription,
    description: "Plano e pagamento",
    requiresAccountSubscription: true,
  },
  {
    title: "Dados pessoais",
    href: routes.accountProfile,
    description: "Nome e telefone",
  },
  {
    title: "Segurança",
    href: routes.accountSecurity,
    description: "Alterar senha de acesso",
  },
];
