"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  CircleIcon,
  LockSimpleIcon,
  StethoscopeIcon,
  TagIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OwnerSetupMissionId } from "@/modules/dashboard/constants/owner-setup-missions";
import { useOwnerSetupProgress } from "@/modules/dashboard/hooks/use-owner-setup-progress";
import type { OwnerSetupMissionView } from "@/modules/dashboard/utils/owner-setup-progress";

const MISSION_ICONS: Record<OwnerSetupMissionId, Icon> = {
  professional: StethoscopeIcon,
  service: TagIcon,
  patient: UsersIcon,
  appointment: CalendarBlankIcon,
};

function MissionRow({ mission }: { mission: OwnerSetupMissionView }) {
  const Icon = MISSION_ICONS[mission.id];

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between",
        mission.completed && "bg-muted/30 line-through",
        mission.locked && "opacity-70",
      )}>
      <div className="flex min-w-0 gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            mission.completed
              ? "bg-chart-2/15 text-chart-4 dark:text-chart-2"
              : mission.locked
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary",
          )}>
          {mission.completed ? (
            <CheckCircleIcon className="size-4" weight="fill" />
          ) : mission.locked ? (
            <LockSimpleIcon className="size-4" weight="fill" />
          ) : (
            <Icon className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{mission.title}</p>
            {mission.completed ? (
              <Badge variant="success">Pronto</Badge>
            ) : mission.locked ? (
              <Badge variant="outline">Depois</Badge>
            ) : (
              <Badge variant="info">Agora</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{mission.description}</p>
          {mission.locked ? (
            <p className="text-xs text-muted-foreground">
              Finalize os passos acima antes de marcar a consulta.
            </p>
          ) : null}
        </div>
      </div>

      {!mission.completed && !mission.locked ? (
        <Button
          asChild
          size="sm"
          className="shrink-0 self-start sm:self-center">
          <Link href={mission.href}>{mission.ctaLabel}</Link>
        </Button>
      ) : null}

      {mission.locked ? (
        <Button
          size="sm"
          variant="secondary"
          disabled
          className="shrink-0 self-start sm:self-center">
          <LockSimpleIcon data-icon="inline-start" />
          Em breve
        </Button>
      ) : null}
    </li>
  );
}

export function OwnerSetupRoadmap() {
  const { progress, isLoading, isError } = useOwnerSetupProgress();

  if (isError) return null;
  if (!isLoading && progress?.allComplete) return null;

  if (isLoading || !progress) {
    return (
      <Card size="sm" aria-busy="true" aria-label="Carregando primeiros passos">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-1 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const nextMission = progress.missions.find((m) => !m.completed && !m.locked);

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-base">
              Vamos preparar sua clínica
            </CardTitle>
            <CardDescription>
              Faça estes passos na ordem para começar a marcar consultas.
            </CardDescription>
          </div>
          <Badge variant="outline" className="tabular-nums">
            {progress.completedCount} de {progress.totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CircleIcon className="size-3" weight="fill" aria-hidden />
              Quanto falta
            </span>
            <span className="tabular-nums">{progress.percent}%</span>
          </div>
          <Progress
            value={progress.percent}
            aria-label="Quanto falta para preparar a clínica"
          />
        </div>

        <ol className="flex flex-col gap-2">
          {progress.missions.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </ol>

        {nextMission ? (
          <p className="text-xs text-muted-foreground">
            Próximo: {nextMission.title}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
