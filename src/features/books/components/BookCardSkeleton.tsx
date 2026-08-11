export function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4 animate-pulse">
      <div className="h-48 bg-gray-100 rounded-lg" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2 justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-8 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}
