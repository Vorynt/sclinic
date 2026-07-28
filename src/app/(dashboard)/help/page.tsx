import type { Metadata } from "next";
import { Suspense } from "react";

import { HelpCenter } from "@/modules/help/components/HelpCenter";
import { HelpPageSkeleton } from "@/modules/help/components/HelpPageSkeleton";

export const metadata: Metadata = {
  title: "Ajuda · sclinic",
};

export default function HelpPage() {
  return (
    <Suspense fallback={<HelpPageSkeleton />}>
      <HelpCenter />
    </Suspense>
  );
}
