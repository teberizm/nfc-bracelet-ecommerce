"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AdminProvider, useAdmin } from "@/contexts/admin-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useAdmin()
  const pathname = usePathname()

  // Login sayfasında sidebar ve header gösterme
  if (pathname === "/admin/login") {
    return children
  }

  // Admin giriş yapmamışsa layout gösterme
  if (!state.isAuthenticated) {
    return children
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  )
}
