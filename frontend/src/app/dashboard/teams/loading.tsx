import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Teams sections */}
      <div>
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
        <Skeleton className="h-full w-full" />
        <div className="absolute bottom-3 left-4">
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>
      
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-12 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
} 