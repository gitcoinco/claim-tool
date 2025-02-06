import { Skeleton } from '@/components/ui/skeleton';

export const GrantCardSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center space-between py-8 px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 flex-grow">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="flex flex-col gap-2 max-w-2xl w-full">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />

              <div className="flex h-5 items-center space-x-4 text-xs mt-8">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-px" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-px" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
