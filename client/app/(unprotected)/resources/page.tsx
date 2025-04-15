import { CategoriesRow } from "@/components/categoriesRow";
import ResourceGrid from "@/components/resourceGrid";
import { Spinner } from "@/components/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Resources() {
  return (
    <div className="bg-[#0c0c0c] w-full px-12 py-6 overflow-y-auto pt-40 relative min-h-screen">
      <Suspense
        fallback={
          <div className="w-full flex flex-row justify-center mb-12 gap-2 overflow-x-auto">
            <Skeleton className="h-5 w-18 bg-white/5 !rounded-md" />
            <Skeleton className="h-5 w-24 bg-white/5 !rounded-md" />
            <Skeleton className="h-5 w-12 bg-white/5 !rounded-md" />
            <Skeleton className="h-5 w-28 bg-white/5 !rounded-md" />
            <Skeleton className="h-5 w-14 bg-white/5 !rounded-md" />
            <Skeleton className="h-5 w-32 bg-white/5 !rounded-md" />
          </div>
        }
      >
        <CategoriesRow />
      </Suspense>
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full min-h-[69vh]">
            <Spinner />
          </div>
        }
      >
        <ResourceGrid />
      </Suspense>
    </div>
  );
}
