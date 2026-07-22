import {
  CalendarBlankIcon,
  ChartBarIcon,
  DotsThreeIcon,
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SignOutIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "./avatar";
import { Separator } from "./separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";
import { TooltipProvider } from "./tooltip";

const meta = {
  title: "Molecules/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Navegação lateral composável (shadcn) com provider de estado, variantes (sidebar, floating, inset), colapso (offcanvas, icon, none), menu aninhado, badges e skeleton de carregamento. Atalho ⌘B / Ctrl+B alterna o estado.",
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="-m-4 h-[min(100svh,640px)] overflow-hidden">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="#">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <HouseIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">sclinic</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Clínica demonstração
                </span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarInput placeholder="Buscar…" />
    </SidebarHeader>
  );
}

function AppSidebarFooter() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Sair">
            <SignOutIcon />
            <span>Sair</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">RV</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Raissa Vieira</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                raissa@sclinic.app
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function AppSidebarNav({
  withSubmenu = false,
  withBadge = false,
}: {
  withSubmenu?: boolean;
  withBadge?: boolean;
}) {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
        <SidebarGroupAction title="Adicionar">
          <PlusIcon />
          <span className="sr-only">Adicionar</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Início">
                <HouseIcon />
                <span>Início</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Pacientes">
                <UsersIcon />
                <span>Pacientes</span>
              </SidebarMenuButton>
              {withBadge ? <SidebarMenuBadge>12</SidebarMenuBadge> : null}
              {withBadge ? (
                <SidebarMenuAction showOnHover>
                  <DotsThreeIcon />
                  <span className="sr-only">Mais opções</span>
                </SidebarMenuAction>
              ) : null}
              {withSubmenu ? (
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#" isActive>
                      Todos
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#">
                      Recentes
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton size="sm" href="#">
                      Arquivados
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Consultas">
                <CalendarBlankIcon />
                <span>Consultas</span>
              </SidebarMenuButton>
              {withBadge ? <SidebarMenuBadge>3</SidebarMenuBadge> : null}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard">
                <ChartBarIcon />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Sistema</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Configurações">
                <GearIcon />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function DemoInset({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 text-sm text-muted-foreground">
        <p>
          Área principal da aplicação. Use o gatilho da barra ou o atalho{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
            ⌘B
          </kbd>{" "}
          /{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
            Ctrl+B
          </kbd>{" "}
          para alternar a sidebar.
        </p>
      </div>
    </SidebarInset>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Layout padrão com SidebarProvider, header com busca, grupos de navegação, footer com usuário e conteúdo principal (SidebarInset).",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Início"
        description="Sidebar padrão (variant sidebar, collapsible offcanvas)."
      />
    </SidebarProvider>
  ),
};

export const CollapsibleIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Modo collapsible="icon": a sidebar recolhe para ícones; tooltips aparecem no estado colapsado.',
      },
    },
  },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Modo ícone"
        description="Começa colapsada; expanda pelo trigger ou pela rail."
      />
    </SidebarProvider>
  ),
};

export const Floating: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Variante floating com cantos arredondados, sombra e anel, útil para layouts mais leves.",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar variant="floating" collapsible="icon">
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Floating"
        description={'variant="floating" com collapsible="icon".'}
      />
    </SidebarProvider>
  ),
};

export const Inset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Variante inset: o conteúdo principal (SidebarInset) ganha margem e cantos arredondados no desktop.",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Inset"
        description={
          'variant="inset" — o painel de conteúdo acompanha o visual embutido.'
        }
      />
    </SidebarProvider>
  ),
};

export const Right: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Sidebar ancorada à direita (side="right").',
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <DemoInset
        title="Sidebar à direita"
        description="O painel de navegação fica no lado direito da tela."
      />
      <Sidebar side="right" collapsible="icon">
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  ),
};

export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Itens com submenu aninhado (SidebarMenuSub / SidebarMenuSubButton).",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <AppSidebarHeader />
        <AppSidebarNav withSubmenu />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Submenu"
        description="Pacientes expande subitens: Todos, Recentes e Arquivados."
      />
    </SidebarProvider>
  ),
};

export const WithBadgeAndAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Menu com badge de contagem e ação contextual (SidebarMenuBadge / SidebarMenuAction).",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <AppSidebarHeader />
        <AppSidebarNav withBadge />
        <AppSidebarFooter />
        <SidebarRail />
      </Sidebar>
      <DemoInset
        title="Badge e ação"
        description="Contadores e menu de opções no hover do item."
      />
    </SidebarProvider>
  ),
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado de carregamento com SidebarMenuSkeleton (com e sem ícone).",
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-sidebar-foreground/50" />
            <SidebarInput className="pl-8" placeholder="Buscar…" disabled />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Carregando</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <DemoInset
        title="Carregando"
        description="Placeholders enquanto a navegação é resolvida."
      />
    </SidebarProvider>
  ),
};

export const NonCollapsible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'collapsible="none": sidebar fixa, sem animação de colapso nem rail.',
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none" className="border-r">
        <AppSidebarHeader />
        <AppSidebarNav />
        <AppSidebarFooter />
      </Sidebar>
      <DemoInset
        title="Não colapsável"
        description="Largura fixa; o trigger ainda existe, mas o colapso desktop não se aplica."
      />
    </SidebarProvider>
  ),
};
