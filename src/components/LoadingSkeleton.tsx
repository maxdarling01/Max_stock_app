export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
          <div className="aspect-video bg-gray-200"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-14"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
