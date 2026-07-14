"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, ArrowLeft } from "lucide-react";

import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoleFormProps {
  roleId?: string; // If provided, it's edit mode
  mode: "create" | "edit";
}

export function RoleForm({ roleId, mode }: RoleFormProps) {
  const router = useRouter();
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

    // Fetch data based on mode
    if (mode === "edit" && roleId) {
        fetchRoleAndPermissions(token, roleId);
    } else {
        fetchPermissions(token);
    }
  }, [roleId, mode, router]);

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

  const fetchRoleAndPermissions = (token: string, id: string) => {
    Promise.all([
      fetch(`${CONFIG.API_BASE_URL}/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Peran tidak ditemukan");
        return res.json();
      }),
      fetch(`${CONFIG.API_BASE_URL}/roles/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([roleData, permsData]) => {
        const r = roleData.role;
        if (r.name === "Superadmin") {
          toast.error("Peran Superadmin tidak dapat dimodifikasi.");
          router.replace("/roles");
          return;
        }

        setName(r.name);
        setDescription(r.description || "");
        setSelectedPerms(r.permissions?.map((p: any) => p.id) || []);

        if (permsData.permissions) setPermissions(permsData.permissions);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        router.replace("/roles");
      });
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
    const url = mode === "edit" ? `${CONFIG.API_BASE_URL}/roles/${roleId}` : `${CONFIG.API_BASE_URL}/roles`;
    const method = mode === "edit" ? "PUT" : "POST";

    fetch(url, {
      method,
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
        if (!res.ok) throw new Error(data.error || `Gagal ${mode === "edit" ? "memperbarui" : "membuat"} peran`);
        return data;
      })
      .then(() => {
        toast.success(`Peran berhasil ${mode === "edit" ? "dimodifikasi" : "diciptakan"}!`);
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
      get_users: "Melihat Daftar Seluruh Pengguna",
      put_users_profile: "Memutakhirkan Identitas Akun Sendiri",
      "put_users_:id_role": "Mengubah Hak Akses Peran Pengguna",
      "put_users_:id_reset-password": "Mereset Kata Sandi Pengguna Lain",
      "delete_users_:id": "Menghapus Akun Pengguna Secara Permanen"
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
      get_users: "Mengizinkan akses untuk melihat daftar seluruh anggota yang terdaftar.",
      put_users_profile: "Wewenang standar untuk memperbarui foto profil dan email sendiri.",
      "put_users_:id_role": "Wewenang administratif untuk mengubah tingkatan peran anggota lain.",
      "put_users_:id_reset-password": "Bisa mereset password anggota jika mereka lupa atau kehilangan akses.",
      "delete_users_:id": "Wewenang tertinggi untuk menghapus akun anggota dari database."
    };
    return map[permName] || defaultDesc || "";
  };

  return (
    <div className="w-full space-y-8">
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
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                    {mode === "edit" ? "Modifikasi Peran Organisasi" : "Tambah Peran Baru"}
                </h1>
                <p className="text-sm text-zinc-500 font-medium">
                    {mode === "edit" 
                        ? "Sesuaikan penamaan, deskripsi, serta centang butir otorisasi akses spesifik untuk peran ini."
                        : "Tentukan identitas peran serta cakupan butiran otorisasi fitur yang melekat pada peran ini."}
                </p>
            </div>
        </div>

        {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-center">
                <Loader2 className="size-6 text-zinc-400 animate-spin" />
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 ml-1">
                                Nama Peran <span className="text-red-500">*</span>
                            </label>
                            <Input placeholder="contoh: Ketua Ranting" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-zinc-200 h-12 text-sm font-medium focus:ring-zinc-900" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 ml-1">
                                Deskripsi Singkat
                            </label>
                            <Input placeholder="Penjelasan wewenang" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border-zinc-200 h-12 text-sm font-medium focus:ring-zinc-900" />
                        </div>
                    </div>

                    <div className="space-y-10 pt-4">
                        <div className="pb-2 border-b border-zinc-100">
                            <h3 className="text-sm font-bold text-zinc-900">Konfigurasi Otorisasi Akses</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Pilih fitur apa saja yang boleh diakses oleh pemilik peran ini.</p>
                        </div>

                        {/* Groups */}
                        {[
                            { title: "Otentikasi & Sesi Pengguna", color: "bg-amber-500", filter: "auth" },
                            { title: "Manajemen Peran & Hak Akses", color: "bg-indigo-500", filter: "roles" },
                            { title: "Manajemen Keanggotaan", color: "bg-emerald-500", filter: "users" },
                            { title: "Manajemen Arsip Surat", color: "bg-blue-500", filter: "archives" },
                            { title: "Periodisasi Kepengurusan", color: "bg-rose-500", filter: "other" }
                        ].map((group) => {
                            const filteredPerms = permissions.filter((p) => {
                                if (group.filter === "other") {
                                    return !p.name.includes("auth") && !p.name.includes("roles") && !p.name.includes("users") && !p.name.includes("archives");
                                }
                                return p.name.includes(group.filter);
                            });

                            if (filteredPerms.length === 0) return null;

                            return (
                                <div key={group.title} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1 h-4 ${group.color} rounded-full`} />
                                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{group.title}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredPerms.map((perm) => {
                                            const isSelected = selectedPerms.includes(perm.id);
                                            return (
                                                <div key={perm.id} onClick={() => handleTogglePermission(perm.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${isSelected ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-[1.02]" : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"}`}>
                                                    <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "border-white bg-white text-zinc-900" : "border-zinc-300 bg-white"}`}>
                                                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 leading-tight">
                                                        <p className="text-xs font-bold truncate tracking-wide">{formatPermissionName(perm.name)}</p>
                                                        <p className={`text-[11px] line-clamp-2 mt-1 leading-snug ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>{formatPermissionDescription(perm.name, perm.description)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => router.push("/roles")} className="rounded-xl px-8 h-12 font-bold text-xs cursor-pointer border-zinc-200">Batal</Button>
                        <Button type="submit" disabled={submitting} className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white px-10 h-12 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2">
                            {submitting ? <Loader2 className="size-4 animate-spin" /> : (mode === "edit" ? "Simpan Perubahan" : "Simpan Peran Baru")}
                        </Button>
                    </div>
                </div>
            </form>
        )}
    </div>
  );
}
