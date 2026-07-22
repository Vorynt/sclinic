import { createHash, randomBytes } from "node:crypto"

/** Raw invite token (sent in the email URL — never persisted). */
export function createInviteToken(): string {
  return randomBytes(32).toString("hex")
}

/** SHA-256 hex digest of the raw token (stored in `invitations.token_hash`). */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}
