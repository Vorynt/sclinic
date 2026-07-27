"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDownIcon, LockIcon } from "@phosphor-icons/react";
import { useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getTemplateDefaultValues,
  type ClinicalNoteTemplate,
  type ClinicalNoteTemplateField,
} from "@/modules/medical-records/constants/clinical-note-templates";
import { buildTemplateValuesSchema } from "@/modules/medical-records/schemas/clinical-note.schema";

type ClinicalNoteFormRendererProps = {
  template: ClinicalNoteTemplate;
  initialValues?: Record<string, unknown> | null;
  editable: boolean;
  isPending: boolean;
  onSubmit: (formValues: Record<string, unknown>) => void;
  onChangeTemplate?: () => void;
};

type TemplateFieldGroup = {
  section: ClinicalNoteTemplateField | null;
  fields: ClinicalNoteTemplateField[];
};

function groupTemplateFields(
  fields: ClinicalNoteTemplateField[],
): TemplateFieldGroup[] {
  const groups: TemplateFieldGroup[] = [];
  let current: TemplateFieldGroup = { section: null, fields: [] };

  for (const field of fields) {
    if (field.type === "section") {
      if (current.section || current.fields.length > 0) {
        groups.push(current);
      }
      current = { section: field, fields: [] };
      continue;
    }
    current.fields.push(field);
  }

  if (current.section || current.fields.length > 0) {
    groups.push(current);
  }

  return groups;
}

export function ClinicalNoteFormRenderer({
  template,
  initialValues,
  editable,
  isPending,
  onSubmit,
  onChangeTemplate,
}: ClinicalNoteFormRendererProps) {
  const schema = buildTemplateValuesSchema(template);
  const defaults = {
    ...getTemplateDefaultValues(template),
    ...(initialValues ?? {}),
  };
  const groups = useMemo(
    () => groupTemplateFields(template.fields),
    [template.fields],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    // Dynamic schema per template — cast keeps RHF happy with Record values.
    resolver: zodResolver(schema) as never,
    defaultValues: defaults,
  });

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            {template.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {template.description}
          </p>
        </div>
        {editable && onChangeTemplate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeTemplate}>
            Trocar template
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((group, index) => {
          const fieldIds = group.fields.map((field) => field.id);
          const hasError = fieldIds.some((id) => Boolean(errors[id]));

          if (!group.section) {
            return (
              <FieldGroup
                key={`ungrouped-${index}`}
                className="flex flex-col gap-4">
                {group.fields.map((field) => (
                  <TemplateFieldControl
                    key={field.id}
                    field={field}
                    editable={editable}
                    register={register}
                    control={control}
                    error={
                      typeof errors[field.id]?.message === "string"
                        ? (errors[field.id]?.message as string)
                        : undefined
                    }
                  />
                ))}
              </FieldGroup>
            );
          }

          return (
            <TemplateSectionCollapsible
              key={group.section.id}
              label={group.section.label}
              description={group.section.description}
              defaultOpen={index === 0 || hasError}
              forceOpen={hasError}>
              <FieldGroup className="flex flex-col gap-4 px-3 pb-3 pt-1">
                {group.fields.map((field) => (
                  <TemplateFieldControl
                    key={field.id}
                    field={field}
                    editable={editable}
                    register={register}
                    control={control}
                    error={
                      typeof errors[field.id]?.message === "string"
                        ? (errors[field.id]?.message as string)
                        : undefined
                    }
                  />
                ))}
              </FieldGroup>
            </TemplateSectionCollapsible>
          );
        })}
      </div>

      {editable ? (
        <Button type="submit" disabled={isPending} className="ml-auto">
          {isPending ? <Spinner /> : null}
          Salvar anotação
        </Button>
      ) : (
        <p className="flex items-center gap-1.5 self-end text-xs text-muted-foreground">
          <LockIcon className="size-3.5" />
          Somente leitura
        </p>
      )}
    </form>
  );
}

function TemplateSectionCollapsible({
  label,
  description,
  defaultOpen,
  forceOpen,
  children,
}: {
  label: string;
  description?: string;
  defaultOpen: boolean;
  forceOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(next) => {
        if (forceOpen && !next) return;
        setOpen(next);
      }}
      className="rounded-md border border-border">
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-start gap-2 px-3 py-3 text-left transition-colors hover:bg-muted/50">
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <p className="font-heading  font-semibold tracking-tight text-foreground">
            {label}
          </p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <CaretDownIcon
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
        <span className="sr-only">
          {isOpen ? "Recolher seção" : "Expandir seção"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

function TemplateFieldControl({
  field,
  editable,
  register,
  control,
  error,
}: {
  field: ClinicalNoteTemplateField;
  editable: boolean;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  error?: string;
}) {
  if (field.type === "section") {
    return null;
  }

  if (field.type === "switch") {
    return (
      <Field
        data-invalid={Boolean(error)}
        className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
        <Controller
          control={control}
          name={field.id}
          render={({ field: rhf }) => (
            <Switch
              id={field.id}
              checked={Boolean(rhf.value)}
              disabled={!editable}
              onCheckedChange={rhf.onChange}
            />
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
        <Controller
          control={control}
          name={field.id}
          render={({ field: rhf }) => (
            <Select
              value={typeof rhf.value === "string" ? rhf.value : ""}
              disabled={!editable}
              onValueChange={rhf.onChange}>
              <SelectTrigger id={field.id} aria-invalid={Boolean(error)}>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.type === "checklist") {
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel>{field.label}</FieldLabel>
        {field.description ? (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        ) : null}
        <Controller
          control={control}
          name={field.id}
          render={({ field: rhf }) => {
            const selected = Array.isArray(rhf.value)
              ? (rhf.value as string[])
              : [];
            return (
              <div className="flex flex-col gap-2">
                {(field.options ?? []).map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={checked}
                        disabled={!editable}
                        onCheckedChange={(next) => {
                          const on = next === true;
                          rhf.onChange(
                            on
                              ? [...selected, option.value]
                              : selected.filter(
                                  (item) => item !== option.value,
                                ),
                          );
                        }}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            );
          }}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
        <Textarea
          id={field.id}
          rows={3}
          disabled={!editable}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          {...register(field.id)}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
      <Input
        id={field.id}
        disabled={!editable}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        {...register(field.id)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
