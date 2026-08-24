import {
  ClockIcon,
  FolderSimpleIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import {
  BenefitRow,
  BenefitTimeline,
} from "@/modules/marketing/components/motion/BenefitTimeline"
import { Reveal } from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const BENEFIT_ICONS: Record<string, Icon> = {
  time: ClockIcon,
  organization: FolderSimpleIcon,
  security: ShieldCheckIcon,
  team: UsersThreeIcon,
}

export function LandingBenefits() {
  const { benefits } = LANDING_COPY

  return (
    <section id={benefits.id} className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
          <div className="max-w-md lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
                {benefits.eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl sm:leading-tight">
                {benefits.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {benefits.supporting}
              </p>
            </Reveal>
          </div>

          <BenefitTimeline>
            {benefits.items.map((item, index) => {
              const Icon = BENEFIT_ICONS[item.id] ?? ClockIcon
              return (
                <BenefitRow
                  key={item.id}
                  index={index}
                  title={item.title}
                  description={item.description}
                  icon={
                    <Icon className="size-5" weight="duotone" aria-hidden="true" />
                  }
                />
              )
            })}
          </BenefitTimeline>
        </div>
      </div>
    </section>
  )
}
