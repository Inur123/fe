"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6 max-w-2xl">
        {/* Label Indikator Sistem */}
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
          <Shield className="size-3.5 text-primary" />
          Sistem Informasi Terpadu v3.0
        </div>

        {/* Judul Utama */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-balance">
          Laci Cabang <span className="text-primary">v3</span>
        </h1>

        {/* Deskripsi */}
        <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto">
          Infrastruktur digital modern untuk penyimpanan arsip terpusat yang aman, cepat, dan terenkripsi menggunakan teknologi terkini.
        </p>

        {/* Tombol Aksi Autentikasi */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="gap-2 font-semibold"
            onClick={() => router.push("/login")}
          >
            <Lock className="size-4" />
            Masuk (Login)
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 font-semibold"
            onClick={() => router.push("/register")}
          >
            Daftar Akun
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Catatan Kaki */}
      <p className="absolute bottom-6 text-xs text-muted-foreground">
        &copy; 2026 Laci Cabang Inc. Dipersembahkan dengan Next.js &amp; Shadcn UI.
      </p>
    </div>
  );
}
