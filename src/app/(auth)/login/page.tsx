import type { Metadata } from "next"

import { SignInForm } from "@/modules/authentication/components/SignInForm"

export const metadata: Metadata = {
  title: "Entrar · sclinic",
  description: "Acesse sua conta no sclinic",
}

export default function LoginPage() {
  return <SignInForm />
}
