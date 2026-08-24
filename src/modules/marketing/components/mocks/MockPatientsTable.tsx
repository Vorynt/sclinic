import {
  CalendarBlankIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { MOCK_PATIENTS } from "@/modules/marketing/constants/mock-data"

type MockPatientsTableProps = {
  className?: string
}

export function MockPatientsTable({ className }: MockPatientsTableProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-heading text-base font-semibold tracking-tight text-foreground">
            Pacientes
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Cadastro e busca de pacientes da clínica.
          </p>
        </div>
        <Button type="button" size="sm" tabIndex={-1} className="shrink-0">
          <PlusIcon data-icon="inline-start" />
          Novo paciente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          tabIndex={-1}
          value="carla"
          className="h-8 pl-8 text-sm"
          aria-label="Buscar por nome ou CPF"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">CPF</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PATIENTS.slice(0, 5).map((patient) => (
              <TableRow key={patient.cpf}>
                <TableCell className="font-medium text-foreground">
                  {patient.name}
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {patient.cpf}
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">
                  {patient.phone}
                </TableCell>
                <TableCell className="text-right">
                  <ButtonGroup className="justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tabIndex={-1}
                      className="size-7"
                    >
                      <CalendarBlankIcon className="size-3.5" />
                      <span className="sr-only">Agendar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tabIndex={-1}
                      className="size-7"
                    >
                      <PencilSimpleIcon className="size-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
