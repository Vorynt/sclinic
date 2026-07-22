import { routes } from "@/config/routes";

export const AUTH_CONSTANTS = {
  SESSION_COOKIE_CHECK_ONLY: true,
  DEFAULT_PASSWORD_RESET_REDIRECT: "/reset-password",
  DEFAULT_EMAIL_VERIFICATION_CALLBACK: routes.dashboard,
} as const;
