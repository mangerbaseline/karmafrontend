export function SkeletonLine({ className = "" }) {
  return <div className={`h-3 w-full rounded-full bg-gray-200/80 ${className}`} />;
}

export function SkeletonCard({ className = "" }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>
    <div className="animate-pulse space-y-3">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="w-1/2" />
      <SkeletonLine className="w-5/6" />
    </div>
  </div>;
}
