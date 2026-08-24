import type { ReactNode } from "react"

import { MockAppChrome } from "@/modules/marketing/components/mocks/MockAppChrome"
import { MockAttendance } from "@/modules/marketing/components/mocks/MockAttendance"
import { MockBilling } from "@/modules/marketing/components/mocks/MockBilling"
import { MockPatientsTable } from "@/modules/marketing/components/mocks/MockPatientsTable"
import { MockWeekAgenda } from "@/modules/marketing/components/mocks/MockWeekAgenda"
import { LandingStickyTour } from "@/modules/marketing/components/motion/LandingStickyTour"
import { Reveal } from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

type ShowcaseSectionId = (typeof LANDING_COPY.showcase.sections)[number]["id"]

function ShowcaseMock({ sectionId }: { sectionId: ShowcaseSectionId }) {
  if (sectionId === "agenda-showcase") {
    return (
      <MockAppChrome activeNav="Agendamentos" compact>
        <MockWeekAgenda />
      </MockAppChrome>
    )
  }

  if (sectionId === "patients-showcase") {
    return (
      <MockAppChrome activeNav="Pacientes" compact>
        <MockPatientsTable />
      </MockAppChrome>
    )
  }

  if (sectionId === "attendance-showcase") {
    return <MockAttendance />
  }

  return (
    <MockAppChrome activeNav="Faturamento" compact>
      <MockBilling />
    </MockAppChrome>
  )
}

export function LandingShowcase() {
  const { showcase } = LANDING_COPY

  return (
    <section
      id={showcase.id}
      className="scroll-mt-20 border-y border-border/50 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_3.5%,var(--background)),var(--background)_42%)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
            {showcase.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {showcase.title}
          </h2>
        </Reveal>

        <LandingStickyTour
          steps={showcase.sections.map((section) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            mock: <ShowcaseMock sectionId={section.id} />,
          }))}
        />

        <div className="mt-12 flex flex-col gap-16 lg:hidden">
          {showcase.sections.map((section, index) => (
            <Reveal key={section.id} delay={index * 0.04}>
              <MobileShowcaseBlock
                title={section.title}
                description={section.description}
                index={index + 1}
              >
                <ShowcaseMock sectionId={section.id} />
              </MobileShowcaseBlock>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function MobileShowcaseBlock({
  title,
  description,
  index,
  children,
}: {
  title: string
  description: string
  index: number
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-heading text-xs font-medium tracking-[0.16em] text-primary/70 uppercase tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_68%)] blur-xl"
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}
