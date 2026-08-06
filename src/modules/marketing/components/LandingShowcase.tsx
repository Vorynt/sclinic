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
          <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
            {showcase.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {showcase.title}
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-24 lg:gap-36">
          <ShowcaseBlock
            title={agenda.title}
            description={agenda.description}
            reverse={false}
            index={1}>
            <MockAppChrome activeNav="Agenda" compact>
              <MockWeekAgenda />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={patients.title}
            description={patients.description}
            reverse
            index={2}>
            <MockAppChrome activeNav="Pacientes" compact>
              <MockPatientsTable />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={attendance.title}
            description={attendance.description}
            reverse={false}
            index={3}>
            <MockAppChrome activeNav="Agenda" compact>
              <MockAttendance />
            </MockAppChrome>
          </ShowcaseBlock>

          <ShowcaseBlock
            title={billing.title}
            description={billing.description}
            reverse
            index={4}>
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
  index,
  children,
}: {
  title: string
  description: string
  reverse: boolean
  index: number
  children: ReactNode
}) {
  return (
    <div
      className={
        reverse
          ? "grid items-center gap-10 lg:grid-cols-[1.2fr_minmax(0,0.8fr)] lg:gap-16"
          : "grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_1.2fr] lg:gap-16"
      }>
      <div className={reverse ? "lg:order-2" : undefined}>
        <span className="font-heading text-xs font-medium tracking-[0.16em] text-primary/70 uppercase tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-[1.85rem] sm:leading-tight">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className={reverse ? "relative lg:order-1" : "relative"}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_68%)] blur-xl"
        />
        <div className="relative transition-transform duration-500 ease-out hover:-translate-y-1">
          {children}
        </div>
      </div>
    </div>
  )
}
