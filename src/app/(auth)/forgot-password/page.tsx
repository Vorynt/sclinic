import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/modules/authentication/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Recupere o acesso à sua conta",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
