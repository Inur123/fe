import React from "react";

export function RolesSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Header Konten Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-zinc-200 animate-pulse shrink-0" />
            <div className="h-6 w-64 rounded-lg bg-zinc-200 animate-pulse" />
          </div>
          <div className="h-3 w-80 rounded-md bg-zinc-100 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-zinc-200 animate-pulse shrink-0" />
      </div>

      {/* Tabel Skeleton */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <div className="h-4 w-40 rounded-md bg-zinc-200 animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {/* Header Tabel Simulasi */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-zinc-100">
            <div className="h-3 w-20 rounded-md bg-zinc-100 animate-pulse" />
            <div className="h-3 w-28 rounded-md bg-zinc-100 animate-pulse" />
            <div className="h-3 w-36 rounded-md bg-zinc-100 animate-pulse" />
            <div className="h-3 w-16 rounded-md bg-zinc-100 animate-pulse mx-auto" />
            <div className="h-3 w-12 rounded-md bg-zinc-100 animate-pulse ml-auto" />
          </div>

          {/* Baris-baris Skeleton Berdenyut */}
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 items-center py-2">
              <div>
                <div className="h-4 w-32 rounded-md bg-zinc-200 animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-48 rounded-md bg-zinc-100 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <div className="h-5 w-16 rounded-md bg-zinc-100 animate-pulse" />
                <div className="h-5 w-24 rounded-md bg-zinc-100 animate-pulse" />
                <div className="h-5 w-20 rounded-md bg-zinc-100 animate-pulse" />
              </div>
              <div className="mx-auto">
                <div className="h-3 w-16 rounded-md bg-zinc-100 animate-pulse" />
              </div>
              <div className="ml-auto">
                <div className="size-7 rounded-lg bg-zinc-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
