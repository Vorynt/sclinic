"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useSignUpMutation } from "@/modules/authentication/hooks/use-auth"
import { AppError } from "@/shared/errors"

export function SignUpForm() {
  const router = useRouter()
  const signUp = useSignUpMutation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    try {
      await signUp.mutateAsync({ name, email, password })
      toast.success("Conta criada com sucesso")
      router.push(routes.dashboard)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Não foi possível criar a conta. Tente novamente."

      toast.error(message)

      if (error instanceof AppError && error.meta?.fields) {
        const fields = error.meta.fields as Record<string, string[]>
        setFieldErrors({
          name: fields.name?.[0],
          email: fields.email?.[0],
          password: fields.password?.[0],
        })
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-8"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Seja um parceiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie sua conta para começar a usar o sclinic.
        </p>
      </div>

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(fieldErrors.name) || undefined}>
          <FieldLabel htmlFor="sign-up-name">Nome</FieldLabel>
          <Input
            id="sign-up-name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name) || undefined}
            disabled={signUp.isPending}
          />
          <FieldError>{fieldErrors.name}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
          <FieldLabel htmlFor="sign-up-email">E-mail</FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@clinica.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            disabled={signUp.isPending}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
          <FieldLabel htmlFor="sign-up-password">Senha</FieldLabel>
          <Input
            id="sign-up-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password) || undefined}
            disabled={signUp.isPending}
          />
          <FieldError>{fieldErrors.password}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={signUp.isPending}
        >
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
  )
}
