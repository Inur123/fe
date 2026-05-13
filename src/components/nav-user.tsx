"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, User, Bug } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavUserSkeleton } from "@/components/nav-user-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("laci_token");
    localStorage.removeItem("laci_role");
    localStorage.removeItem("laci_perms");
    toast("Berhasil Keluar", {
      description: "Sesi Anda telah diakhiri dengan aman.",
    });
    router.replace("/login");
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "CN";
    return (
      nameStr
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CN"
    );
  };

  // Navigasi ke halaman profil
  const handleOpenProfile = () => {
    router.push("/profile");
  };

  if (!user?.name || user.name.trim() === "") {
    return <NavUserSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-full border border-zinc-200">
                <AvatarImage
                  src={user.avatar || undefined}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-full bg-zinc-100 text-zinc-800 font-semibold text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-zinc-500">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`min-w-56 rounded-xl bg-white shadow-md border border-zinc-200 z-50 ${isMobile ? "w-[calc(70vw-1.5rem)]" : "w-[--radix-dropdown-menu-trigger-width]"}`}
            side="top"
            align="center"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-full border border-zinc-200">
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-full bg-zinc-100 text-zinc-800 font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-zinc-900">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-zinc-500">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleOpenProfile}
                className="cursor-pointer py-2 text-zinc-700 font-medium"
              >
                <User className="size-4 mr-2" />
                Pengaturan Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 text-zinc-700 font-medium">
                <Bug className="size-4 mr-2" />
                Laporkan Bug
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-100" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer py-2 text-rose-600 focus:text-rose-600 font-semibold"
            >
              <LogOut className="size-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
