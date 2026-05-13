"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Shield,
  Key,
  Trash2,
  ArrowLeft,
  Loader2,
  Mail,
  Fingerprint,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [activePeriod, setActivePeriod] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dialog States
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // 1. Ambil data admin (currentUser)
    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user))
      .catch(() => {});

    // 2. Ambil data user yang akan dikelola
    fetch(`${CONFIG.API_BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Pengguna tidak ditemukan");
        return res.json();
      })
      .then((data) => {
        setTargetUser(data.user);
        setActivePeriod(data.active_period);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        router.back();
      });

    // 3. Ambil daftar peran
    fetch(`${CONFIG.API_BASE_URL}/roles/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRoles(data.roles || []))
      .catch(() => {});
  }, [id, router]);

  const handleRoleChange = async (newRoleId: string) => {
    const token = localStorage.getItem("laci_token");
    setActionLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTargetUser(data.user);
      toast.success("Peran pengguna berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const token = localStorage.getItem("laci_token");
    setActionLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/users/${id}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: "12345678" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Kata sandi berhasil direset menjadi '12345678'");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
      setResetDialogOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("laci_token");
    setActionLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Akun pengguna telah dihapus");
      router.replace("/users");
    } catch (err: any) {
      toast.error(err.message);
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCopyId = () => {
    if (!targetUser?.id) return;
    navigator.clipboard.writeText(targetUser.id);
    setCopied(true);
    toast.success("UUID disalin ke papan klip");
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    return nameStr.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isSelf = currentUser?.id === targetUser?.id;

  return (
    <DashboardLayout breadcrumb="Detail Pengguna">
        <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full hover:bg-white shadow-xs border border-zinc-200 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="size-4 text-zinc-600" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Kelola Pengguna</h1>
                <p className="text-sm text-zinc-500 font-medium">Informasi mendalam dan kontrol administratif akun.</p>
              </div>
            </div>

            {loading ? (
                <div className="bg-white p-20 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-center">
                    <Loader2 className="size-6 text-zinc-300 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                {/* Kolom Kiri: Info Ringkas */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center text-center">
                    <Avatar className="size-24 rounded-3xl border-2 border-zinc-100 shadow-sm mb-4">
                        <AvatarImage src={targetUser?.avatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-zinc-50 text-zinc-400 text-4xl font-bold">
                        {getInitials(targetUser?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-zinc-900">{targetUser?.name}</h3>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium mt-1">
                        <Mail className="size-3" /> {targetUser?.email}
                    </div>
                    <Badge className="mt-4 bg-zinc-900 text-white font-bold px-3 py-1 rounded-lg">
                        {targetUser?.role?.name || "Anggota"}
                    </Badge>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Metadata Sistem</h4>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                                    <Fingerprint className="size-3" /> UUID Pengguna
                                </span>
                                <div 
                                    onClick={handleCopyId}
                                    className="group relative cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    <code className="text-[10px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-zinc-600 block break-all pr-8 group-hover:border-zinc-300 group-hover:bg-white transition-colors">
                                        {targetUser?.id}
                                    </code>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-zinc-50">
                                <span className="text-xs font-semibold text-zinc-500 uppercase">Periode Aktif</span>
                                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                                    {activePeriod?.name || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-zinc-50">
                                <span className="text-xs font-semibold text-zinc-500 uppercase">Status</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                    Aktif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Aksi Administratif */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Card Gabungan: Role & Reset Password */}
                    <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Shield className="size-5 text-zinc-900" />
                                <h3 className="font-bold text-zinc-900">Pengaturan Akses & Keamanan</h3>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                                Kelola tingkatan wewenang anggota dan kendali keamanan akun secara terpusat untuk menjaga integritas data organisasi.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 ml-1">Delegasi Peran (*Role*)</label>
                                    <select 
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl h-12 px-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-zinc-900 outline-none transition-all cursor-pointer"
                                        value={targetUser?.role_id || ""}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        disabled={actionLoading || isSelf}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id} disabled={role.name === "Superadmin" && !isSelf}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 ml-1">Otoritas Kata Sandi</label>
                                    <Button 
                                        onClick={() => setResetDialogOpen(true)}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-zinc-200 hover:bg-zinc-900 hover:text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Reset ke Default (12345678)
                                    </Button>
                                </div>
                            </div>
                            {isSelf && <p className="text-[10px] text-rose-500 italic font-medium mt-2">Catatan: Anda tidak dapat mengubah peran Anda sendiri demi keamanan.</p>}
                        </div>
                    </div>

                    {/* Bahaya: Hapus Akun */}
                    <div className="bg-rose-50/30 p-8 rounded-2xl border border-rose-100 space-y-6">
                    <div className="flex items-center gap-2">
                        <Trash2 className="size-5 text-rose-600" />
                        <h3 className="font-bold text-rose-600 tracking-tight">Area Berbahaya</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="max-w-md">
                            <p className="text-sm font-bold text-rose-900">Hapus Akun Pengguna</p>
                            <p className="text-xs text-rose-700/70 mt-1">
                                Seluruh data terkait akun ini akan dihapus secara permanen dari basis data. Pengguna akan kehilangan akses selamanya.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={actionLoading || isSelf}
                            variant="destructive"
                            className="rounded-xl h-12 px-8 font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer bg-rose-600 hover:bg-rose-700"
                        >
                            Hapus Akun Permanen
                        </Button>
                    </div>
                    </div>
                </div>
                </div>
            )}
          </div>
        </main>

        {/* Dialogs */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <AlertDialogContent className="rounded-3xl border-zinc-200 bg-white max-w-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-zinc-900">Reset Password?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-zinc-500 leading-relaxed">
                        Kata sandi akan diatur ulang ke <span className="font-black text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded-md">12345678</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-2">
                    <AlertDialogCancel className="rounded-xl border-zinc-200 font-bold text-xs cursor-pointer">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleResetPassword}
                        className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
                    >
                        Ya, Reset Sekarang
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="rounded-3xl border-rose-200 bg-white max-w-sm">
                <AlertDialogHeader>
                    <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                        <Trash2 className="size-6 text-rose-600" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-rose-900">Hapus Akun?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-rose-600/80 leading-relaxed">
                        Tindakan ini tidak dapat dibatalkan. Seluruh data pengguna akan dimusnahkan selamanya.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-4">
                    <AlertDialogCancel className="rounded-xl border-zinc-200 font-bold text-xs cursor-pointer bg-white">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteUser}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                        Hapus Selamanya
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </DashboardLayout>
  );
}
