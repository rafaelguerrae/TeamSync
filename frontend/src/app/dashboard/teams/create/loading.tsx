import { Skeleton } from "@/components/ui/skeleton";

export default function CreateTeamLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-3 w-48 mt-1" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <div className="flex">
            <Skeleton className="h-10 w-10 rounded-l-md" />
            <Skeleton className="h-10 flex-1 rounded-r-md" />
          </div>
          <Skeleton className="h-3 w-64 mt-1" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-3 w-56 mt-1" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-3 w-80 mt-1" />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
} 