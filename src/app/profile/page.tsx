"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Camera, 
  Save, 
  Loader2, 
  Mail, 
  Fingerprint, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getCachedUser, setCachedUser } from "@/lib/auth-cache";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const cached = getCachedUser();
  const [user, setUser] = useState<any>(cached);
  const [name, setName] = useState(cached?.name || "");
  const [email, setEmail] = useState(cached?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

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
        setUser(data.user);
        setCachedUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("laci_token");
    setSubmitting(true);

    try {
      let avatarUrl = user.avatar;

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadRes = await fetch(`${CONFIG.API_BASE_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Gagal mengunggah foto");
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      const res = await fetch(`${CONFIG.API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, avatar: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Profil berhasil diperbarui");
      setUser(data.user);
      setCachedUser(data.user);
      setPassword("");
      setSelectedFile(null);
      setPreviewAvatar(null);
      
      window.dispatchEvent(new CustomEvent("laci-user-updated"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    toast.success("ID Pengguna disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (n: string) => {
    if (!n) return "U";
    return n.split(" ").map(i => i[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout breadcrumb="Pengaturan Profil">
        <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            {!user ? (
                <div className="bg-white p-20 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-center">
                    <Loader2 className="size-6 text-zinc-300 animate-spin" />
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Profil Saya</h1>
                        <p className="text-sm text-zinc-500 font-medium">Kelola informasi pribadi dan keamanan akun Anda.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
                        {/* Kolom Kiri: Info Ringkas */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center text-center">
                                <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                                    <Avatar className="size-24 rounded-3xl border-2 border-zinc-100 shadow-sm transition-all group-hover:opacity-80 group-hover:scale-[1.02]">
                                        <AvatarImage src={previewAvatar || user?.avatar || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-zinc-50 text-zinc-400 text-4xl font-bold">
                                            {getInitials(name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity">
                                        <Camera className="text-white size-6" />
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-3xl backdrop-blur-xs">
                                            <Loader2 className="size-6 text-zinc-900 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                <h3 className="text-lg font-bold text-zinc-900">{name}</h3>
                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium mt-1">
                                    <Mail className="size-3" /> {email}
                                </div>
                                <Badge className="mt-4 bg-zinc-900 text-white font-bold px-3 py-1 rounded-lg">
                                    {user?.role?.name || "Anggota"}
                                </Badge>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Metadata Akun</h4>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                                            <Fingerprint className="size-3" /> ID Pengguna
                                        </span>
                                        <div 
                                            onClick={handleCopyId}
                                            className="group relative cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <code className="text-[10px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-zinc-600 block break-all pr-8 group-hover:border-zinc-300 group-hover:bg-white transition-colors">
                                                {user?.id}
                                            </code>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                            </div>
                                        </div>
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

                        {/* Kolom Kanan: Form Update */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-8">
                                <div className="flex items-center gap-2 pb-4 border-b border-zinc-50">
                                    <ShieldCheck className="size-5 text-zinc-900" />
                                    <h3 className="font-bold text-zinc-900">Informasi Identitas</h3>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 ml-1">Nama Lengkap</label>
                                        <Input required placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-zinc-200 h-12 text-sm font-medium focus:ring-zinc-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 ml-1">Alamat Email</label>
                                        <Input required type="email" placeholder="Email Anda" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border-zinc-200 h-12 text-sm font-medium focus:ring-zinc-900" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-zinc-700 ml-1">Ubah Kata Sandi (Kosongkan jika tidak ingin diubah)</label>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="Minimal 6 karakter" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                className="rounded-xl border-zinc-200 h-12 text-sm font-medium focus:ring-zinc-900 pr-12" 
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" disabled={submitting} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 px-8 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
                                        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </>
            )}
          </div>
        </main>
    </DashboardLayout>
  );
}
