import type { Metadata } from "next"
import { Suspense } from "react"

import { Spinner } from "@/components/ui/spinner"
import { ResetPasswordForm } from "@/modules/authentication/components/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Redefinir senha · sclinic",
  description: "Defina uma nova senha para a sua conta",
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
