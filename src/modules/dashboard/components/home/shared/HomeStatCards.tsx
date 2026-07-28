import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type HomeStatCard = {
  label: string
  value?: string
  hint?: string
}

type HomeStatCardsProps = {
  items: HomeStatCard[]
}

export function HomeStatCards({ items }: HomeStatCardsProps) {
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
