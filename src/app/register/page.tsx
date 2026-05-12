"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 font-medium cursor-pointer">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-bold">Laci Cabang v3</span>
          </button>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm
              onSuccess={() => router.push("/login")}
              onSwitchToLogin={() => router.push("/login")}
            />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-zinc-950 lg:flex items-center justify-center p-12 overflow-hidden border-l border-border/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative z-10 max-w-md text-left space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">Mulai Perjalanan Anda</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Daftarkan entitas cabang Anda ke dalam sistem basis data terdistribusi kami yang terenkripsi dan andal.
          </p>
        </div>
      </div>
    </div>
  );
}
