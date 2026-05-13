"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Edit,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Ambil profil sesi untuk cek akses
    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
        const isSuperadmin = data.user?.role?.name === "Superadmin";
        const hasAccess =
          isSuperadmin ||
          (data.user?.role?.permissions || []).some(
            (p: any) => p.name === "get_roles" || p.name === "get_roles_list"
          );

        if (!hasAccess) {
          toast.error("Akses Ditolak");
          router.replace("/dashboard");
          return;
        }
        fetchRolesList(token);
      })
      .catch(() => {
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
      .catch(() => {
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
      get_users: "Melihat Daftar Seluruh Pengguna",
      put_users_profile: "Memutakhirkan Identitas Akun Sendiri",
      "put_users_:id_role": "Mengubah Hak Akses Peran Pengguna",
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

  const isSuperadmin = currentUser?.role?.name === "Superadmin";
  const canCreateRole =
    isSuperadmin ||
    (currentUser?.role?.permissions || []).some((p: any) => p.name === "post_roles");
  const canEditRole =
    isSuperadmin ||
    (currentUser?.role?.permissions || []).some(
      (p: any) => p.name === "put_roles_:id" || p.name === "put_roles_:id_default"
    );

  return (
    <DashboardLayout breadcrumb="Role & Permission">
        <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
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
            ) : null}
          </div>

          {/* Area Tabel */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-semibold bg-zinc-50/30">
                    <th className="py-3.5 px-6">Nama Peran</th>
                    <th className="py-3.5 px-6">Deskripsi</th>
                    <th className="py-3.5 px-6">Hak Akses Tersuntik</th>
                    <th className="py-3.5 px-6 text-center">Status Pendaftaran</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 px-4 animate-in fade-in duration-200">
                        <div className="size-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-2" />
                        <p className="text-xs font-medium text-zinc-500">Memuat data peran...</p>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-zinc-400 text-sm">
                        Belum ada entitas peran yang terdaftar di database.
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr
                        key={role.id}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-zinc-900">
                          <div className="flex items-center gap-2">
                            {role.name === "Superadmin" && (
                              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                            {role.name}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-500 max-w-xs truncate font-medium">
                          {role.description || "—"}
                        </td>
                        <td className="py-4 px-6 max-w-md">
                          {role.name === "Superadmin" ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 font-bold">
                                Bypass Mutlak (Semua Akses)
                            </Badge>
                          ) : !role.permissions || role.permissions.length === 0 ? (
                            <span className="text-zinc-400 italic text-xs">
                              Tidak ada hak spesifik
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {role.permissions.map((perm: any) => (
                                <Badge key={perm.id} variant="secondary" className="bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100 font-semibold text-[11px] px-2 py-0.5 rounded-md">
                                  {formatPermissionName(perm.name)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {role.name === "Superadmin" ? (
                            <span className="text-zinc-300 text-xs italic font-medium">—</span>
                          ) : role.is_default ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 font-bold">
                                Default Pendaftar
                            </Badge>
                          ) : canEditRole ? (
                            <button
                              onClick={() => handleSetDefaultRole(role.id)}
                              className="text-xs text-zinc-400 hover:text-zinc-900 underline underline-offset-4 font-bold cursor-pointer transition-colors"
                            >
                              Jadikan Default
                            </button>
                          ) : (
                            <span className="text-zinc-300 text-xs italic font-medium">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {role.name === "Superadmin" ? (
                            <span className="text-zinc-300 text-xs italic font-medium">—</span>
                          ) : canEditRole ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/roles/edit/${role.id}`)}
                                className="size-9 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer shadow-none"
                            >
                                <Edit className="size-5" />
                            </Button>
                          ) : (
                            <span className="text-zinc-300 text-xs italic font-medium">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </DashboardLayout>
  );
}
