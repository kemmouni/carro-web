import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-3 w-full" />)}
              </div>
            </div>
          ))}
        </aside>
        {/* Results */}
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-5" />
          <ProductGridSkeleton count={10} />
        </div>
      </div>
    </div>
  );
}
