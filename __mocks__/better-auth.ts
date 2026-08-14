/** Jest stub: better-auth is ESM and is not transformed by next/jest. */
export class APIError extends Error {
  status: string;
  body: { message?: string; code?: string };

  constructor(status: string, body: { message?: string; code?: string } = {}) {
    super(body.message ?? "");
    this.name = "APIError";
    this.status = status;
    this.body = body;
  }
}

export function betterAuth(_config?: unknown) {
  return {
    api: {},
    handler: async () => new Response(),
  };
}

export function drizzleAdapter(..._args: unknown[]) {
  return {};
}

export function nextCookies() {
  return {};
}

export function twoFactor() {
  return {};
}

export function getSessionCookie() {
  return null;
}

export function hashPassword() {
  return Promise.resolve("");
}

export function createAuthClient() {
  return {};
}

export function toNextJsHandler() {
  return {
    GET: async () => new Response(),
    POST: async () => new Response(),
  };
}
