"use client";

import { useState } from "react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useOwnerClinicalProfileStatusQuery } from "@/modules/professionals/hooks/use-professionals";
import { USERS_CONSTANTS } from "@/modules/users/constants/users";
import { useAuth } from "@/providers/AuthProvider";
import { InfoIcon } from "@phosphor-icons/react";
import { OwnerClinicalProfileDialog } from "./OwnerClinicalProfileDialog";

export function OwnerClinicalProfileCallout() {
  const { auth } = useAuth();
  const isOwner = auth?.membership?.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY;
  const [dialogOpen, setDialogOpen] = useState(false);

  const statusQuery = useOwnerClinicalProfileStatusQuery({
    enabled: isOwner,
  });

  if (!isOwner) return null;
  if (statusQuery.isLoading || statusQuery.isError) return null;
  if (statusQuery.data?.hasProfile) return null;

  return (
    <>
      <Alert className="bg-sidebar">
        <InfoIcon />
        <AlertTitle>Você ainda não aparece na agenda</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Você é <strong>dono desta clínica</strong>, mas não tem{" "}
            <strong>perfil clínico</strong>. Sem isso, agendamentos não podem
            ser marcados no seu nome.
          </p>
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            className="shrink-0 self-start"
            onClick={() => setDialogOpen(true)}>
            Criar meu perfil clínico
          </Button>
        </AlertAction>
      </Alert>
      <OwnerClinicalProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
