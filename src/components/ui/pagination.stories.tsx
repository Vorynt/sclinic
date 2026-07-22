import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          "Navegação paginada para listas longas, com links numerados e controles anterior/próximo.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Paginação simples com páginas de 1 a 5, destacando a página atual.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" text="Anterior" />
        </PaginationItem>
        {[1, 2, 3, 4, 5].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href="#" isActive={page === 3}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" text="Próximo" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const WithEllipsis: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Paginação com reticências para conjuntos grandes de páginas, mantendo a página atual visível.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" text="Anterior" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">4</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" text="Próximo" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
