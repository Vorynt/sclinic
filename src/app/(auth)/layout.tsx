import { AuthShell } from "@/modules/authentication/components/AuthShell"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthShell>{children}</AuthShell>
}
