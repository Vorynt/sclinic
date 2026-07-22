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

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get BETTER_AUTH_SECRET() {
    return requireEnv("BETTER_AUTH_SECRET");
  },
  get BETTER_AUTH_URL() {
    return requireEnv("BETTER_AUTH_URL");
  },
};
