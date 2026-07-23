import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type HomeStatPlaceholder = {
  label: string
  value?: string
  hint?: string
}

type HomeStatPlaceholdersProps = {
  items: HomeStatPlaceholder[]
}

export function HomeStatPlaceholders({ items }: HomeStatPlaceholdersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {item.value ?? "—"}
            </CardTitle>
            {item.hint ? (
              <CardDescription>{item.hint}</CardDescription>
            ) : null}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
