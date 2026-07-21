import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (.env.local or .env)");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  entities: {
    roles: {
      provider: "neon",
      // App role is provisioned via src/db/sql/001_app_role.sql
      exclude: ["sclinic_app"],
    },
  },
});
