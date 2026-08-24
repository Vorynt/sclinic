"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease";

type BenefitTimelineProps = {
  children: ReactNode;
};

export function BenefitTimeline({ children }: BenefitTimelineProps) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.35"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });

  return (
    <ol ref={ref} className="relative flex flex-col pl-1">
      <span
        aria-hidden="true"
        className="absolute top-3 bottom-3 left-1 w-px bg-border/80"
      />
      <motion.span
        aria-hidden="true"
        className="absolute top-3 left-1 w-px origin-top bg-primary"
        style={{ scaleY, bottom: "0.75rem" }}
      />
      {children}
    </ol>
  );
}

type BenefitRowProps = {
  index: number;
  icon: ReactNode;
  title: string;
  description: string;
};

export function BenefitRow({
  index,
  icon,
  title,
  description,
}: BenefitRowProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: LANDING_EASE }}
      className="relative">
      <div className="group grid gap-4 rounded-2xl px-2 py-7 transition-colors duration-300 hover:bg-primary/[0.035] sm:grid-cols-[auto_1fr] sm:gap-6 sm:px-4">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
          <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-[0_10px_24px_-14px_color-mix(in_oklch,var(--primary)_50%,transparent)]">
            {icon}
          </span>
          <span className="font-heading text-xs font-medium tracking-wide text-primary/70 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </motion.li>
  );
}
