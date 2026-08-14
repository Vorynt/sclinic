"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/modules/authentication/components/ChangePasswordDialog";
import { useChangePasswordMutation } from "@/modules/authentication/hooks/use-auth";
import type { ChangePasswordInput } from "@/modules/authentication/schemas/auth.schema";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

export function AccountSecurityForm() {
  const [open, setOpen] = useState(false);
  const revokedOthersRef = useRef(false);
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const changePassword = useChangePasswordMutation({
    onSuccess: () => {
      toast.success(
        revokedOthersRef.current
          ? "Senha atualizada. Outras sessões foram encerradas."
          : "Senha atualizada",
      );
      setFormError(null);
      setOpen(false);
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({
          message: getClientMessage(error.code),
          code: error.code,
        });
        return;
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      });
    },
  });

  return (
    <>
      <Button
        type="button"
        variant={"outline"}
        className="w-fit"
        onClick={() => setOpen(true)}>
        Alterar senha
      </Button>
      <ChangePasswordDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFormError(null);
        }}
        isPending={changePassword.isPending}
        error={formError}
        onConfirm={(data: ChangePasswordInput) => {
          setFormError(null);
          revokedOthersRef.current = data.revokeOtherSessions;
          changePassword.mutate(data);
        }}
      />
    </>
  );
}
