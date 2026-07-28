"use client";

import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HELP_CATEGORIES } from "@/modules/help/constants/categories";
import type { HelpFaqItem } from "@/modules/help/types/help";

type HelpFaqListProps = {
  items: HelpFaqItem[];
  openIds: string[];
  onOpenChange: (ids: string[]) => void;
};

function categoryLabel(categoryId: HelpFaqItem["categoryId"]): string {
  return (
    HELP_CATEGORIES.find((category) => category.id === categoryId)?.label ??
    categoryId
  );
}

export function HelpFaqList({
  items,
  openIds,
  onOpenChange,
}: HelpFaqListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          Nenhuma pergunta encontrada
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente outra palavra ou escolha Todos nos assuntos.
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      value={openIds}
      onValueChange={onOpenChange}
      className="rounded-xl border border-border bg-background px-4">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="items-start py-4 text-left hover:no-underline">
            <span className="flex flex-col gap-1 pr-4">
              <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
                {categoryLabel(item.categoryId)}
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                {item.question}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {item.steps && item.steps.length > 0 ? (
                <ol className="list-decimal space-y-1.5 pl-4 text-foreground">
                  {item.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}

              {item.relatedRoutes && item.relatedRoutes.length > 0 ? (
                <span className="flex flex-wrap gap-2 pt-1">
                  {item.relatedRoutes.map((route) => (
                    <Button
                      key={route.href + route.label}
                      variant="outline"
                      size="sm"
                      asChild>
                      <Link href={route.href}>{route.label}</Link>
                    </Button>
                  ))}
                </span>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
