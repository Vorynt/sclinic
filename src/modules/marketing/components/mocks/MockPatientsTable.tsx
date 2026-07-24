import {
  CalendarBlankIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MOCK_PATIENTS } from "@/modules/marketing/constants/mock-data";

type MockPatientsTableProps = {
  className?: string;
};

export function MockPatientsTable({ className }: MockPatientsTableProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            tabIndex={-1}
            value="carla"
            className="h-9 pl-8 text-sm"
            aria-label="Buscar pacientes"
          />
        </div>
        <Button type="button" size="sm" tabIndex={-1} className="shrink-0">
          Novo paciente
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">CPF</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden lg:table-cell">E-mail</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PATIENTS.map((patient) => (
              <TableRow key={patient.cpf}>
                <TableCell className="font-medium">
                  <span className="text-foreground underline-offset-4">
                    {patient.name}
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {patient.cpf}
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">
                  {patient.phone}
                </TableCell>
                <TableCell className="hidden max-w-40 truncate lg:table-cell">
                  {patient.email}
                </TableCell>
                <TableCell className="text-right">
                  <ButtonGroup className="justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tabIndex={-1}
                      className="size-7">
                      <CalendarBlankIcon className="size-3.5" />
                      <span className="sr-only">Agendar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tabIndex={-1}
                      className="size-7">
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
  );
}
