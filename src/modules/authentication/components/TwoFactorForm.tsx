"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { TotpCodeInput } from "@/modules/authentication/components/TotpCodeInput";
import {
  useVerifyBackupCodeMutation,
  useVerifyTwoFactorMutation,
} from "@/modules/authentication/hooks/use-auth";
import {
  verifyBackupCodeSchema,
  verifyTotpSchema,
} from "@/modules/authentication/schemas/auth.schema";
import type { AuthContext } from "@/modules/authentication/types/auth";
import {
  getPostAuthRedirect,
  getSafeNextPath,
} from "@/modules/authentication/utils/post-auth-redirect";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";
import { useAuthUiStore } from "@/stores/auth.store";

type TotpValues = z.input<typeof verifyTotpSchema>;
type TotpOutput = z.output<typeof verifyTotpSchema>;
type BackupValues = z.input<typeof verifyBackupCodeSchema>;
type BackupOutput = z.output<typeof verifyBackupCodeSchema>;

export function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const beginSessionBootstrap = useAuthUiStore((s) => s.beginSessionBootstrap);

  const continueAfterAuth = (data: AuthContext) => {
    const dest = getPostAuthRedirect(data, next);
    const safeNext = getSafeNextPath(next);
    const landsInAppShell =
      Boolean(data.membership) &&
      data.user.emailVerified &&
      !data.user.mustChangePassword &&
      !(safeNext?.startsWith(routes.invite) ?? false);

    if (landsInAppShell) {
      beginSessionBootstrap();
    }
    router.replace(dest);
  };

  const onError = (error: unknown) => {
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
  };

  const verifyTotp = useVerifyTwoFactorMutation({
    onSuccess: continueAfterAuth,
    onError,
  });

  const verifyBackup = useVerifyBackupCodeMutation({
    onSuccess: continueAfterAuth,
    onError,
  });

  const totpForm = useForm<TotpValues, unknown, TotpOutput>({
    resolver: zodResolver(verifyTotpSchema),
    defaultValues: { code: "" },
  });

  const backupForm = useForm<BackupValues, unknown, BackupOutput>({
    resolver: zodResolver(verifyBackupCodeSchema),
    defaultValues: { code: "" },
  });

  const isPending = verifyTotp.isPending || verifyBackup.isPending;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Autenticação em duas etapas
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {mode === "totp"
            ? "Abra o app autenticador e informe o código de 6 dígitos."
            : "Informe um dos códigos de backup salvos ao ativar o 2FA."}
        </p>
      </div>

      {formError ? <FormErrorAlert message={formError.message} /> : null}

      {mode === "totp" ? (
        <form
          onSubmit={totpForm.handleSubmit((data) => {
            setFormError(null);
            verifyTotp.mutate(data);
          })}
          className="flex flex-col gap-6"
          noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(totpForm.formState.errors.code)}>
              <FieldLabel htmlFor="two-factor-code" className="sr-only">
                Código
              </FieldLabel>
              <Controller
                name="code"
                control={totpForm.control}
                render={({ field, fieldState }) => (
                  <TotpCodeInput
                    id="two-factor-code"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    invalid={fieldState.invalid}
                    autoFocus
                  />
                )}
              />
              <FieldError errors={[totpForm.formState.errors.code]} />
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {verifyTotp.isPending ? (
              <>
                <Spinner />
                Verificando…
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={backupForm.handleSubmit((data) => {
            setFormError(null);
            verifyBackup.mutate(data);
          })}
          className="flex flex-col gap-6"
          noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(backupForm.formState.errors.code)}>
              <FieldLabel htmlFor="two-factor-backup">
                Código de backup
              </FieldLabel>
              <Input
                id="two-factor-backup"
                autoComplete="off"
                placeholder="Código de recuperação"
                disabled={isPending}
                aria-invalid={Boolean(backupForm.formState.errors.code)}
                {...backupForm.register("code")}
              />
              <FieldError errors={[backupForm.formState.errors.code]} />
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {verifyBackup.isPending ? (
              <>
                <Spinner />
                Verificando…
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={() => {
            setFormError(null);
            setMode(mode === "totp" ? "backup" : "totp");
          }}
        >
          {mode === "totp"
            ? "Usar um código de backup"
            : "Usar o app autenticador"}
        </button>
        <Link
          href={routes.login}
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
