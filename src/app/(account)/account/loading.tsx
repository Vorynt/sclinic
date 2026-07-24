export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="h-40 w-full max-w-md animate-pulse rounded-md bg-muted" />
    </div>
  )
}
