"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RoleForm } from "@/components/role-form";

export default function EditRolePage() {
  const params = useParams();
  const roleId = params?.id as string;

  return (
    <DashboardLayout breadcrumb="Edit Peran">
        <main className="p-6 md:p-8 w-full animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto w-full">
            <RoleForm mode="edit" roleId={roleId} />
          </div>
        </main>
    </DashboardLayout>
  );
}
