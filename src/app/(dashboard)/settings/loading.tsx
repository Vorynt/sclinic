import { SimplePageSkeleton } from "@/components/status/SimplePageSkeleton"

export default function Loading() {
  return (
    <SimplePageSkeleton
      titleClassName="h-7 w-40"
      descriptionClassName="h-4 w-96 max-w-full"
    />
  )
}
