import type { ReactNode } from "react"

import { MockAppChrome } from "@/modules/marketing/components/mocks/MockAppChrome"
import { MockAttendance } from "@/modules/marketing/components/mocks/MockAttendance"
import { MockBilling } from "@/modules/marketing/components/mocks/MockBilling"
import { MockPatientsTable } from "@/modules/marketing/components/mocks/MockPatientsTable"
import { MockWeekAgenda } from "@/modules/marketing/components/mocks/MockWeekAgenda"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingShowcase() {
  const { showcase } = LANDING_COPY
  const [agenda, patients, attendance, billing] = showcase.sections

  return (
    <section
      id={showcase.id}
      className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {showcase.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {showcase.title}
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-24 lg:gap-32">
          <ShowcaseBlock
            title={agenda.title}
            description={agenda.description}
            reverse={false}>
            <MockAppChrome activeNav="Agenda" compact>
              <MockWeekAgenda />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={patients.title}
            description={patients.description}
            reverse>
            <MockAppChrome activeNav="Pacientes" compact>
              <MockPatientsTable />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={attendance.title}
            description={attendance.description}
            reverse={false}>
            <MockAppChrome activeNav="Agenda" compact>
              <MockAttendance />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={billing.title}
            description={billing.description}
            reverse>
            <MockAppChrome activeNav="Faturamento" compact>
              <MockBilling />
            </MockAppChrome>
          </ShowcaseBlock>
        </div>
      </div>
    </section>
  )
}

function ShowcaseBlock({
  title,
  description,
  reverse,
  children,
}: {
  title: string
  description: string
  reverse: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        reverse
          ? "grid items-center gap-8 lg:grid-cols-[1.15fr_minmax(0,0.85fr)] lg:gap-14"
          : "grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_1.15fr] lg:gap-14"
      }>
      <div className={reverse ? "lg:order-2" : undefined}>
        <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      <div className={reverse ? "lg:order-1" : undefined}>{children}</div>
    </div>
  )
}
