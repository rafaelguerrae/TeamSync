import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-6" />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-4" />
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
} 