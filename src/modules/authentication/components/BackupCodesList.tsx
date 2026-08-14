"use client"

type BackupCodesListProps = {
  codes: string[]
}

export function BackupCodesList({ codes }: BackupCodesListProps) {
  return (
    <ol className="grid gap-2 rounded-lg bg-muted/60 p-3 font-mono text-sm sm:grid-cols-2">
      {codes.map((code) => (
        <li key={code} className="truncate text-foreground">
          {code}
        </li>
      ))}
    </ol>
  )
}

export async function copyBackupCodes(codes: string[]): Promise<void> {
  await navigator.clipboard.writeText(codes.join("\n"))
}
