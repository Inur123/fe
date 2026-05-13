"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavHeader } from "@/components/nav-header";
import { getCachedUser, setCachedUser } from "@/lib/auth-cache";

interface DashboardLayoutProps {
    children: React.ReactNode;
    breadcrumb: string;
}

export function DashboardLayout({ children, breadcrumb }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchUser = () => {
        const token = localStorage.getItem("laci_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.ok) throw new Error("Sesi tidak valid");
            return res.json();
        })
        .then((data) => {
            setCachedUser(data.user);
            setUser(data.user);
            setLoading(false);
        })
        .catch(() => {
            setCachedUser(null);
            localStorage.removeItem("laci_token");
            router.replace("/login");
        });
    };

    useEffect(() => {
        setMounted(true);
        const cached = getCachedUser();
        if (cached) {
            setUser(cached);
            setLoading(false);
        }
        
        fetchUser();

        // Update document title based on breadcrumb
        if (breadcrumb) {
            document.title = `${breadcrumb} | Laci Cabang v3`;
        }

        // Listen for profile updates
        window.addEventListener("laci-user-updated", fetchUser);
        return () => window.removeEventListener("laci-user-updated", fetchUser);
    }, [router, pathname, breadcrumb]);

    // Untuk menghindari Hydration Mismatch, kita harus merender sesuatu yang sama dengan server saat pertama kali.
    // Server merender loading spinner (karena tidak ada localStorage).
    if (!mounted || (loading && !user)) {
        return (
            <div className="flex h-svh w-full items-center justify-center bg-zinc-50">
                <Loader2 className="size-6 text-zinc-900 animate-spin" />
            </div>
        );
    }

    return (
        <SidebarProvider className="flex flex-row h-svh w-full overflow-hidden">
            <AppSidebar user={user} />
            <SidebarInset className="flex flex-1 flex-col h-svh overflow-hidden w-auto md:ml-0 md:pl-0 transition-all duration-200 bg-zinc-50/50">
                <NavHeader />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
