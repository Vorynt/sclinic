"use client";

import { ClockIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Permission } from "@/config/permissions";
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog";
import { WaitlistEnqueueDialog } from "@/modules/appointments/components/WaitlistEnqueueDialog";
import {
  useCancelWaitlistMutation,
  useWaitlistQuery,
} from "@/modules/appointments/hooks/use-waitlist";
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist";
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection";
import { useAuth } from "@/providers/AuthProvider";

type WaitlistRowProps = {
  entry: WaitlistEntry;
  canManage: boolean;
  onPromote: (entry: WaitlistEntry) => void;
  onCancel: (entry: WaitlistEntry) => void;
};

function WaitlistRow({ entry, canManage, onPromote, onCancel }: WaitlistRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {entry.patientName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[entry.professionalName, entry.serviceName].filter(Boolean).join(" · ") ||
            "Qualquer profissional/serviço"}
        </p>
        {entry.notes ? (
          <p className="truncate text-xs text-muted-foreground italic">
            {entry.notes}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="gap-1 text-xs">
          <ClockIcon />
          {formatDistanceToNow(entry.createdAt, {
            locale: ptBR,
            addSuffix: true,
          })}
        </Badge>
        {canManage ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onPromote(entry)}
            >
              Promover
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Cancelar item de ${entry.patientName}`}
              onClick={() => onCancel(entry)}
            >
              <XIcon />
            </Button>
          </>
        ) : null}
      </div>
    </li>
  );
}

/** Waiting queue for free slots (ADR-011): no slot is reserved until promote. */
export function WaitlistPanel() {
  const { can, isLoading: authLoading } = useAuth();
  const canManage = can(Permission.APPOINTMENTS_CREATE);

  const waitlistQuery = useWaitlistQuery({ status: "waiting" });
  const entries = waitlistQuery.data ?? [];

  const [enqueueOpen, setEnqueueOpen] = useState(false);
  const [entryToPromote, setEntryToPromote] = useState<WaitlistEntry | null>(
    null,
  );
  const [entryToCancel, setEntryToCancel] = useState<WaitlistEntry | null>(
    null,
  );

  const cancelWaitlist = useCancelWaitlistMutation({
    onSuccess: () => {
      toast.success("Item removido da lista de espera");
      setEntryToCancel(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const isLoading = authLoading || waitlistQuery.isLoading;

  return (
    <>
      <HomeSection
        title="Lista de espera"
        description="Pacientes aguardando um horário livre — nenhum agendamento é criado até a promoção."
        action={
          canManage ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEnqueueOpen(true)}
            >
              <PlusIcon />
              Adicionar
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : entries.length === 0 ? (
          <div className="rounded-xl bg-muted/40 px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
            Nenhum paciente na lista de espera.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
            {entries.map((entry) => (
              <WaitlistRow
                key={entry.id}
                entry={entry}
                canManage={canManage}
                onPromote={setEntryToPromote}
                onCancel={setEntryToCancel}
              />
            ))}
          </ul>
        )}
      </HomeSection>

      <WaitlistEnqueueDialog open={enqueueOpen} onOpenChange={setEnqueueOpen} />

      {entryToPromote ? (
        <AppointmentFormDialog
          open={Boolean(entryToPromote)}
          onOpenChange={(open) => {
            if (!open) setEntryToPromote(null);
          }}
          waitlistId={entryToPromote.id}
          lockedPatient={{
            id: entryToPromote.patientId,
            name: entryToPromote.patientName,
          }}
          defaultProfessionalId={entryToPromote.professionalId}
        />
      ) : null}

      <AlertDialog
        open={Boolean(entryToCancel)}
        onOpenChange={(open) => {
          if (!open) setEntryToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da lista de espera</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{entryToCancel?.patientName}</strong> da lista de
              espera?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelWaitlist.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelWaitlist.isPending}
              onClick={() => {
                if (entryToCancel) {
                  cancelWaitlist.mutate({ id: entryToCancel.id });
                }
              }}
            >
              {cancelWaitlist.isPending ? <Spinner /> : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
