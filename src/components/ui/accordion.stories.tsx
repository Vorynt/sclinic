import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const faqItems = [
  {
    value: "agendamento",
    question: "Como agendar uma consulta?",
    answer:
      "Acesse a agenda da clínica, escolha o profissional, a data e o horário disponível. O paciente recebe confirmação por e-mail ou SMS, conforme configurado.",
  },
  {
    value: "pagamento",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito, débito, PIX e convênios cadastrados. O recebimento pode ser registrado no momento do atendimento ou antecipadamente.",
  },
  {
    value: "cancelamento",
    question: "Posso cancelar ou remarcar uma consulta?",
    answer:
      "Sim. Cancelamentos com até 24 horas de antecedência não geram cobrança. Para remarcar, selecione a consulta na agenda e escolha um novo horário disponível.",
  },
] as const;

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Lista expansível de seções empilhadas, ideal para FAQs e conteúdo progressivo.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    type: "single",
    defaultValue: "agendamento",
    className: "w-120",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modo single com collapsible — apenas uma seção aberta por vez e todas podem ser fechadas.",
      },
    },
  },
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="agendamento"
      className="w-120">
      {faqItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["agendamento", "pagamento"],
    className: "w-120",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modo multiple — várias seções podem permanecer abertas simultaneamente.",
      },
    },
  },
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={["agendamento", "pagamento"]}
      className="w-120">
      {faqItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
