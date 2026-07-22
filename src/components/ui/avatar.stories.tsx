import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";

const sizes = ["default", "sm", "lg"] as const;

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  argTypes: {
    size: {
      control: "select",
      options: [...sizes],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Avatar para exibir foto de perfil, iniciais de fallback, badge de status e agrupamento sobreposto.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Avatar com imagem carregada e fallback de iniciais quando a imagem não estiver disponível.",
      },
    },
  },
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="" />
      <AvatarFallback>RV</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatar exibindo apenas as iniciais quando não há imagem válida.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>{size.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tamanhos disponíveis: sm, default e lg.",
      },
    },
  },
};

export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
      <AvatarFallback>CN</AvatarFallback>
      <AvatarBadge aria-label="Online" />
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatar com badge de status posicionado no canto inferior direito.",
      },
    },
  },
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Usuário 1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" alt="Usuário 2" />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Grupo de avatares sobrepostos com contador para membros adicionais.",
      },
    },
  },
};
