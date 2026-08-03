import type { Metadata } from "next";
import { Suspense } from "react";

import { SignUpForm } from "@/modules/authentication/components/SignUpForm";

export const metadata: Metadata = {
  title: "Cadastro",
  description: "Crie sua conta no sclinic",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
