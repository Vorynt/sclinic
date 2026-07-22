import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "Molecules/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Menu dropdown contextual com suporte a itens, checkboxes, radio, submenus, atalhos de teclado e ações destrutivas.",
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Menu básico com label, itens, separador e atalhos de teclado.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Perfil
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Configurações
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Sair
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckbox: Story = {
  parameters: {
    docs: {
      description: {
        story: "Itens com checkbox para alternar opções de forma independente.",
      },
    },
  },
  render: function WithCheckboxStory() {
    const [showStatus, setShowStatus] = React.useState(true);
    const [showPanel, setShowPanel] = React.useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Preferências</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Exibir</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={showStatus}
            onCheckedChange={setShowStatus}
          >
            Barra de status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Painel lateral
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story: "Submenu aninhado para agrupar ações relacionadas.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ações</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Novo arquivo</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Convidar usuário</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>E-mail</DropdownMenuItem>
            <DropdownMenuItem>Mensagem</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Configurações</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DestructiveItem: Story = {
  parameters: {
    docs: {
      description: {
        story: "Item destrutivo com variant destructive para ações irreversíveis.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Opções</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Duplicar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
