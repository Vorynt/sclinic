# Invite accept verifies email

Invited users are provisioned with `emailVerified: false` via
`userRepository.createWithCredential()`.

On invite acceptance, email is marked verified because owning the invite
token (delivered by email) proves address ownership:

- `invitationService.accept()` → `authService.markEmailVerifiedFromInvite()`
- `professionalService.acceptInvite()` → same

`getPostAuthRedirect` allows `next` under `/invite` before the verify-email
gate so login-with-invite-next can reach accept.
