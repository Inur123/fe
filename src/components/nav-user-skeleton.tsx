import React from "react";
import { ChevronsUpDown } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

// Komponen Skeleton terisolasi khusus untuk area NavUser
export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          {/* Elemen yang berdenyut (animate-pulse) eksklusif hanya untuk Avatar lingkaran (rounded-full), Nama, dan Gmail */}
          <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse shrink-0" />
          <div className="grid flex-1 gap-1.5">
            <div className="h-3 w-20 rounded-md bg-zinc-200 animate-pulse" />
            <div className="h-2 w-28 rounded-md bg-zinc-200 animate-pulse" />
          </div>
          {/* Ikon panah asli dirender seragam mutlak tanpa warna kustom agar tidak berkedip berubah warna saat refresh */}
          <ChevronsUpDown className="ml-auto size-4 shrink-0" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
