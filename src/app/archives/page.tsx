"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  FileText,
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Download,
  Eye,
  ArrowLeftRight,
  Building2,
  Clock,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function ArchivesPage() {
  const router = useRouter();
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filter States
  const [typeFilter, setTypeFilter] = useState("All");
  const [orgFilter, setOrgFilter] = useState("All");

  // Sorting States
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "letter_date", direction: "desc" });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("laci_token");
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/archives/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus arsip");
      setArchives(archives.filter((a) => a.id !== id));
      toast.success("Arsip berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Gerbang Keamanan: Cek Otorisasi Real-time
    fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const isSuperadmin = data.user?.role?.name === "Superadmin";
        const hasAccess =
          isSuperadmin ||
          (data.user?.role?.permissions || []).some(
            (p: any) => p.name === "get_archives",
          );

        if (!hasAccess) {
          toast.error(
            "Akses Ditolak: Anda tidak memiliki izin untuk modul Arsip Surat.",
          );
          router.replace("/dashboard");
          return;
        }

        // Jika lolos, ambil data arsip
        return fetch(`${CONFIG.API_BASE_URL}/archives`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data) {
          setArchives(data.archives || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Gagal melakukan verifikasi keamanan");
        setLoading(false);
      });
  }, [router]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedArchives = useMemo(() => {
    let result = [...archives];

    // Filter by Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.letter_number?.toLowerCase().includes(s) ||
          a.subject?.toLowerCase().includes(s) ||
          a.contact_name?.toLowerCase().includes(s),
      );
    }

    // Filter by Type
    if (typeFilter !== "All") {
      result = result.filter((a) => a.letter_type === typeFilter);
    }

    // Filter by Organization
    if (orgFilter !== "All") {
      result = result.filter((a) => a.organization === orgFilter);
    }

    // Sort
    if (sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [archives, search, typeFilter, orgFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedArchives.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedArchives.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="size-3 ml-1 opacity-20" />;
    if (sortConfig.direction === "asc")
      return <ChevronUp className="size-3 ml-1 text-zinc-900" />;
    return <ChevronDown className="size-3 ml-1 text-zinc-900" />;
  };

  return (
    <DashboardLayout breadcrumb="Arsip Surat">
      <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <FileText className="size-7 text-zinc-900" />
                Arsip Surat
              </h1>
              <p className="text-sm text-zinc-500 font-medium">
                Pencatatan surat masuk dan keluar yang terintegrasi dengan
                periode aktif.
              </p>
            </div>
            <Button
              onClick={() => router.push("/archives/create")}
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-5 h-10 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="size-4" />
              Tambah Arsip
            </Button>
          </div>

          {/* Stats / Quick Info (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Download className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Surat Masuk
                </p>
                <p className="text-lg font-black text-zinc-900">
                  {archives.filter((a) => a.letter_type === "Masuk").length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-4">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ExternalLink className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Surat Keluar
                </p>
                <p className="text-lg font-black text-zinc-900">
                  {archives.filter((a) => a.letter_type === "Keluar").length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-4">
              <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total Arsip
                </p>
                <p className="text-lg font-black text-zinc-900">
                  {archives.length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                placeholder="Cari nomor surat, perihal, atau pengirim..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
              >
                <option value="All">Semua Jenis</option>
                <option value="Masuk">Surat Masuk</option>
                <option value="Keluar">Surat Keluar</option>
              </select>
              <select
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
              >
                <option value="All">Semua Organisasi</option>
                <option value="IPNU">IPNU</option>
                <option value="IPPNU">IPPNU</option>
                <option value="BERSAMA">BERSAMA</option>
                <option value="CBP-KPP">CBP-KPP</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      No
                    </th>
                    <th
                      className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900 transition-colors"
                      onClick={() => handleSort("letter_number")}
                    >
                      <div className="flex items-center">
                        Nomor Surat {getSortIcon("letter_number")}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900 transition-colors"
                      onClick={() => handleSort("subject")}
                    >
                      <div className="flex items-center">
                        Perihal {getSortIcon("subject")}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900 transition-colors"
                      onClick={() => handleSort("organization")}
                    >
                      <div className="flex items-center">
                        Org {getSortIcon("organization")}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900 transition-colors"
                      onClick={() => handleSort("letter_date")}
                    >
                      <div className="flex items-center">
                        Tanggal {getSortIcon("letter_date")}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-8 rounded-full border-2 border-zinc-100 border-t-zinc-900 animate-spin" />
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Memuat Arsip...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                            <Mail className="size-6" />
                          </div>
                          <p className="text-sm font-bold text-zinc-400">
                            Belum ada dokumen arsip yang ditemukan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-zinc-50/50 transition-all"
                      >
                        <td className="py-4 px-6 text-xs font-bold text-zinc-400">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-zinc-900">
                              {item.letter_number}
                            </span>
                            <Badge
                              className={`w-fit text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs ${
                                item.letter_type === "Masuk"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              Surat {item.letter_type}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-sm font-bold text-zinc-800 line-clamp-1">
                            {item.subject}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
                            <ArrowLeftRight className="size-2.5" />{" "}
                            {item.contact_name}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold border-zinc-200 text-zinc-600 bg-white shadow-xs"
                          >
                            {item.organization}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-bold">
                            <Clock className="size-3 text-zinc-400" />
                            {formatDate(item.letter_date)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/archives/${item.id}`)
                              }
                              className="size-8 rounded-lg hover:bg-white hover:shadow-xs text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/archives/edit/${item.id}`)
                              }
                              className="size-8 rounded-lg hover:bg-white hover:shadow-xs text-zinc-400 hover:text-blue-600 transition-all cursor-pointer"
                              title="Edit Arsip"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Apakah Anda yakin ingin menghapus arsip ini?",
                                  )
                                ) {
                                  handleDelete(item.id);
                                }
                              }}
                              className="size-8 rounded-lg hover:bg-white hover:shadow-xs text-zinc-400 hover:text-rose-600 transition-all cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-50 bg-white">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={`cursor-pointer rounded-xl font-bold text-xs ${
                          currentPage === 1
                            ? "opacity-30 pointer-events-none"
                            : ""
                        }`}
                        href="#"
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className={`cursor-pointer rounded-xl font-bold text-xs ${
                                currentPage === page
                                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                  : "hover:bg-zinc-50"
                              }`}
                              href="#"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={`cursor-pointer rounded-xl font-bold text-xs ${
                          currentPage === totalPages
                            ? "opacity-30 pointer-events-none"
                            : ""
                        }`}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
