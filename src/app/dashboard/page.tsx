"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Verifikasi token ke backend menggunakan URL terpusat
    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sesi tidak valid");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("laci_token");
        router.replace("/login");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("laci_token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Memverifikasi kredensial...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="size-8" />
            </div>
            <CardTitle className="text-xl">{user?.name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-background p-3 text-xs space-y-2 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID Sistem</span>
                <span className="font-mono font-medium">#{user?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tingkat Keamanan</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" /> Enkripsi JWT
                </span>
              </div>
            </div>

            <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="size-4" />
              Keluar Sesi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
