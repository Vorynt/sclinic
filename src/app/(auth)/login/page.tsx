import type { Metadata } from "next";
import { Suspense } from "react";

import { SignInForm } from "@/modules/authentication/components/SignInForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no sclinic",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
