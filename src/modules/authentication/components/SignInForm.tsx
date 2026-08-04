"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert, scrollFormToTop } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useSignInMutation } from "@/modules/authentication/hooks/use-auth";
import { signInSchema } from "@/modules/authentication/schemas/auth.schema";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type SignInValues = z.input<typeof signInSchema>;
type SignInOutput = z.output<typeof signInSchema>;

const SIGN_IN_FORM_ID = "sign-in-form";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const signIn = useSignInMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso");
      router.replace(getPostAuthRedirect(data, next));
    },
    onError: (error) => {
      console.error(error);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues, unknown, SignInOutput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      setFormError(null);
      signIn.mutate(data);
    },
    () => {
      scrollFormToTop(document.getElementById(SIGN_IN_FORM_ID));
    },
  );

  return (
    <form
      id={SIGN_IN_FORM_ID}
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-8"
      noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Entrar na conta
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use seu e-mail e senha para acessar a clínica.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} />
      ) : null}

      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="sign-in-email">E-mail</FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            placeholder="voce@clinica.com"
            aria-invalid={Boolean(errors.email) || undefined}
            disabled={signIn.isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="sign-in-password">Senha</FieldLabel>
            <Link
              href={routes.forgotPassword}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password) || undefined}
            disabled={signIn.isPending}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={signIn.isPending}>
          {signIn.isPending ? (
            <>
              <Spinner />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            href={routes.signUp}
            className="font-medium text-foreground underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </form>
  );
}
