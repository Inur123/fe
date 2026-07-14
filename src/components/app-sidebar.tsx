"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Command,
  Files,
  LayoutDashboard,
  ShieldCheck,
  Users,
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
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Arsip Surat", url: "/archives", icon: Files },
    { title: "Role & Permission", url: "/roles", icon: ShieldCheck },
    { title: "Periodisasi", url: "/periods", icon: Calendar },
    { title: "Manajemen Pengguna", url: "/users", icon: Users },
  ],
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

  // Baca role dari localStorage SINKRON saat useState pertama kali diinisialisasi.
  // Ini terjadi SEBELUM render pertama di client, sehingga tidak ada flash sama sekali.
  // Di server (SSR), typeof window = 'undefined' → null (suppressHydrationWarning di NavMain menangani mismatch ini).
  const [cachedRole, setCachedRole] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("laci_role");
  });

  // Sinkronisasi cache saat data user dari API tiba (untuk perubahan di sesi berjalan)
  React.useEffect(() => {
    if (user) {
      if (user.role?.name) {
        localStorage.setItem("laci_role", user.role.name);
        document.documentElement.setAttribute("data-role", user.role.name);
      }
      
      const permissions = (user.role?.permissions || []).map((p: any) => p.name);
      localStorage.setItem("laci_perms", JSON.stringify(permissions));
      
      // Update individual data attributes for granular CSS control
      const permMap: Record<string, string> = {
        'get_roles': 'data-perm-roles',
        'get_periods': 'data-perm-periods',
        'get_users': 'data-perm-users',
        'get_archives': 'data-perm-archives'
      };
      
      Object.entries(permMap).forEach(([perm, attr]) => {
        if (permissions.includes(perm) || (user.role?.name === 'Superadmin')) {
          document.documentElement.setAttribute(attr, "true");
        } else {
          document.documentElement.removeAttribute(attr);
        }
      });

      setCachedRole(user.role?.name || "Member");
    }
  }, [user]);

  const currentUser = user || { name: " ", email: " ", avatar: "" };

  // Efektif role: data live (API) diutamakan, fallback ke cache localStorage
  const effectiveRole = user?.role?.name ?? cachedRole;
  const isSuperadmin = effectiveRole === "Superadmin";

  // Kita tidak lagi memfilter item di JS secara agresif untuk disembunyikan total,
  // tapi kita tandai mana yang perlu class khusus untuk CSS.
  const dynamicNavMain = data.navMain.map((item) => {
    let className = "";
    if (item.title === "Role & Permission") className = "laci-menu-roles";
    if (item.title === "Periodisasi") className = "laci-menu-periods";
    if (item.title === "Manajemen Pengguna") className = "laci-menu-users";
    if (item.title === "Arsip Surat") className = "laci-menu-archives";

    return {
      ...item,
      isActive: pathname.startsWith(item.url),
      className,
    };
  });

  return (
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
