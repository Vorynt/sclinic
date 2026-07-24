"use client";

import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { useDeleteClinicMutation } from "@/modules/clinics/hooks/use-clinic-settings";
import type { Clinic } from "@/modules/clinics/types/clinic";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type DeleteClinicDangerZoneProps = {
  clinic: Clinic;
};

export function DeleteClinicDangerZone({
  clinic,
}: DeleteClinicDangerZoneProps) {
  const router = useRouter();
  const { data: session } = useAuthSession();
  const isOwner = session?.membership?.roleKey === "owner";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const deleteClinic = useDeleteClinicMutation({
    onSuccess: (result) => {
      toast.success("Clínica excluída");
      setDialogOpen(false);
      router.replace(result.redirectTo);
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({ message: error.message, code: error.code });
        return;
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      });
    },
  });

  const nameMatches = confirmationName.trim() === clinic.name;

  if (!isOwner) {
    return (
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground">Excluir clínica</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Apenas o proprietário pode excluir a clínica e todos os dados
          associados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <h3 className="text-sm font-medium text-destructive">
          Excluir clínica
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove permanentemente o acesso a esta clínica, pacientes,
          agendamentos, equipe e demais dados. Esta ação não pode ser desfeita.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-4"
          onClick={() => {
            setFormError(null);
            setConfirmationName("");
            setDialogOpen(true);
          }}>
          Excluir clínica
        </Button>
      </div>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (deleteClinic.isPending) return;
          setDialogOpen(open);
          if (!open) {
            setConfirmationName("");
            setFormError(null);
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{clinic.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados da clínica ficarão inacessíveis. Para confirmar,
              digite o nome da clínica exatamente como aparece abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-clinic-confirmation">
              Nome da clínica:{" "}
              <span className="font-medium">{clinic.name}</span>
            </Label>
            <Input
              id="delete-clinic-confirmation"
              value={confirmationName}
              autoComplete="off"
              disabled={deleteClinic.isPending}
              placeholder={clinic.name}
              onChange={(event) => setConfirmationName(event.target.value)}
            />
          </div>

          {formError ? (
            <FormErrorAlert message={formError.message} code={formError.code} />
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClinic.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!nameMatches || deleteClinic.isPending}
              onClick={(event) => {
                event.preventDefault();
                setFormError(null);
                deleteClinic.mutate({
                  confirmationName: confirmationName.trim(),
                });
              }}>
              {deleteClinic.isPending ? (
                <>
                  <Spinner />
                  Excluindo…
                </>
              ) : (
                "Excluir definitivamente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
