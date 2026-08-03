import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";
import { InvitePageContent } from "@/modules/users/components/InvitePageContent";

export const metadata: Metadata = {
  title: "Aceitar convite",
};

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      }>
      <InvitePageContent />
    </Suspense>
  );
}
