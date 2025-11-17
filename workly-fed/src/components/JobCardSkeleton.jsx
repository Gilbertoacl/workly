export default function JobCardSkeleton() {
  return (
    <div className="w-full bg-surface rounded-xl shadow-md border border-border animate-pulse p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-700/40" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-700/40 rounded" />
          <div className="flex gap-2">
            <div className="h-3 w-20 bg-gray-700/40 rounded" />
            <div className="h-3 w-24 bg-gray-700/40 rounded" />
          </div>
        </div>
      </div>
      <div className="h-3 bg-gray-700/40 rounded w-full" />
      <div className="h-3 bg-gray-700/40 rounded w-3/4" />
      <div className="flex gap-2 pt-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 w-16 bg-gray-700/40 rounded-full" />
        ))}
      </div>
    </div>
  );
}
