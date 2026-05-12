"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CONFIG } from "@/lib/config";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Verifikasi sesi latar belakang secara senyap (silent re-auth)
    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sesi tidak valid");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("laci_token");
        toast("Sesi Berakhir", {
          description: "Sesi Anda telah kadaluarsa. Silakan masuk kembali.",
        });
        router.replace("/login");
      });
  }, [router]);

  // Render instan absolut tanpa pemblokiran layar loading untuk performa wow saat refresh
  return (
    <SidebarProvider className="flex flex-row h-svh w-full overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-1 flex-col h-svh overflow-hidden w-auto md:ml-0 md:pl-0 transition-all duration-200">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-white shadow-xs z-30">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {/* Kontainer bergulir mandiri (internal scroll) untuk menjamin header tetap diam absolut di puncak */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 mt-4 flex flex-col gap-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {/* Merender 12 kartu berlabel untuk demonstrasi visual pengguliran yang nyata */}
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
      </SidebarInset>
    </SidebarProvider>
  );
}
