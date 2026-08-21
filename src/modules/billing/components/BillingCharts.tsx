"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Area, AreaChart, XAxis } from "recharts";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingInsightsQuery } from "@/modules/billing/hooks/use-charges";
import type { BillingInsightsInput } from "@/modules/billing/schemas/charge.schema";
import { describeTopPaymentMethod } from "@/modules/billing/utils/billing-insight-copy";
import { formatCentsToBrl } from "@/modules/billing/utils/money";

const receivedConfig = {
  received: { label: "Recebido", color: "var(--chart-1)" },
  expected: { label: "Esperado", color: "var(--chart-2)" },
} satisfies ChartConfig;

type BillingChartsProps = {
  filters: BillingInsightsInput;
};

function formatBucket(bucket: string, grain: "day" | "week") {
  const date = new Date(`${bucket}T00:00:00`);
  if (Number.isNaN(date.getTime())) return bucket;
  const label = format(date, "d MMM", { locale: ptBR });
  if (grain === "week") return `Sem. ${label}`;
  return label;
}

function formatChartMoney(value: unknown) {
  return formatCentsToBrl(Math.round(Number(value) * 100));
}

export function BillingCharts({ filters }: BillingChartsProps) {
  const insightsQuery = useBillingInsightsQuery(filters);

  if (insightsQuery.isLoading) {
    return <BillingChartsSkeleton />;
  }

  if (insightsQuery.isError || !insightsQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar o resumo do período."
        onRetry={() => {
          void insightsQuery.refetch();
        }}
        isRetrying={insightsQuery.isFetching}
      />
    );
  }

  const insights = insightsQuery.data;
  const timeData = insights.byTime.map((row) => ({
    bucket: formatBucket(row.bucket, insights.period.grain),
    received: row.receivedCents / 100,
    expected: row.billedCents / 100,
  }));
  const methodRows = [...insights.byMethod]
    .filter((row) => row.amountCents > 0)
    .sort((a, b) => b.amountCents - a.amountCents);
  const topPaymentCopy = describeTopPaymentMethod(insights.byMethod);
  const grainLabel =
    insights.period.grain === "day" ? "ao longo dos dias" : "semana a semana";

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Quanto entrou</CardTitle>
        <CardDescription>
          {topPaymentCopy ?? `Entradas ${grainLabel}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        {timeData.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            Ainda não há entradas neste período.
          </p>
        ) : (
          <ChartContainer
            config={receivedConfig}
            className="aspect-auto h-36 w-full">
            <AreaChart data={timeData} accessibilityLayer>
              <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={formatChartMoney} />}
              />
              <Area
                type="bump"
                dataKey="received"
                fill="var(--color-received)"
                fillOpacity={0.18}
                stroke="var(--color-received)"
                strokeWidth={2}
              />
              <Area
                type="bump"
                dataKey="expected"
                fill="var(--color-expected)"
                fillOpacity={0.18}
                stroke="var(--color-expected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function BillingChartsSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-52" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(14rem,0.85fr)]">
          <Skeleton className="h-36 w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
