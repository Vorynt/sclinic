import type {
  ListMembersInput,
  UpdateMemberRoleInput,
  UpdateMemberStatusInput,
} from "@/modules/users/schemas/member.schema"
import type { ClinicMember } from "@/modules/users/types/member"

export type ListMembersDto = ListMembersInput
export type UpdateMemberRoleDto = UpdateMemberRoleInput
export type UpdateMemberStatusDto = UpdateMemberStatusInput
export type ClinicMemberResult = ClinicMember
