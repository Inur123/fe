"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  Edit,
  Plus,
  Trash2,
  X,
  ShieldAlert,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function PeriodsPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // States untuk Modal Buat / Edit
  const [modalType, setModalType] = useState<"create" | "edit" | null>(null);
  const [targetPeriod, setTargetPeriod] = useState<any>(null);
  const [periodName, setPeriodName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State Konfirmasi Hapus
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPeriods = (token: string) => {
    fetch(`${CONFIG.API_BASE_URL}/periods`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data periode");
        return res.json();
      })
      .then((data) => {
        const sorted = (data.periods || []).sort((a: any, b: any) => {
          if (a.is_active && !b.is_active) return -1;
          if (!a.is_active && b.is_active) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setPeriods(sorted);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(data => {
        setCurrentUser(data.user);
        const isSuperadmin = data.user?.role?.name === "Superadmin";
        const hasAccess = isSuperadmin || (data.user?.role?.permissions || []).some((p: any) => p.name === "get_periods");
        if (!hasAccess) {
            toast.error("Akses Ditolak");
            router.replace("/dashboard");
            return;
        }
        fetchPeriods(token);
    })
    .catch(() => router.replace("/login"));
  }, [router]);

  const isSuperadmin = currentUser?.role?.name === "Superadmin";
  const userPerms = currentUser?.role?.permissions || [];
  const canCreate = isSuperadmin || userPerms.some((p: any) => p.name === "post_periods");
  const canEdit = isSuperadmin || userPerms.some((p: any) => p.name === "put_periods_:id");
  const canDelete = isSuperadmin || userPerms.some((p: any) => p.name === "delete_periods_:id");
  const canSetActive = isSuperadmin || userPerms.some((p: any) => p.name === "put_periods_:id_active");

  const handleOpenCreate = () => {
    setModalType("create");
    setPeriodName("");
    setTargetPeriod(null);
  };

  const handleOpenEdit = (p: any) => {
    setModalType("edit");
    setPeriodName(p.name);
    setTargetPeriod(p);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setPeriodName("");
    setTargetPeriod(null);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodName.trim()) {
      toast.error("Nama periode wajib diisi");
      return;
    }

    const token = localStorage.getItem("laci_token");
    if (!token) return;

    setSubmitting(true);
    const isCreate = modalType === "create";
    const url = isCreate
      ? `${CONFIG.API_BASE_URL}/periods`
      : `${CONFIG.API_BASE_URL}/periods/${targetPeriod?.id}`;
    const method = isCreate ? "POST" : "PUT";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: periodName.trim(),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");
        return data;
      })
      .then(() => {
        toast.success(isCreate ? "Masa Khidmat berhasil ditambahkan" : "Masa Khidmat berhasil diperbarui");
        fetchPeriods(token);
        handleCloseModal();
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleSetActive = (id: string) => {
    const token = localStorage.getItem("laci_token");
    if (!token) return;

    const loadId = toast.loading("Mengaktifkan periode...");
    fetch(`${CONFIG.API_BASE_URL}/periods/${id}/active`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengaktifkan periode");
        return data;
      })
      .then(() => {
        toast.success("Periode berhasil diaktifkan", { id: loadId });
        // Beritahu NavHeader untuk memperbarui diri tanpa reload halaman
        window.dispatchEvent(new CustomEvent("laci-period-updated"));
        
        setPeriods((prev) =>
          prev.map((p) => ({ ...p, is_active: p.id === id }))
        );
      })
      .catch((err) => {
        toast.error(err.message, { id: loadId });
      });
  };

  const executeDelete = () => {
    if (!deleteId) return;
    const token = localStorage.getItem("laci_token");
    if (!token) return;

    const loadId = toast.loading("Menghapus periode...");
    fetch(`${CONFIG.API_BASE_URL}/periods/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghapus data");
        return data;
      })
      .then(() => {
        toast.success("Periode berhasil dihapus", { id: loadId });
        setPeriods((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      })
      .catch((err) => {
        toast.error(err.message, { id: loadId });
      });
  };

  return (
    <DashboardLayout breadcrumb="Periodisasi Organisasi">
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                Masa Khidmat Kepengurusan
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Kelola rentang periode aktif untuk organisasi Anda.
              </p>
            </div>

            {canCreate && (
              <Button
                onClick={handleOpenCreate}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl h-10 px-4 shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Tambah Periode</span>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-2" />
              <p className="text-xs font-medium text-zinc-500">Memuat data periode...</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-300 rounded-2xl bg-white max-w-md mx-auto">
              <Calendar className="size-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-600">Belum ada data periode.</p>
              <p className="text-xs text-zinc-400 mt-1">Silakan klik Tambah Periode untuk memulai.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periods.map((period) => {
                const isActive = period.is_active;
                return (
                  <div
                    key={period.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive ? "bg-white border-zinc-900 shadow-xs ring-1 ring-zinc-900/10" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div>
                      <Badge variant="secondary" className={`text-xs font-semibold px-2.5 py-0.5 rounded-md mb-2 inline-block ${isActive ? "bg-zinc-900 text-white hover:bg-zinc-900" : "bg-zinc-100 text-zinc-500"}`}>
                        {isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                      <h3 className="text-lg font-bold text-zinc-900 mt-1">{period.name}</h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(period)} className="h-8 px-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer font-medium text-xs">
                            <Edit className="size-3.5 mr-1" /> Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" disabled={isActive} onClick={() => setDeleteId(period.id)} className={`h-8 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-medium text-xs ${isActive ? "opacity-40 cursor-not-allowed" : ""}`}>
                            <Trash2 className="size-3.5 mr-1" /> Hapus
                          </Button>
                        )}
                      </div>

                      {canSetActive && !isActive && (
                        <Button size="sm" variant="outline" onClick={() => handleSetActive(period.id)} className="h-8 text-xs font-semibold border-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg cursor-pointer transition-all">
                          Jadikan Aktif
                        </Button>
                      )}

                      {isActive && (
                        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                          <Check className="size-3.5 stroke-[3]" /> Berjalan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 text-sm">{modalType === "create" ? "Tambah Periode Baru" : "Edit Masa Khidmat"}</h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSubmitModal} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Nama Periode <span className="text-rose-500">*</span></label>
                <Input required placeholder="Contoh: 2025-2026" value={periodName} onChange={(e) => setPeriodName(e.target.value)} className="rounded-lg border-zinc-300 h-10 text-sm font-medium text-zinc-900" autoFocus />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="h-9 px-3 rounded-lg text-xs font-medium text-zinc-600 border-zinc-200 cursor-pointer">Batal</Button>
                <Button type="submit" disabled={submitting} className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs cursor-pointer">{submitting ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AlertDialog untuk Konfirmasi Hapus */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-rose-200 bg-white max-w-sm">
          <AlertDialogHeader>
            <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <ShieldAlert className="size-6 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-rose-900">Hapus Periode?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-rose-600/80 leading-relaxed">
                Tindakan ini permanen. Pastikan tidak ada data yang bergantung pada periode ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl border-zinc-200 font-bold text-xs cursor-pointer bg-white">Batal</AlertDialogCancel>
            <AlertDialogAction 
                onClick={executeDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
                Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
