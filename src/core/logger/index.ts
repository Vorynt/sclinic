type LogContext = Record<string, unknown>;

/**
 * Application logger stub — wire to a provider (e.g. Sentry) later.
 * Never log secrets (tokens, passwords, full connection strings).
 */
export const logger = {
  error(context: LogContext, message?: string): void {
    console.error(
      JSON.stringify({
        level: "error",
        message: message ?? "error",
        ...context,
        at: new Date().toISOString(),
      }),
    );
  },

  warn(context: LogContext, message?: string): void {
    console.warn(
      JSON.stringify({
        level: "warn",
        message: message ?? "warn",
        ...context,
        at: new Date().toISOString(),
      }),
    );
  },

  info(context: LogContext, message?: string): void {
    if (process.env.NODE_ENV === "production") return;
    console.info(
      JSON.stringify({
        level: "info",
        message: message ?? "info",
        ...context,
        at: new Date().toISOString(),
      }),
    );
  },
};
