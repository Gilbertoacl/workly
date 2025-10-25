export default function JobCardSkeleton() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mx-auto my-2 animate-pulse">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-2" />
            <div className="flex space-x-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      </div>
      <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
        ))}
      </div>
    </div>
  );
}