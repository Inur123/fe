"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Calendar,
  Paperclip,
  Loader2,
  Eye,
  X,
  FileText,
  Upload,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateArchivePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    letter_number: "",
    letter_type: "Masuk",
    organization: "IPNU",
    letter_date: "",
    contact_name: "",
    subject: "",
    description: "",
    file_url: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const isSuperadmin = data.user?.role?.name === "Superadmin";
        const hasAccess =
          isSuperadmin ||
          (data.user?.role?.permissions || []).some(
            (p: any) => p.name === "post_archives"
          );
        
        if (!hasAccess) {
          toast.error("Akses Ditolak: Anda tidak memiliki izin untuk menambah arsip surat.");
          router.replace("/archives");
        }
      })
      .catch(() => {
        router.push("/archives");
      });
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 2MB.");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("laci_token");
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah file");

      setFormData({ ...formData, file_url: data.url });
      toast.success("File berhasil diunggah");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.letter_date) {
        toast.error("Silakan pilih tanggal surat");
        return;
    }
    setLoading(true);

    const token = localStorage.getItem("laci_token");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/archives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan arsip");

      toast.success("Arsip surat berhasil ditambahkan");
      router.push("/archives");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout breadcrumb="Tambah Arsip">
      <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
        <div className="w-full space-y-6">
          {/* Header */}
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
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Tambah Arsip Surat</h1>
              <p className="text-xs text-zinc-500 font-medium">Tambahkan arsip surat baru ke sistem.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xs space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              
              {/* Row 1: Nomor Surat | Jenis Surat */}
              <div className="space-y-1.5">
                  <Label htmlFor="letter_number" className="text-xs font-bold text-zinc-700">Nomor Surat <span className="text-rose-500">*</span></Label>
                  <Input
                      id="letter_number"
                      required
                      placeholder="Contoh: 001/IPNU-PAC/XII/2025"
                      value={formData.letter_number}
                      onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium"
                  />
              </div>
              <div className="space-y-1.5">
                  <Label htmlFor="letter_type" className="text-xs font-bold text-zinc-700">Jenis Surat <span className="text-rose-500">*</span></Label>
                  <select
                      id="letter_type"
                      required
                      value={formData.letter_type}
                      onChange={(e) => setFormData({ ...formData, letter_type: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                  >
                      <option value="Masuk">Surat Masuk</option>
                      <option value="Keluar">Surat Keluar</option>
                  </select>
              </div>

              {/* Row 2: Organisasi | Tanggal Surat */}
              <div className="space-y-1.5">
                  <Label htmlFor="organization" className="text-xs font-bold text-zinc-700">Organisasi <span className="text-rose-500">*</span></Label>
                  <select
                      id="organization"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                  >
                      <option value="IPNU">IPNU</option>
                      <option value="IPPNU">IPPNU</option>
                      <option value="BERSAMA">BERSAMA</option>
                      <option value="CBP-KPP">CBP-KPP</option>
                  </select>
              </div>
              <div className="space-y-1.5">
                  <Label htmlFor="letter_date" className="text-xs font-bold text-zinc-700">Tanggal Surat <span className="text-rose-500">*</span></Label>
                  <Input
                      id="letter_date"
                      type="date"
                      required
                      value={formData.letter_date}
                      onChange={(e) => setFormData({ ...formData, letter_date: e.target.value })}
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium"
                  />
              </div>

              {/* Row 3: Pengirim/Penerima | Perihal */}
              <div className="space-y-1.5">
                  <Label htmlFor="contact_name" className="text-xs font-bold text-zinc-700">Pengirim/Penerima <span className="text-rose-500">*</span></Label>
                  <Input
                      id="contact_name"
                      required
                      placeholder="Nama pengirim atau penerima"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium"
                  />
              </div>
              <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-bold text-zinc-700">Perihal <span className="text-rose-500">*</span></Label>
                  <Input
                      id="subject"
                      required
                      placeholder="Perihal / singkat isi surat"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium"
                  />
              </div>

              {/* Row 4: Deskripsi | File Surat */}
              <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-bold text-zinc-700">Deskripsi</Label>
                  <textarea
                      id="description"
                      rows={5}
                      placeholder="Deskripsi singkat mengenai surat (opsional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900 min-h-[144px]"
                  />
              </div>
              <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">File Surat</Label>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  
                  {formData.file_url ? (
                    <div className="h-[144px] bg-white p-4 rounded-xl border border-zinc-100 shadow-xs flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-inner">
                                <FileText className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-900">File Berhasil Diunggah</p>
                                <p className="text-[10px] text-zinc-400 font-medium tracking-tight">Siap untuk diproses</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" onClick={() => window.open(formData.file_url, '_blank')} className="size-9 rounded-xl text-zinc-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"><Eye className="size-5" /></Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, file_url: "" })} className="size-9 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"><X className="size-5" /></Button>
                        </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="h-[144px] border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center text-center p-6 gap-3 bg-zinc-50/30 transition-all hover:bg-zinc-50 cursor-pointer group relative overflow-hidden">
                        <div className="size-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-500"><span className="text-blue-600">Klik untuk upload</span> atau drag & drop text</p>
                            <p className="text-[10px] text-zinc-400 font-medium leading-tight">Maksimal 2MB. Format: PDF, JPG, PNG. File akan dienkripsi otomatis.</p>
                        </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full bg-zinc-50/50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-xl h-12 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer justify-center"
                >
                    <X className="size-4" /> Batal
                </Button>
                <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer justify-center"
                >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    Simpan Surat
                </Button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}
