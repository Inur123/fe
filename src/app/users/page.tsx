"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  ShieldAlert,
  UserCheck,
  Search,
  Eye,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { CONFIG } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: null,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("laci_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Ambil profil diri untuk cek izin
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
            (p: any) => p.name === "get_users",
          );
        if (!hasAccess) {
          toast.error("Akses Ditolak");
          router.replace("/dashboard");
          return;
        }
        fetchUsers(token);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const fetchUsers = (token: string) => {
    fetch(`${CONFIG.API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pengguna");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let result = [...users];

    // Filter: Non-Superadmin cannot see Superadmin users
    const isSuperadmin = currentUser?.role?.name === "Superadmin";
    if (!isSuperadmin) {
      result = result.filter((u) => u.role?.name !== "Superadmin");
    }

    // Filter out current user from the list
    if (currentUser?.id) {
      result = result.filter((u) => u.id !== currentUser.id);
    }

    // Search filter
    if (search) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.role?.name || "Anggota")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          u.id.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Sort logic
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any = "";
        let bValue: any = "";

        if (sortConfig.key === "name") {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortConfig.key === "email") {
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
        } else if (sortConfig.key === "role") {
          aValue = (a.role?.name || "Anggota").toLowerCase();
          bValue = (b.role?.name || "Anggota").toLowerCase();
        } else if (sortConfig.key === "status") {
          aValue = "Aktif"; // Saat ini masih statis
          bValue = "Aktif";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, search, sortConfig]);

  // Logic Pagination
  const totalPages = Math.ceil(sortedAndFilteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredUsers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey || !sortConfig.direction) {
      return (
        <ArrowUpDown className="size-3 text-zinc-300 transition-colors group-hover:text-zinc-500" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="size-3 text-zinc-900" />
    ) : (
      <ChevronDown className="size-3 text-zinc-900" />
    );
  };

  const isSuperadmin = currentUser?.role?.name === "Superadmin";

  return (
    <DashboardLayout breadcrumb="Manajemen Pengguna">
      <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Users className="text-zinc-900 size-7" />
              Daftar Akun Pengguna
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Kelola identitas, pantau pendaftaran, dan delegasikan tingkatan
              peran (*role*) secara terpusat.
            </p>
          </div>

          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama, email, atau peran..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl h-11 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all shadow-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset ke hal 1 saat cari
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-semibold bg-zinc-50/30">
                  <th className="py-3.5 px-6 w-16">No</th>
                  <th
                    className="py-3.5 px-6 group cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Pengguna <SortIcon columnKey="name" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-6 group cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Kontak Email <SortIcon columnKey="email" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-6 group cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-2">
                      Tingkatan Peran <SortIcon columnKey="role" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-6 group cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <SortIcon columnKey="status" />
                    </div>
                  </th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 px-4 animate-in fade-in duration-200"
                    >
                      <div className="size-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-2" />
                      <p className="text-xs font-medium text-zinc-500">
                        Memuat data pengguna...
                      </p>
                    </td>
                  </tr>
                ) : sortedAndFilteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 px-4">
                      <ShieldAlert className="size-10 text-zinc-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-sm font-bold text-zinc-700">
                        Tidak ada pengguna ditemukan
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Coba gunakan kata kunci pencarian yang lain.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((u, index) => {
                    const isSelf = currentUser?.id === u.id;
                    const globalIndex = indexOfFirstItem + index + 1;
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-zinc-50/40 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-zinc-400 text-xs">
                          {globalIndex}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 rounded-full border border-zinc-200">
                              <AvatarImage
                                src={u.avatar || ""}
                                alt={u.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="rounded-full bg-zinc-100 text-zinc-800 font-bold text-xs">
                                {getInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] font-extrabold px-1.5 py-0 border-zinc-300 text-zinc-600"
                                  >
                                    Anda
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                ID: {u.id?.split("-")[0]}•••
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-500 font-medium">
                          {u.email}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-zinc-900 text-white font-bold px-3 py-1 rounded-lg">
                            {u.role?.name || "Anggota"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <UserCheck className="size-3" /> Aktif
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/users/${u.id}`)}
                            className="size-9 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer shadow-none"
                          >
                            <Eye className="size-5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="py-6 border-t border-zinc-100 bg-zinc-50/30">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="gap-1 pl-2.5 cursor-pointer disabled:opacity-30"
                    >
                      <PaginationPrevious className="hover:bg-transparent p-0 h-auto" />
                    </Button>
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer rounded-lg size-9 font-bold text-xs ${currentPage === page ? "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-200"}`}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="gap-1 pr-2.5 cursor-pointer disabled:opacity-30"
                    >
                      <PaginationNext className="hover:bg-transparent p-0 h-auto" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
