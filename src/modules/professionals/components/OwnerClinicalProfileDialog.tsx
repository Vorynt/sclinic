"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Spinner } from "@/components/ui/spinner";
import { OwnerClinicalProfileFields } from "@/modules/professionals/components/OwnerClinicalProfileFields";
import { useCreateOwnerClinicalProfileMutation } from "@/modules/professionals/hooks/use-professional-mutations";
import { createOwnerClinicalProfileSchema } from "@/modules/professionals/schemas/owner-clinical-profile.schema";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type FormValues = z.input<typeof createOwnerClinicalProfileSchema>;
type FormOutput = z.output<typeof createOwnerClinicalProfileSchema>;

type OwnerClinicalProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnerClinicalProfileDialog({
  open,
  onOpenChange,
}: OwnerClinicalProfileDialogProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(createOwnerClinicalProfileSchema),
    defaultValues: {
      clinicalPracticeType: "doctor",
      fullName: "",
      treatmentPronoun: "dr",
      councilType: "CRM",
      councilNumber: "",
      councilState: "",
      specialty: "",
    },
  });

  const createProfile = useCreateOwnerClinicalProfileMutation({
    onSuccess: () => {
      toast.success(
        "Perfil clínico criado. Você já pode ser selecionado ao marcar consultas.",
      );
      reset();
      setFormError(null);
      onOpenChange(false);
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

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    createProfile.mutate(data);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setFormError(null);
          reset();
        }
      }}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Criar perfil clínico</DialogTitle>
          <DialogDescription>
            Os dados abaixo são para a <strong>agenda e o prontuário</strong>.
            Seu papel de <strong>dono</strong> permanece igual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
          {formError ? (
            <FormErrorAlert message={formError.message} />
          ) : null}

          <OwnerClinicalProfileFields
            register={register}
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            disabled={createProfile.isPending}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={createProfile.isPending}
              onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProfile.isPending}>
              {createProfile.isPending ? (
                <>
                  <Spinner />
                  Salvando…
                </>
              ) : (
                "Criar perfil clínico"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
