import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <Skeleton className="aspect-square w-full" rounded="lg" />
      <div className="p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/2" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-3.5 w-3.5" rounded="full" />
          <Skeleton className="h-3.5 w-3.5" rounded="full" />
          <Skeleton className="h-3.5 w-3.5" rounded="full" />
        </div>
      </div>
    </div>
  );
}
