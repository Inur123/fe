"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Command,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Role & Permission",
      url: "/roles",
      icon: ShieldCheck,
    },
  ],
  projects: [],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: {
      name: string;
      permissions?: { name: string }[];
    };
  } | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  // Menyalurkan profil pengguna terautentikasi jika ada, atau menggunakan fallback asli
  const currentUser = user || {
    name: " ",
    email: " ",
    avatar: "",
  };

  // Jika user masih bernilai null, berarti aplikasi sedang memuat/memverifikasi profil dari server.
  // Kita terapkan strategi 'Optimistic Default Rendering' agar HTML mentah dari server (SSR) 
  // sudah mencakup menu Role & Permission. Ini menjamin Superadmin mengalami ZERO FLICKER saat refresh!
  const isLoadingSession = user === null;
  const isSuperadmin = user?.role?.name === "Superadmin";
  const isRolesRoute = pathname.startsWith("/roles");

  // Sinkronisasi senyap cache otorisasi ke penyimpanan lokal
  React.useEffect(() => {
    if (user?.role?.name) {
      localStorage.setItem("laci_cached_role", user.role.name);
    }
  }, [user]);

  // Hak akses dipertahankan selama masa muat awal, atau jika profil telah terbukti memiliki wewenang
  const hasRoleAccess =
    isLoadingSession ||
    isSuperadmin ||
    isRolesRoute ||
    (user?.role?.permissions || []).some(
      (p) => p.name === "get_roles" || p.name === "get_roles_list"
    );

  // Filter dinamis: Sembunyikan item Role & Permission jika tidak memiliki hak akses
  const filteredNavMain = data.navMain.filter((item) => {
    if (item.title === "Role & Permission") return hasRoleAccess;
    return true;
  });

  // Pemetaan dinamis status aktif berdasarkan rute peramban saat ini
  const dynamicNavMain = filteredNavMain.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }));

  return (
    // Menggunakan varian inset bawaan asli sidebar-08
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dynamicNavMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-200 pt-3 pb-6 px-2">
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
