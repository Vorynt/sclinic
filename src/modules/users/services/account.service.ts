import { requireAuth } from "@/modules/authentication/permissions/guards"
import type { UpdateAccountProfileDto } from "@/modules/users/dto/update-account-profile.dto"
import { accountRepository } from "@/modules/users/repositories/account.repository"
import type {
  AccountOverview,
  AccountProfile,
} from "@/modules/users/types/account"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

export const accountService = {
  async getOverview(ctx: AuthRequestContext): Promise<AccountOverview> {
    const auth = await requireAuth(ctx)
    const overview = await accountRepository.findOverview(
      auth.user.id,
      auth.session.activeClinicId,
    )

    if (!overview) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return overview
  },

  async getProfile(ctx: AuthRequestContext): Promise<AccountProfile> {
    const auth = await requireAuth(ctx)
    const profile = await accountRepository.findProfile(auth.user.id)

    if (!profile) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return profile
  },

  async updateProfile(
    data: UpdateAccountProfileDto,
    ctx: AuthRequestContext,
  ): Promise<AccountProfile> {
    const auth = await requireAuth(ctx)
    const updated = await accountRepository.updateProfile({
      userId: auth.user.id,
      name: data.name,
      phone: data.phone,
    })

    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return updated
  },
}
