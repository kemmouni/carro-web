import { DashboardStatSkeleton, Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-48 mb-1" />
      <Skeleton className="h-4 w-64 mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => <DashboardStatSkeleton key={i} />)}
      </div>

      {/* Table */}
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-5 py-3.5">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
