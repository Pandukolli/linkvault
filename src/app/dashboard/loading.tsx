"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] animate-in fade-in duration-500">
      {/* Sidebar Skeleton */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 pt-4">
        <Skeleton className="h-12 w-full rounded-md bg-secondary" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-24 bg-secondary" />
          <Skeleton className="h-10 w-full bg-secondary" />
          <Skeleton className="h-10 w-full bg-secondary" />
          <Skeleton className="h-10 w-full bg-secondary" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 bg-secondary" />
            <Skeleton className="h-4 w-32 bg-secondary" />
          </div>
          <Skeleton className="h-10 w-24 bg-secondary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="premium-card p-6 border border-border rounded-xl bg-surface space-y-4">
              <Skeleton className="h-40 w-full rounded-md bg-secondary" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 bg-secondary" />
                <Skeleton className="h-4 w-1/2 bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
