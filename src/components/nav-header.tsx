"use client";

import React, { useEffect, useState } from "react";
import { 
    SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
    Separator 
} from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import { CONFIG } from "@/lib/config";

export function NavHeader() {
    const [activePeriod, setActivePeriod] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchActivePeriod = () => {
        const token = localStorage.getItem("laci_token");
        if (!token) return;

        fetch(`${CONFIG.API_BASE_URL}/periods/active`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            if (!res.ok) throw new Error("Tidak ada periode aktif");
            return res.json();
        })
        .then(data => {
            setActivePeriod(data.period);
        })
        .catch(() => {
            setActivePeriod(null);
        })
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchActivePeriod();

        // Listen for period updates to avoid full page reload
        const handleUpdate = () => fetchActivePeriod();
        window.addEventListener("laci-period-updated", handleUpdate);
        return () => window.removeEventListener("laci-period-updated", handleUpdate);
    }, []);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-white/95 backdrop-blur-md shadow-xs z-30 px-4 sticky top-0">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer md:hidden" />
            </div>

            <div className="flex items-center gap-2">
                {loading ? (
                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl shadow-xs animate-pulse">
                        <div className="size-3.5 bg-zinc-200 rounded-md" />
                        <div className="h-3 w-12 bg-zinc-200 rounded-md" />
                        <div className="h-3 w-4 bg-zinc-200 rounded-md" />
                        <div className="h-3 w-16 bg-zinc-200 rounded-md" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl shadow-xs">
                        <CalendarDays className="size-3.5 text-zinc-500" />
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Periode</span>
                        <Separator orientation="vertical" className="h-3 mx-1" />
                        <span className="text-[11px] font-black text-zinc-900">
                            {activePeriod ? activePeriod.name : "-"}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}
