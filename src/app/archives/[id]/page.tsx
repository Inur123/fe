"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Trash2,
  Edit,
  Loader2,
  Eye,
  Maximize2,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ArchiveDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [archive, setArchive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setArchive(data.archive);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        router.push("/archives");
      });
  }, [id, router]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("laci_token");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/archives/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus arsip");
      toast.success("Arsip berhasil dihapus");
      router.push("/archives");
    } catch (err: any) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout breadcrumb="Detail Arsip">
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="size-8 text-zinc-300 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumb="Detail Arsip">
      <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
        <div className="w-full space-y-12">
          {/* Header & Global Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/archives")}
                className="rounded-full hover:bg-white shadow-xs border border-zinc-200 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="size-4 text-zinc-600" />
              </Button>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Detail Arsip Surat
                </h1>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                  Informasi dan pratinjau lampiran surat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/archives/edit/${id}`)}
                className="bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-xl h-10 px-5 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Edit className="size-4" /> Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-5 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-100">
                    <Trash2 className="size-4" /> Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-zinc-100 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-zinc-900">
                      Konfirmasi Hapus
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium text-zinc-500 leading-relaxed">
                      Apakah Anda yakin ingin menghapus arsip surat ini? Seluruh data dan lampiran akan hilang secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl h-11 px-6 font-bold text-xs border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-all">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="rounded-xl h-11 px-6 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-100"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="size-4 mr-2" />
                      )}
                      Ya, Hapus Sekarang
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-zinc-100 shadow-xs space-y-12">
            {/* Section: Informasi Utama */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-1 w-10 bg-zinc-900 rounded-full" />
                <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.25em]">
                  Informasi Utama
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 px-2">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Organisasi Terkait</p>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[11px] font-bold border-zinc-200 text-zinc-700 bg-zinc-50/50 px-3 py-1 rounded-lg">
                      {archive?.organization}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    {archive?.letter_type === "Masuk" ? "Pengirim Surat" : "Penerima Surat"}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                    {archive?.contact_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Nomor Surat</p>
                  <p className="text-sm font-bold text-zinc-900 tracking-tight">
                    {archive?.letter_number}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Kategori Arsip</p>
                  <div className="pt-1">
                    <Badge className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-xs ${
                        archive?.letter_type === "Masuk"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                      Surat {archive?.letter_type}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Tanggal Terbit Surat</p>
                  <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Calendar className="size-4 text-zinc-400" />
                    {formatDate(archive?.letter_date)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Perihal / Hal</p>
                  <p className="text-sm font-bold text-zinc-900 leading-relaxed">
                    {archive?.subject}
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Deskripsi */}
            <div className="space-y-6 pt-6 border-t border-zinc-50">
              <div className="flex items-center gap-4">
                <div className="h-1 w-10 bg-zinc-900 rounded-full" />
                <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.25em]">
                  Deskripsi Tambahan
                </h2>
              </div>
              <div className="text-sm font-bold text-zinc-800 leading-relaxed px-2">
                {archive?.description || "Tidak ada deskripsi tambahan untuk arsip ini."}
              </div>
            </div>
          </div>

          {/* Section: Lampiran Digital */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-1 w-10 bg-zinc-900 rounded-full" />
              <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.25em]">
                Lampiran Digital
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xs flex items-center justify-between group transition-all hover:border-zinc-200">
              <div className="flex items-center gap-5">
                <div className="size-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100 shadow-inner group-hover:bg-white transition-colors">
                  <FileText className="size-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-zinc-900">Salinan Digital Surat</p>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                    Format: PDF/Gambar • Keamanan Tinggi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => archive?.file_url && window.open(archive.file_url, "_blank")}
                  className="h-11 px-6 rounded-xl font-bold text-xs flex items-center gap-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all shadow-xs cursor-pointer"
                >
                  <Eye className="size-4" /> Pratinjau
                </Button>
                <Button
                  onClick={() => archive?.file_url && window.open(archive.file_url, "_blank")}
                  className="h-11 px-6 rounded-xl font-bold text-xs flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
                >
                  <Download className="size-4" /> Download
                </Button>
              </div>
            </div>

            {/* Integrated Preview Area (Matched to Image 11/13/15) */}
            <div className="w-full bg-white rounded-[2rem] border border-zinc-100 overflow-hidden min-h-[700px] flex flex-col shadow-xs">
              <div className="px-6 py-4 bg-white border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                      <FileText className="size-4" />
                      <p className="text-[11px] font-bold">Pratinjau PDF</p>
                  </div>
                  <button 
                    onClick={() => archive?.file_url && window.open(archive.file_url, "_blank")}
                    className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:underline"
                  >
                      <Maximize2 className="size-3" /> Layar Penuh
                  </button>
              </div>
              
              <div className="flex-1 bg-zinc-100/30">
                {archive?.file_url ? (
                  archive.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <div className="p-10 flex items-center justify-center min-h-[600px]">
                      <img
                        src={archive.file_url}
                        alt="Lampiran"
                        className="max-w-full h-auto rounded-xl shadow-2xl border border-white"
                      />
                    </div>
                  ) : archive.file_url.match(/\.pdf$/i) ? (
                    <iframe
                      src={archive.file_url}
                      className="w-full h-[1000px] border-none shadow-inner"
                      title="Preview"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center gap-6">
                      <div className="size-24 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
                        <FileText className="size-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-bold text-zinc-700">Pratinjau Tidak Tersedia</p>
                        <p className="text-sm text-zinc-400 font-medium max-w-xs leading-relaxed">
                          Format file ini tidak dapat ditampilkan secara langsung di browser.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-zinc-200 gap-4">
                    <FileText className="size-16" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Lampiran Kosong</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
