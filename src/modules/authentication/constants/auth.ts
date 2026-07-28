import { routes } from "@/config/routes";

export const AUTH_CONSTANTS = {
  SESSION_COOKIE_CHECK_ONLY: true,
  DEFAULT_PASSWORD_RESET_REDIRECT: routes.resetPassword,
  DEFAULT_EMAIL_VERIFICATION_CALLBACK: routes.home,
} as const;
