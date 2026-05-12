"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Edit,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { AppSidebar } from "@/components/app-sidebar";
import { RolesSkeleton } from "@/components/roles-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RolesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Ambil profil sesi
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
            (p: any) => p.name === "get_roles" || p.name === "get_roles_list"
          );

        // Pengecekan RBAC dinamis: Izinkan jika Superadmin atau punya izin spesifik
        if (!hasAccess) {
          toast.error("Akses Ditolak", {
            description: "Anda tidak memiliki wewenang untuk melihat referensi peran.",
          });
          router.replace("/dashboard");
          return;
        }
        fetchRolesList(token);
      })
      .catch(() => {
        localStorage.removeItem("laci_token");
        toast("Sesi Berakhir", {
          description: "Sesi Anda telah kadaluarsa. Silakan masuk kembali.",
        });
        router.replace("/login");
      });
  }, [router]);

  const fetchRolesList = (token: string) => {
    setLoading(true);
    fetch(`${CONFIG.API_BASE_URL}/roles/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) setRoles(data.roles);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil daftar peran:", err);
        setLoading(false);
      });
  };

  const handleSetDefaultRole = (id: string) => {
    const token = localStorage.getItem("laci_token");
    if (!token) return;

    fetch(`${CONFIG.API_BASE_URL}/roles/${id}/default`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengatur default");
        return data;
      })
      .then(() => {
        toast.success("Peran Pendaftar Baru Berhasil Diperbarui!");
        setRoles((prev) =>
          prev.map((r) => ({ ...r, is_default: r.id === id }))
        );
      })
      .catch((err) => toast.error(err.message));
  };

  const formatPermissionName = (name: string) => {
    const map: Record<string, string> = {
      get_roles: "Melihat Halaman Pengaturan Peran",
      get_roles_list: "Membaca Pilihan Peran Organisasi",
      post_roles: "Menciptakan Peran Baru",
      get_roles_permissions: "Melihat Daftar Pilihan Izin Akses",
      post_roles_permissions: "Menambahkan Izin Akses Khusus",
      "put_roles_:id_default": "Menentukan Peran Otomatis Pendaftar",
      "put_roles_:id": "Mengubah Nama dan Izin Akses Peran",
      get_auth_me: "Membaca Identitas Akun Sendiri",
      post_auth_login: "Diizinkan Masuk (Login) ke Aplikasi",
      post_auth_logout: "Diizinkan Keluar (Logout) dari Aplikasi",
      post_auth_register: "Menerima Pendaftaran Anggota Baru",
      get_periods: "Melihat Masa Kepengurusan (Periode)",
      get_periods_active: "Mengecek Masa Kepengurusan Aktif",
      post_periods: "Menambahkan Masa Kepengurusan Baru",
      "put_periods_:id_active": "Mengalihkan Status Masa Kepengurusan Aktif",
      "put_periods_:id": "Memodifikasi Nama Masa Kepengurusan",
      "delete_periods_:id": "Menghapus Entitas Masa Kepengurusan",
      get_archives: "Membaca Daftar Arsip Surat Digital",
      "get_archives_:id": "Melihat Rincian Arsip Surat Spesifik",
      post_archives: "Mengunggah Dokumen Arsip Surat Baru",
      "put_archives_:id": "Memperbarui Rincian Dokumen Arsip Surat",
      "delete_archives_:id": "Menghapus Dokumen Arsip Surat Digital",
    };
    if (map[name]) return map[name];

    let clean = name
      .replace("get_", "Lihat ")
      .replace("post_", "Buat ")
      .replace("put_", "Ubah ")
      .replace("delete_", "Hapus ");
    clean = clean.replace(/_/g, " ");
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isSuperadmin = user?.role?.name === "Superadmin";
  const canCreateRole =
    isSuperadmin ||
    (user?.role?.permissions || []).some((p: any) => p.name === "post_roles");
  const canEditRole =
    isSuperadmin ||
    (user?.role?.permissions || []).some(
      (p: any) => p.name === "put_roles_:id" || p.name === "put_roles_:id_default"
    );

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-1 flex-col min-h-svh w-full bg-zinc-50/50 transition-all duration-200">
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-white/95 backdrop-blur-md shadow-xs z-30 px-4">
          <SidebarTrigger className="-ml-1 cursor-pointer md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-zinc-900">
                  Role & Permission
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {loading ? (
          <RolesSkeleton count={roles.length || 2} />
        ) : (
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
            {/* Header Konten */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="text-zinc-900 size-7" />
                  Pengaturan Peran Organisasi
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Kelola tingkatan otorisasi dan tentukan butiran hak akses untuk setiap peran pengguna.
                </p>
              </div>
              {canCreateRole ? (
                <Button
                  size="sm"
                  onClick={() => router.push("/roles/create")}
                  className="rounded-xl font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="size-4 mr-1" />
                  Buat Peran
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <ShieldAlert className="size-4 shrink-0" />
                  Hanya peran terotorisasi yang dapat membuat entitas baru
                </div>
              )}
            </div>

            {/* Area Tabel */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-100 font-semibold text-sm text-zinc-700 bg-zinc-50/50 flex justify-between items-center">
                <span>Daftar Peran Terdaftar ({roles.length})</span>
              </div>

              {roles.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 text-sm">
                  Belum ada entitas peran yang terdaftar di database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase tracking-wider font-bold bg-white">
                        <th className="py-3.5 px-6">Nama Peran</th>
                        <th className="py-3.5 px-6">Deskripsi</th>
                        <th className="py-3.5 px-6">Hak Akses Tersuntik</th>
                        <th className="py-3.5 px-6 text-center">Status Pendaftaran</th>
                        <th className="py-3.5 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-600">
                      {roles.map((role) => (
                        <tr
                          key={role.id}
                          className="hover:bg-zinc-50/60 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-zinc-900">
                            <div className="flex items-center gap-2">
                              {role.name === "Superadmin" && (
                                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                              )}
                              {role.name}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-zinc-500 max-w-xs truncate">
                            {role.description || "—"}
                          </td>
                          <td className="py-4 px-6 max-w-md">
                            {role.name === "Superadmin" ? (
                              <span className="inline-flex px-2.5 py-1 text-xs bg-red-50 text-red-700 border border-red-200/60 rounded-lg font-bold tracking-wide">
                                Bypass Mutlak (Semua Akses)
                              </span>
                            ) : !role.permissions || role.permissions.length === 0 ? (
                              <span className="text-zinc-400 italic text-xs">
                                Tidak ada hak spesifik
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {role.permissions.map((perm: any) => (
                                  <span
                                    key={perm.id}
                                    className="inline-flex px-2 py-0.5 text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200/80 rounded-md font-semibold tracking-tight"
                                  >
                                    {formatPermissionName(perm.name)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {role.name === "Superadmin" ? (
                              <span className="text-zinc-300 text-xs italic">—</span>
                            ) : role.is_default ? (
                              <span className="inline-flex px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg font-bold tracking-wide">
                                Default Pendaftar
                              </span>
                            ) : canEditRole ? (
                              <button
                                onClick={() => handleSetDefaultRole(role.id)}
                                className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2 font-medium cursor-pointer"
                              >
                                Jadikan Default
                              </button>
                            ) : (
                              <span className="text-zinc-300 text-xs italic">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {role.name === "Superadmin" ? (
                              <span className="text-zinc-300 text-xs italic">—</span>
                            ) : canEditRole ? (
                              <button
                                onClick={() => router.push(`/roles/edit/${role.id}`)}
                                title="Edit Peran & Hak Akses"
                                className="inline-flex items-center justify-center size-8 rounded-xl text-zinc-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200/60 transition-all cursor-pointer"
                              >
                                <Edit className="size-4" />
                              </button>
                            ) : (
                              <span className="text-zinc-300 text-xs italic">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
