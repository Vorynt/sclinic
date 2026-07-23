"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

const meta = {
  title: "Molecules/Command",
  component: Command,
  parameters: {
    docs: {
      description: {
        component:
          "Lista pesquisável baseada em cmdk. Use com Popover para montar um Combobox.",
      },
    },
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Command isolado com busca e lista de itens.",
      },
    },
  },
  render: () => (
    <Command className="max-w-sm rounded-xl border shadow-md">
      <CommandInput placeholder="Buscar framework..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Frameworks">
          {frameworks.map((framework) => (
            <CommandItem key={framework.value} value={framework.value}>
              {framework.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

function ComboboxDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const selected = frameworks.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between">
          {selected?.label ?? "Selecione um framework"}
          <CaretUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar framework..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  data-checked={value === framework.value || undefined}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}>
                  {framework.label}
                  <CheckIcon
                    className={
                      value === framework.value ? "opacity-100" : "opacity-0"
                    }
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const Combobox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Padrão Combobox: Popover + Command com busca e seleção de um item.",
      },
    },
  },
  render: () => <ComboboxDemo />,
};
