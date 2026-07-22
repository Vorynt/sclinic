import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";

const meta = {
  title: "Molecules/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Molécula de formulário que agrupa label, controle, descrição e mensagens de erro com orientação vertical ou horizontal.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Composição básica com FieldLabel, Input e FieldDescription para campos de texto.",
      },
    },
  },
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-default-name">Nome completo</FieldLabel>
      <Input id="field-default-name" placeholder="Digite o nome do paciente" />
      <FieldDescription>
        Nome como consta no documento de identificação.
      </FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado inválido com data-invalid no Field, aria-invalid no controle e FieldError para feedback.",
      },
    },
  },
  render: () => (
    <Field className="max-w-sm" data-invalid={true}>
      <FieldLabel htmlFor="field-invalid-email">E-mail</FieldLabel>
      <Input
        id="field-invalid-email"
        type="email"
        defaultValue="email-invalido"
        aria-invalid
      />
      <FieldError>Informe um endereço de e-mail válido.</FieldError>
    </Field>
  ),
};

export const FieldSetGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "FieldSet com FieldLegend agrupando múltiplos Fields com Input, Textarea e Select.",
      },
    },
  },
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Dados do paciente</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fieldset-name">Nome</FieldLabel>
          <Input id="fieldset-name" placeholder="Nome completo" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fieldset-notes">Observações</FieldLabel>
          <Textarea
            id="fieldset-notes"
            placeholder="Histórico ou anotações clínicas..."
          />
          <FieldDescription>
            Informações relevantes para o atendimento.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="fieldset-specialty">Especialidade</FieldLabel>
          <Select>
            <SelectTrigger id="fieldset-specialty" className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiologia</SelectItem>
              <SelectItem value="dermatology">Dermatologia</SelectItem>
              <SelectItem value="pediatrics">Pediatria</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Layout horizontal com label e conteúdo lado a lado via orientation=\"horizontal\".",
      },
    },
  },
  render: () => (
    <Field orientation="horizontal" className="max-w-md">
      <FieldLabel htmlFor="field-horizontal-phone">Telefone</FieldLabel>
      <FieldContent>
        <Input id="field-horizontal-phone" type="tel" placeholder="(11) 99999-9999" />
        <FieldDescription>Inclua DDD para contato.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const CheckboxField: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Field com Checkbox para opções binárias, label e descrição associados.",
      },
    },
  },
  render: () => (
    <Field orientation="horizontal" className="max-w-md">
      <Checkbox id="field-checkbox-terms" />
      <FieldContent>
        <FieldLabel htmlFor="field-checkbox-terms">
          Aceito os termos de uso
        </FieldLabel>
        <FieldDescription>
          Leia a{" "}
          <a href="#" onClick={(event) => event.preventDefault()}>
            política de privacidade
          </a>{" "}
          antes de continuar.
        </FieldDescription>
      </FieldContent>
    </Field>
  ),
};
