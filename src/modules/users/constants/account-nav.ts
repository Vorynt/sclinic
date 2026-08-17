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
    title: "Clínicas",
    href: routes.accountClinics,
    description: "Clínicas que você possui ou participa",
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
    description: "Senha, 2FA e sessões",
  },
];
