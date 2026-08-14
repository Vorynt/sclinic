"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { enableTwoFactorSchema } from "@/modules/authentication/schemas/auth.schema";

type PasswordValues = z.input<typeof enableTwoFactorSchema>;
type PasswordOutput = z.output<typeof enableTwoFactorSchema>;

type ConfirmPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  isPending?: boolean;
  error?: { message: string } | null;
  onConfirm: (password: string) => void;
};

export function ConfirmPasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  isPending = false,
  error,
  onConfirm,
}: ConfirmPasswordDialogProps) {
  const formId = useId();
  const passwordId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues, unknown, PasswordOutput>({
    resolver: zodResolver(enableTwoFactorSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (open) return;
    reset({ password: "" });
  }, [open, reset]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        onOpenChange(next);
      }}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit((data) => onConfirm(data.password))}
          className="flex flex-col gap-4"
          noValidate>
          {error ? <FormErrorAlert message={error.message} /> : null}

          <FieldGroup>
            <Field data-invalid={Boolean(errors.password) || undefined}>
              <FieldLabel htmlFor={passwordId}>Digite sua senha</FieldLabel>
              <Input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                autoFocus
                disabled={isPending}
                aria-invalid={Boolean(errors.password) || undefined}
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant={confirmVariant} disabled={isPending}>
              {isPending ? <Spinner /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
