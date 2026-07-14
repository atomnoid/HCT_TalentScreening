function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <div aria-label="Loading form" className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className={`w-full ${index === 0 ? "h-24" : "h-12"}`} />
        </div>
      ))}
      <Skeleton className="h-11 w-32" />
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div aria-label="Loading table" className="mt-4 overflow-hidden rounded-lg border border-slate-100">
      <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => <Skeleton key={index} className="h-4" />)}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, columnIndex) => <Skeleton key={columnIndex} className="h-4" />)}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div aria-label="Loading card" className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
}

export default Skeleton;
