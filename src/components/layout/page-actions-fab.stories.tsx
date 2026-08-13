import { CalendarPlusIcon, ProhibitInsetIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";

import { PageActionsFab } from "@/components/layout/PageActionsFab";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageActionsStore } from "@/stores/page-actions.store";
import type { PageAction } from "@/types/page-action";

function SeedPageActions({ actions }: { actions: PageAction[] }) {
  useEffect(() => {
    usePageActionsStore.getState().setActions(actions);
    return () => {
      usePageActionsStore.getState().clearActions();
    };
  }, [actions]);

  return <PageActionsFab />;
}

const meta = {
  title: "Molecules/PageActionsFab",
  component: PageActionsFab,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "FAB stack mobile do AppShell: ação primária (maior, embaixo) e secundárias (menores, acima). Alimentado por `usePageActionsStore`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="relative h-105 bg-muted/30">
          <div className="absolute inset-x-0 bottom-0 h-14 border-t bg-background" />
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof PageActionsFab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryOnly: Story = {
  render: () => (
    <SeedPageActions
      actions={[
        {
          id: "new-appointment",
          label: "Novo agendamento",
          icon: CalendarPlusIcon,
          onClick: () => undefined,
        },
      ]}
    />
  ),
};

export const PrimaryAndSecondary: Story = {
  render: () => (
    <SeedPageActions
      actions={[
        {
          id: "block",
          label: "Bloquear horário",
          icon: ProhibitInsetIcon,
          priority: "secondary",
          onClick: () => undefined,
        },
        {
          id: "new-appointment",
          label: "Novo agendamento",
          icon: CalendarPlusIcon,
          priority: "primary",
          onClick: () => undefined,
        },
      ]}
    />
  ),
};
