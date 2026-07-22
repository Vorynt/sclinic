import type { Metadata } from "next"

import { SignUpForm } from "@/modules/authentication/components/SignUpForm"

export const metadata: Metadata = {
  title: "Cadastro · sclinic",
  description: "Crie sua conta no sclinic",
}

export default function SignUpPage() {
  return <SignUpForm />
}
