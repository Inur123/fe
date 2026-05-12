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
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PeriodsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Urutkan: Aktif di atas, lalu berdasarkan waktu pembuatan
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
      .then((res) => {
        if (!res.ok) throw new Error("Sesi tidak valid");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        const isSuperadmin = data.user?.role?.name === "Superadmin";
        const hasAccess =
          isSuperadmin ||
          (data.user?.role?.permissions || []).some(
            (p: any) => p.name === "get_periods"
          );

        if (!hasAccess) {
          toast.error("Akses Ditolak");
          router.replace("/dashboard");
          return;
        }

        fetchPeriods(token);
      })
      .catch(() => {
        localStorage.removeItem("laci_token");
        router.replace("/login");
      });
  }, [router]);

  // Kewenangan tombol CRUD
  const isSuperadmin = user?.role?.name === "Superadmin";
  const userPerms = user?.role?.permissions || [];
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

  // SUBMIT CREATE / EDIT
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
        toast.success(
          isCreate ? "Masa Khidmat berhasil ditambahkan" : "Masa Khidmat berhasil diperbarui"
        );
        fetchPeriods(token);
        handleCloseModal();
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setSubmitting(false));
  };

  // SET ACTIVE
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
        setPeriods((prev) =>
          prev.map((p) => ({ ...p, is_active: p.id === id }))
        );
      })
      .catch((err) => {
        toast.error(err.message, { id: loadId });
      });
  };

  // EXECUTE DELETE
  const executeDelete = (id: string) => {
    const token = localStorage.getItem("laci_token");
    if (!token) return;

    const loadId = toast.loading("Menghapus periode...");
    fetch(`${CONFIG.API_BASE_URL}/periods/${id}`, {
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
        setPeriods((prev) => prev.filter((p) => p.id !== id));
        setDeleteId(null);
      })
      .catch((err) => {
        toast.error(err.message, { id: loadId });
      });
  };

  return (
    <SidebarProvider className="flex flex-row h-svh w-full overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-1 flex-col h-svh overflow-hidden w-auto md:ml-0 md:pl-0 transition-all duration-200 bg-zinc-50/50">
        {/* NAVBAR ATAS (Murni Breadcrumb, tanpa tombol aksi) */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-white px-4 shadow-xs z-20">
          <SidebarTrigger className="-ml-1 cursor-pointer md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-zinc-900">
                  Periodisasi Organisasi
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Judul Halaman dan Tombol Tambah */}
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

          {/* DAFTAR PERIODE */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-zinc-200 animate-pulse" />
              ))}
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
                      isActive
                        ? "bg-white border-zinc-900 shadow-xs ring-1 ring-zinc-900/10"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <div>
                      <Badge
                        variant="secondary"
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md mb-2 inline-block ${
                          isActive
                            ? "bg-zinc-900 text-white hover:bg-zinc-900"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>

                      <h3 className="text-lg font-bold text-zinc-900 mt-1">
                        {period.name}
                      </h3>
                    </div>

                    {/* Aksi Bawah */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(period)}
                            className="h-8 px-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer font-medium text-xs"
                          >
                            <Edit className="size-3.5 mr-1" /> Edit
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isActive}
                            onClick={() => setDeleteId(period.id)}
                            className={`h-8 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-medium text-xs ${
                              isActive ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                          >
                            <Trash2 className="size-3.5 mr-1" /> Hapus
                          </Button>
                        )}
                      </div>

                      {canSetActive && !isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetActive(period.id)}
                          className="h-8 text-xs font-semibold border-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg cursor-pointer transition-all"
                        >
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
      </SidebarInset>

      {/* MODAL FORM TAMBAH / EDIT */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 text-sm">
                {modalType === "create" ? "Tambah Periode Baru" : "Edit Masa Khidmat"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  Nama Periode <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: 2025-2026"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="rounded-lg border-zinc-300 h-10 text-sm font-medium text-zinc-900"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="h-9 px-3 rounded-lg text-xs font-medium text-zinc-600 border-zinc-200 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
            <ShieldAlert className="size-10 text-rose-500 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="font-bold text-zinc-900 text-base">Hapus Periode?</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Data periode yang dihapus tidak dapat dikembalikan lagi.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="h-9 flex-1 rounded-lg text-xs font-medium border-zinc-200 text-zinc-600 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => executeDelete(deleteId)}
                className="h-9 flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
