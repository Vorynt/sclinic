"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useSignInMutation } from "@/modules/authentication/hooks/use-auth";
import { AppError } from "@/shared/errors";

export function SignInForm() {
  const router = useRouter();
  const signIn = useSignInMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    try {
      await signIn.mutateAsync({ email, password });
      toast.success("Login realizado com sucesso");
      router.push(routes.dashboard);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Não foi possível entrar. Tente novamente.";

      toast.error(message);

      if (error instanceof AppError && error.meta?.fields) {
        const fields = error.meta.fields as Record<string, string[]>;
        setFieldErrors({
          email: fields.email?.[0],
          password: fields.password?.[0],
        });
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-8"
      noValidate>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre com seu e-mail e senha para acessar a clínica.
        </p>
      </div>

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
          <FieldLabel htmlFor="sign-in-email">E-mail</FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@clinica.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            disabled={signIn.isPending}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
          <FieldLabel htmlFor="sign-in-password">Senha</FieldLabel>
          <Input
            id="sign-in-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password) || undefined}
            disabled={signIn.isPending}
          />
          <FieldError>{fieldErrors.password}</FieldError>
        </Field>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.forgotPassword}>Esqueci minha senha</Link>
          </Button>
        </div>
      </FieldGroup>

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
    </form>
  );
}
