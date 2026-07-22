import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/config/env";
import { email } from "@/core/email";
import { logger } from "@/core/logger";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";

/**
 * Better Auth instance (platform).
 *
 * Session/credential persistence goes through the BA Drizzle adapter
 * (auth tables only). Domain reads/writes (status, memberships,
 * activeClinicId) go through authentication repositories.
 */
export const auth = betterAuth({
  appName: "sclinic",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
    // Matches Drizzle column property names (emailVerified, userId, …).
    camelCase: true,
    // Neon HTTP driver has no interactive transactions.
    transaction: false,
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user: targetUser, url }) => {
      // Fire-and-forget to avoid timing side-channels (Better Auth guidance).
      void email.messages
        .emailVerification({
          to: targetUser.email,
          name: targetUser.name,
          verifyUrl: url,
        })
        .then(() => {
          logger.info(
            {
              email: targetUser.email,
              userId: targetUser.id,
              hasVerifyUrl: Boolean(url),
            },
            "Verification email sent",
          );
        })
        .catch((error: unknown) => {
          logger.error(
            {
              email: targetUser.email,
              userId: targetUser.id,
              error,
            },
            "Failed to send verification email",
          );
        });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user: targetUser, url }) => {
      await email.messages.passwordReset({
        to: targetUser.email,
        name: targetUser.name,
        resetUrl: url,
      });

      // Never log the raw token URL.
      logger.info(
        {
          email: targetUser.email,
          userId: targetUser.id,
          hasResetUrl: Boolean(url),
        },
        "Password reset email sent",
      );
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      activeClinicId: {
        type: "string",
        required: false,
        input: false,
      },
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    // Keep activeClinicId (domain field) consistent with DB reads.
    cookieCache: {
      enabled: false,
    },
  },
  plugins: [nextCookies()],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
