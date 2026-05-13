"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout breadcrumb="Dashboard">
      <div className="p-4 flex flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-muted border border-border shadow-xs flex items-center justify-center text-muted-foreground font-medium"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted border border-border shadow-xs flex items-center justify-center text-muted-foreground font-medium md:min-h-[50vh]">
          Area Konten Ekstra Panjang (Gulir Terus ke Bawah)
        </div>
      </div>
    </DashboardLayout>
  );
}
