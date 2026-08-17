import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Full-page silhouette matching HelpCenter. */
export function HelpPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando ajuda"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-20"
        descriptionClassName="h-4 w-80 max-w-full"
        actionClassName="h-9 w-44"
      />
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
