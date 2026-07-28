"use client";

import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HELP_CATEGORIES } from "@/modules/help/constants/categories";
import type { HelpCategoryId } from "@/modules/help/types/help";

type HelpCategoryFilterProps = {
  active: HelpCategoryId | "all";
  counts: Partial<Record<HelpCategoryId, number>>;
  total: number;
  onChange: (categoryId: HelpCategoryId | "all") => void;
};

export function HelpCategoryFilter({
  active,
  counts,
  total,
  onChange,
}: HelpCategoryFilterProps) {
  return (
    <ToggleGroup
      aria-label="Assuntos da ajuda"
      role="tablist"
      type="single"
      className="flex flex-wrap gap-1.5 w-full max-w-full overflow-x-auto"
      value={active}
      onValueChange={onChange}>
      <ToggleGroupItem value="all" variant={"outline"}>
        Todos
        <Badge
          variant={active === "all" ? "secondary" : "ghost"}
          className="ml-1.5 py-0">
          {total}
        </Badge>
      </ToggleGroupItem>
      {HELP_CATEGORIES.map((category) => {
        const count = counts[category.id] ?? 0;
        const isActive = active === category.id;
        return (
          <ToggleGroupItem
            key={category.id}
            value={category.id}
            variant={"outline"}>
            {category.label}
            <Badge
              variant={isActive ? "secondary" : "ghost"}
              className="ml-1.5 py-0">
              {count}
            </Badge>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
