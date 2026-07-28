import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Validação e tipagem de variáveis de ambiente.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get BETTER_AUTH_SECRET() {
    return requireEnv("BETTER_AUTH_SECRET");
  },
  get BETTER_AUTH_URL() {
    if (process.env.BETTER_AUTH_URL) {
      return process.env.BETTER_AUTH_URL;
    }
    // Preview deployments: Vercel injects the deployment host.
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return requireEnv("BETTER_AUTH_URL");
  },
  get RESEND_API_KEY() {
    return requireEnv("RESEND_API_KEY");
  },
  /** Default From address, e.g. `sclinic <noreply@yourdomain.com>`. */
  get EMAIL_FROM() {
    return requireEnv("EMAIL_FROM");
  },
  /** Stripe secret key — required only when calling Stripe APIs. */
  get STRIPE_SECRET_KEY() {
    return requireEnv("STRIPE_SECRET_KEY");
  },
  get STRIPE_WEBHOOK_SECRET() {
    return requireEnv("STRIPE_WEBHOOK_SECRET");
  },
  /** True when Checkout / Portal can run (secret key present). */
  get isStripeConfigured() {
    return Boolean(optionalEnv("STRIPE_SECRET_KEY"));
  },
};
