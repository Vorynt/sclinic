import { AuthShell } from "@/modules/authentication/components/AuthShell";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthShell wide>{children}</AuthShell>;
}
