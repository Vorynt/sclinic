import type { Metadata } from "next"
import { Suspense } from "react"

import { Spinner } from "@/components/ui/spinner"
import { ProfessionalInvitePageContent } from "@/modules/professionals/components/ProfessionalInvitePageContent"

export const metadata: Metadata = {
  title: "Convite profissional · sclinic",
}

export default function ProfessionalInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      }
    >
      <ProfessionalInvitePageContent />
    </Suspense>
  )
}
