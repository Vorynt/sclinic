import type { Metadata } from "next";
import { Suspense } from "react";

import { TwoFactorForm } from "@/modules/authentication/components/TwoFactorForm";

export const metadata: Metadata = {
  title: "Autenticação em duas etapas",
  description: "Confirme o código do autenticador para entrar no sclinic",
};

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorForm />
    </Suspense>
  );
}
