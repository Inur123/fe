"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Check, Loader2, Plus, ShieldCheck } from "lucide-react";

import { CONFIG } from "@/lib/config";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function CreateRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
            (p: any) => p.name === "post_roles"
          );

        if (!hasAccess) {
          toast.error("Akses Ditolak", {
            description: "Anda tidak memiliki wewenang untuk menciptakan peran baru.",
          });
          router.replace("/roles");
          return;
        }
        // Fetch permissions
        fetchPermissions(token);
      })
      .catch(() => {
        localStorage.removeItem("laci_token");
        router.replace("/login");
      });
  }, [router]);

  const fetchPermissions = (token: string) => {
    fetch(`${CONFIG.API_BASE_URL}/roles/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.permissions) setPermissions(data.permissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleTogglePermission = (id: string) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama peran wajib diisi");
      return;
    }

    const token = localStorage.getItem("laci_token");
    if (!token) return;

    setSubmitting(true);
    fetch(`${CONFIG.API_BASE_URL}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        permission_ids: selectedPerms,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat peran");
        return data;
      })
      .then(() => {
        toast.success("Peran berhasil diciptakan!");
        router.push("/roles");
      })
      .catch((err) => {
        toast.error(err.message);
        setSubmitting(false);
      });
  };

  const formatPermissionName = (permName: string) => {
    const map: Record<string, string> = {
      get_roles: "Melihat Halaman Pengaturan Peran",
      get_roles_list: "Membaca Pilihan Peran Organisasi",
      post_roles: "Menciptakan Peran Baru",
      get_roles_permissions: "Melihat Daftar Pilihan Izin Akses",
      post_roles_permissions: "Menambahkan Izin Akses Khusus",
      "put_roles_:id_default": "Menentukan Peran Otomatis Pendaftar",
      "put_roles_:id": "Mengubah Nama dan Izin Akses Peran",
      "get_roles_:id": "Membaca Rincian Peran Spesifik",
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
    if (map[permName]) return map[permName];

    let clean = permName
      .replace("get_", "Lihat ")
      .replace("post_", "Buat ")
      .replace("put_", "Ubah ")
      .replace("delete_", "Hapus ");
    clean = clean.replace(/_/g, " ");
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPermissionDescription = (permName: string, defaultDesc?: string) => {
    const map: Record<string, string> = {
      get_roles: "Membuka gembok menu Role & Permission di bilah samping untuk melihat daftar peran.",
      get_roles_list: "Diperlukan agar sistem bisa menampilkan pilihan peran saat mengelola data anggota.",
      post_roles: "Memunculkan tombol '+ Buat Peran' untuk membuat jabatan baru di organisasi.",
      get_roles_permissions: "Melihat butir-butir centang izin akses ini saat membuka formulir peran.",
      post_roles_permissions: "Wewenang teknis untuk mendaftarkan fungsi izin baru ke dalam sistem.",
      "put_roles_:id_default": "Bisa mengklik tombol 'Jadikan Default' untuk pendaftar akun baru.",
      "put_roles_:id": "Melegalkan tombol Edit untuk menyimpan perubahan nama atau centang izin.",
      "get_roles_:id": "Diperlukan sistem untuk memuat data saat membuka formulir modifikasi peran ini.",
      get_auth_me: "Wajib dicentang agar aplikasi bisa mengenali nama dan foto profil saat login.",
      post_auth_login: "Wajib dicentang! Jika dicabut, pemilik peran ini akan diblokir saat mencoba login.",
      post_auth_logout: "Mengizinkan pengguna untuk menekan tombol keluar dari akun.",
      post_auth_register: "Mencatat informasi pendaftar baru ke dalam database keanggotaan.",
      get_periods: "Mengizinkan akses menu Masa Khidmat / Kepengurusan di antarmuka sistem.",
      get_periods_active: "Diperlukan untuk memvalidasi dan memuat identitas periode yang sedang berjalan.",
      post_periods: "Memunculkan formulir untuk merancang dan mendefinisikan masa kepengurusan baru.",
      "put_periods_:id_active": "Wewenang untuk mengambil alih dan mengaktifkan masa kepengurusan terpilih.",
      "put_periods_:id": "Melegalkan tombol ubah untuk memperbaiki salah ketik pada label periode.",
      "delete_periods_:id": "Wewenang mutlak untuk menghapus entitas kepengurusan yang tidak aktif.",
      get_archives: "Membuka menu pengarsipan untuk melacak dan mengunduh surat menyurat organisasi.",
      "get_archives_:id": "Membuka pratinjau digital untuk membaca rincian surat secara menyeluruh.",
      post_archives: "Mengizinkan pengurus untuk mengarsipkan surat masuk dan keluar baru.",
      "put_archives_:id": "Wewenang administratif untuk mengoreksi rincian dan lampiran arsip surat.",
      "delete_archives_:id": "Menghapus dokumen arsip digital dari pencatatan periode organisasi.",
    };
    return map[permName] || defaultDesc || "";
  };

  return (
    <SidebarProvider className="flex flex-row h-svh w-full overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-1 flex-col h-svh overflow-hidden w-auto md:ml-0 md:pl-0 transition-all duration-200 bg-zinc-50/50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-white shadow-xs z-30">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/roles">Role & Permission</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-zinc-900">
                    Buat Peran
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
          {/* Judul Halaman */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Plus className="text-zinc-900 size-6" />
              Ciptakan Peran Organisasi Baru
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Tentukan identitas peran serta cakupan butiran otorisasi fitur yang melekat pada peran ini.
            </p>
          </div>

          {loading ? (
            /* Skeleton Loading Mandiri Terkelompok (Grouped Layout Parity) */
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-8">
              {/* Seksi Input Atas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-200 rounded-md animate-pulse" />
                  <div className="h-10 bg-zinc-100 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-zinc-200 rounded-md animate-pulse" />
                  <div className="h-10 bg-zinc-100 rounded-xl animate-pulse" />
                </div>
              </div>

              {/* Seksi Otorisasi Terkelompok */}
              <div className="space-y-6 pt-2">
                <div className="h-3 w-48 bg-zinc-200 rounded-md animate-pulse" />

                {/* Seksi Bayangan Kelompok 1 (Auth) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100">
                    <span className="w-1 h-3.5 bg-amber-500/40 rounded-full animate-pulse" />
                    <div className="h-3 w-40 bg-zinc-200 rounded-md animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-zinc-50 rounded-xl animate-pulse border border-zinc-100" />
                    ))}
                  </div>
                </div>

                {/* Seksi Bayangan Kelompok 2 (Role) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100">
                    <span className="w-1 h-3.5 bg-indigo-500/40 rounded-full animate-pulse" />
                    <div className="h-3 w-48 bg-zinc-200 rounded-md animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="h-16 bg-zinc-50 rounded-xl animate-pulse border border-zinc-100" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase tracking-wider">
                    Nama Peran <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="contoh: Ketua Ranting, Bendahara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-zinc-300 focus-visible:ring-zinc-900 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase tracking-wider">
                    Deskripsi
                  </label>
                  <Input
                    placeholder="Penjelasan singkat tugas dan batas wewenang"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl border-zinc-300 focus-visible:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Pemilihan Permissions Terkelompok (Grouped Rendering) */}
              <div className="space-y-6 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block uppercase tracking-wider">
                    Tugaskan Hak Akses Fitur ({permissions.length} Tersedia)
                  </label>
                </div>

                {/* Kelompok Otentikasi & Sesi (Auth) */}
                {permissions.filter((p) => p.name.includes("auth")).length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100">
                      <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
                      <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                        Otentikasi & Sesi Pengguna (Auth)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions
                        .filter((p) => p.name.includes("auth"))
                        .map((perm) => {
                          const isSelected = selectedPerms.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                isSelected
                                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                                  : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                              <div
                                className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-white bg-white text-zinc-900"
                                    : "border-zinc-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="size-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0 leading-tight">
                                <p className="text-xs font-bold truncate tracking-wide">
                                  {formatPermissionName(perm.name)}
                                </p>
                                <p
                                  className={`text-[11px] line-clamp-2 mt-0.5 leading-snug ${
                                    isSelected ? "text-zinc-300" : "text-zinc-500"
                                  }`}
                                >
                                  {formatPermissionDescription(perm.name, perm.description)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Kelompok Manajemen Peran (Roles) */}
                {permissions.filter((p) => p.name.includes("roles")).length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100">
                      <span className="w-1 h-3.5 bg-indigo-500 rounded-full" />
                      <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                        Manajemen Peran & Hak Akses (Role)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions
                        .filter((p) => p.name.includes("roles"))
                        .map((perm) => {
                          const isSelected = selectedPerms.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                isSelected
                                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                                  : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                              <div
                                className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-white bg-white text-zinc-900"
                                    : "border-zinc-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="size-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0 leading-tight">
                                <p className="text-xs font-bold truncate tracking-wide">
                                  {formatPermissionName(perm.name)}
                                </p>
                                <p
                                  className={`text-[11px] line-clamp-2 mt-0.5 leading-snug ${
                                    isSelected ? "text-zinc-300" : "text-zinc-500"
                                  }`}
                                >
                                  {formatPermissionDescription(perm.name, perm.description)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Kelompok Lainnya */}
                {permissions.filter((p) => !p.name.includes("auth") && !p.name.includes("roles") && !p.name.includes("archives")).length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100">
                      <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                      <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                        Periodisasi
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions
                        .filter((p) => !p.name.includes("auth") && !p.name.includes("roles") && !p.name.includes("archives"))
                        .map((perm) => {
                          const isSelected = selectedPerms.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                isSelected
                                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                                  : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                              <div
                                className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-white bg-white text-zinc-900"
                                    : "border-zinc-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="size-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0 leading-tight">
                                <p className="text-xs font-bold truncate tracking-wide">
                                  {formatPermissionName(perm.name)}
                                </p>
                                <p
                                  className={`text-[11px] line-clamp-2 mt-0.5 leading-snug ${
                                    isSelected ? "text-zinc-300" : "text-zinc-500"
                                  }`}
                                >
                                  {formatPermissionDescription(perm.name, perm.description)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/roles")}
                  className="rounded-xl text-zinc-500 hover:text-zinc-700 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white px-5 cursor-pointer font-semibold flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Peran Baru"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
