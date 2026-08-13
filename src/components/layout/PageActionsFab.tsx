"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePageActionsStore } from "@/stores/page-actions.store";
import { resolvePageActions } from "@/utils/resolve-page-actions";

type PageActionsFabProps = {
  className?: string;
};

/**
 * Mobile floating action stack for the current page's PageHeader actions.
 * Secondary (smaller) above; primary (larger) below. Hidden from md+.
 */
export function PageActionsFab({ className }: PageActionsFabProps) {
  const actions = usePageActionsStore((state) => state.actions);
  const { primary, secondary } = resolvePageActions(actions);

  if (!primary) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-30 flex flex-col-reverse items-center gap-3 md:hidden",
        "right-4 bottom-[calc(3.5rem+1rem+env(safe-area-inset-bottom))]",
        className,
      )}
      role="group"
      aria-label="Ações rápidas da página">
      <FabButton
        label={primary.label}
        icon={primary.icon}
        onClick={primary.onClick}
        size="primary"
      />
      {secondary.map((action) => (
        <FabButton
          key={action.id}
          label={action.label}
          icon={action.icon}
          onClick={action.onClick}
          size="secondary"
        />
      ))}
    </div>
  );
}

type FabButtonProps = {
  label: string;
  icon?: PageActionIcon;
  onClick: () => void;
  size: "primary" | "secondary";
};

type PageActionIcon = NonNullable<
  ReturnType<typeof resolvePageActions>["primary"]
>["icon"];

function FabButton({ label, icon: ActionIcon, onClick, size }: FabButtonProps) {
  const isPrimary = size === "primary";

  return (
    <Button
      type="button"
      variant={isPrimary ? "default" : "outline"}
      size="icon"
      tooltip={label}
      tooltipPosition="left"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "pointer-events-auto rounded-full shadow-md",
        isPrimary
          ? "size-14 [&_svg:not([class*='size-'])]:size-6"
          : "size-11 border-border/80 bg-background/95 backdrop-blur-sm [&_svg:not([class*='size-'])]:size-5",
      )}>
      {ActionIcon ? (
        <ActionIcon weight="bold" aria-hidden />
      ) : (
        <FabLabelFallback label={label} />
      )}
    </Button>
  );
}

function FabLabelFallback({ label }: { label: string }) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  return <span className="text-base font-semibold">{initial}</span>;
}
