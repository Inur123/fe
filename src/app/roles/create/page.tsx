"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RoleForm } from "@/components/role-form";

export default function CreateRolePage() {
  return (
    <DashboardLayout breadcrumb="Buat Peran">
        <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto w-full">
            <RoleForm mode="create" />
          </div>
        </main>
    </DashboardLayout>
  );
}
