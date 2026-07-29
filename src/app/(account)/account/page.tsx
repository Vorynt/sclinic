import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function AccountIndexPage() {
  return redirect(routes.accountOverview);
}
