"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useSignUpMutation } from "@/modules/authentication/hooks/use-auth";
import { signUpSchema } from "@/modules/authentication/schemas/auth.schema";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type SignUpValues = z.input<typeof signUpSchema>;
type SignUpOutput = z.output<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpValues, unknown, SignUpOutput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signUp = useSignUpMutation({
    onSuccess: (data) => {
      toast.success("Conta criada com sucesso");
      router.replace(getPostAuthRedirect(data));
    },
    onError: (error) => {
      console.error(error);
      if (isAppError(error)) {
        setFormError({
          message: error.message,
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

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    signUp.mutate(data);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-8"
      noValidate>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Seja um parceiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie sua conta para começar a usar o sclinic.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="sign-up-name">Nome</FieldLabel>
          <Input
            id="sign-up-name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={signUp.isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="sign-up-email">E-mail</FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            placeholder="voce@clinica.com"
            aria-invalid={Boolean(errors.email) || undefined}
            disabled={signUp.isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="sign-up-password">Senha</FieldLabel>
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={Boolean(errors.password) || undefined}
            disabled={signUp.isPending}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={signUp.isPending}>
          {signUp.isPending ? (
            <>
              <Spinner />
              Criando conta…
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.login}>Já tenho conta</Link>
        </Button>
      </div>
    </form>
  );
}
