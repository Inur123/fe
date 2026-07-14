"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Maximize2,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditArchivePage() {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
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

    fetch(`${CONFIG.API_BASE_URL}/archives/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
          if (!res.ok) throw new Error("Arsip tidak ditemukan");
          return res.json();
      })
      .then((data) => {
        const a = data.archive;
        setFormData({
          letter_number: a.letter_number || "",
          letter_type: a.letter_type || "Masuk",
          organization: a.organization || "IPNU",
          letter_date: a.letter_date ? a.letter_date.split("T")[0] : "",
          contact_name: a.contact_name || "",
          subject: a.subject || "",
          description: a.description || "",
          file_url: a.file_url || "",
        });
        setInitialLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        router.push("/archives");
      });
  }, [id, router]);

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
      setShowUpload(false);
      toast.success("File baru berhasil diunggah");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("laci_token");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/archives/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal memperbarui arsip");

      toast.success("Perubahan arsip berhasil disimpan");
      router.push(`/archives/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return (
          <DashboardLayout breadcrumb="Edit Arsip">
              <div className="flex h-[80vh] w-full items-center justify-center">
                  <Loader2 className="size-8 text-zinc-300 animate-spin" />
              </div>
          </DashboardLayout>
      );
  }

  return (
    <DashboardLayout breadcrumb="Edit Arsip">
      <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
        <div className="w-full space-y-8">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-white shadow-xs border border-zinc-200 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="size-4 text-zinc-600" />
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Arsip Surat</h1>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Perbarui rincian dokumen yang tersimpan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-xs space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              <div className="space-y-2">
                  <Label htmlFor="letter_number" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Nomor Surat <span className="text-rose-500">*</span></Label>
                  <Input
                      id="letter_number"
                      required
                      placeholder="Contoh: 001/IPNU-PAC/XII/2025"
                      value={formData.letter_number}
                      onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold placeholder:font-medium placeholder:text-zinc-300"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="letter_type" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Jenis Surat <span className="text-rose-500">*</span></Label>
                  <select
                      id="letter_type"
                      required
                      value={formData.letter_type}
                      onChange={(e) => setFormData({ ...formData, letter_type: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                  >
                      <option value="Masuk">Surat Masuk</option>
                      <option value="Keluar">Surat Keluar</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="organization" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Organisasi <span className="text-rose-500">*</span></Label>
                  <select
                      id="organization"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                  >
                      <option value="IPNU">IPNU</option>
                      <option value="IPPNU">IPPNU</option>
                      <option value="BERSAMA">BERSAMA</option>
                      <option value="CBP-KPP">CBP-KPP</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="letter_date" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Tanggal Surat <span className="text-rose-500">*</span></Label>
                  <Input
                      id="letter_date"
                      type="date"
                      required
                      value={formData.letter_date}
                      onChange={(e) => setFormData({ ...formData, letter_date: e.target.value })}
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold"
                  />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="contact_name" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Pengirim/Penerima <span className="text-rose-500">*</span></Label>
                  <Input
                      id="contact_name"
                      required
                      placeholder="Nama pengirim atau penerima"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold placeholder:font-medium placeholder:text-zinc-300"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="subject" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Perihal <span className="text-rose-500">*</span></Label>
                  <Input
                      id="subject"
                      required
                      placeholder="Perihal / singkat isi surat"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold placeholder:font-medium placeholder:text-zinc-300"
                  />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Deskripsi</Label>
                  <textarea
                      id="description"
                      rows={5}
                      placeholder="Deskripsi singkat mengenai surat (opsional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-5 rounded-[1.5rem] border border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all text-sm font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 min-h-[160px] placeholder:font-medium placeholder:text-zinc-300"
                  />
              </div>
              <div className="space-y-4">
                  <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">File Surat</Label>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  
                  <div className="space-y-5">
                      {/* Current File Box */}
                      {formData.file_url && !showUpload && (
                        <div className="p-5 rounded-[1.5rem] border border-zinc-100 bg-white shadow-xs flex items-center justify-between group transition-all hover:border-zinc-200">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-inner group-hover:bg-white transition-colors">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 tracking-tight">File Lampiran (Tersimpan)</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">File saat ini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="ghost" size="icon" onClick={() => window.open(formData.file_url, '_blank')} className="size-9 rounded-xl text-zinc-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"><Eye className="size-5" /></Button>
                                <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, file_url: "" })} className="size-9 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"><X className="size-5" /></Button>
                            </div>
                        </div>
                      )}

                      {(!formData.file_url || showUpload) ? (
                        <div onClick={() => fileInputRef.current?.click()} className="h-[160px] border-2 border-dashed border-zinc-100 rounded-[1.5rem] flex flex-col items-center justify-center text-center p-6 gap-3 bg-zinc-50/20 transition-all hover:bg-zinc-50 cursor-pointer group">
                            <div className="size-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-zinc-500"><span className="text-blue-600">Klik untuk upload</span> atau drag & drop</p>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Maksimal 2MB • PDF / JPG / PNG</p>
                            </div>
                        </div>
                      ) : (
                        <button 
                            type="button" 
                            onClick={() => setShowUpload(true)}
                            className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest px-1 block"
                        >
                            Ganti file
                        </button>
                      )}

                      {/* Embedded Preview (Matched to Image 11/13/15) */}
                      {formData.file_url && (
                        <div className="rounded-[1.5rem] border border-zinc-100 overflow-hidden bg-zinc-50/30 shadow-inner flex flex-col">
                            <div className="px-5 py-3 bg-white border-b border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <FileText className="size-3.5" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Pratinjau PDF</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => window.open(formData.file_url, '_blank')}
                                    className="flex items-center gap-2 text-[9px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                                >
                                    <Maximize2 className="size-3" /> Layar Penuh
                                </button>
                            </div>
                            <div className="w-full min-h-[500px] relative bg-zinc-100/30">
                                {formData.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                    <img src={formData.file_url} className="w-full h-full object-contain p-4" alt="Preview" />
                                ) : formData.file_url.match(/\.pdf$/i) ? (
                                    <iframe src={formData.file_url} className="w-full h-[600px] border-none shadow-inner" />
                                ) : (
                                    <div className="w-full h-full py-20 flex flex-col items-center justify-center text-zinc-300 gap-3">
                                        <FileText className="size-10" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Pratinjau tidak tersedia</p>
                                    </div>
                                )}
                            </div>
                        </div>
                      )}
                  </div>
              </div>
            </div>

            <div className="pt-10 border-t border-zinc-50 grid grid-cols-2 gap-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full bg-zinc-50/50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-2xl h-14 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer justify-center shadow-xs"
                >
                    <X className="size-4" /> Batal
                </Button>
                <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-[0.2em] shadow-md shadow-blue-100 transition-all flex items-center gap-3 cursor-pointer justify-center"
                >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Simpan Perubahan
                </Button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}
