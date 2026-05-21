import { CategoryGridSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function BrowseLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />

      {/* Categories */}
      <Skeleton className="h-6 w-40 mb-4" />
      <CategoryGridSkeleton count={8} />

      {/* Products */}
      <Skeleton className="h-6 w-48 mt-10 mb-4" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
