"use client"

import { toast } from "sonner"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  useAuthSessions,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
} from "@/modules/authentication/hooks/use-auth"
import { sessionDeviceLabel } from "@/modules/authentication/utils/session-device-label"
import { formatDate } from "@/utils/date"

export function AccountSessionsPanel() {
  const { data, isPending, isError, refetch, isFetching } = useAuthSessions()
  const otherCount = data?.filter((session) => !session.isCurrent).length ?? 0

  const revokeOne = useRevokeSessionMutation({
    onSuccess: () => toast.success("Sessão encerrada"),
    onError: (error) => toast.error(error.message),
  })

  const revokeOthers = useRevokeOtherSessionsMutation({
    onSuccess: () => toast.success("Outras sessões encerradas"),
    onError: (error) => toast.error(error.message),
  })

  return (
    <section className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Sessões ativas
        </h3>
        <p className="text-sm text-muted-foreground">
          Encerrar o acesso em outros dispositivos não afeta esta sessão.
        </p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Carregando sessões…
        </div>
      ) : isError || !data ? (
        <QueryErrorState
          description="Não foi possível carregar as sessões."
          onRetry={() => {
            void refetch()
          }}
          isRetrying={isFetching}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.map((session) => (
              <li
                key={session.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/80 p-3"
              >
                <div className="min-w-0 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {sessionDeviceLabel(session.userAgent)}
                    </p>
                    {session.isCurrent ? (
                      <Badge variant="secondary">Este dispositivo</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.ipAddress ?? "IP indisponível"} · último início{" "}
                    {formatDate(session.createdAt, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                {session.isCurrent ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={revokeOne.isPending || revokeOthers.isPending}
                    onClick={() => {
                      revokeOne.mutate({ sessionId: session.id })
                    }}
                  >
                    Encerrar
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {otherCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={revokeOthers.isPending || revokeOne.isPending}
              onClick={() => {
                revokeOthers.mutate()
              }}
            >
              {revokeOthers.isPending ? <Spinner /> : null}
              Encerrar outras sessões
            </Button>
          ) : null}
        </>
      )}
    </section>
  )
}
