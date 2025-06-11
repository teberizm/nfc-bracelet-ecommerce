"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Package, ShoppingCart, Zap, Palette, Settings, BarChart3, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAdmin } from "@/contexts/admin-context"

// Dashboard kaldırıldı, İstatistikler en başa alındı
const menuItems = [
  {
    title: "İstatistikler",
    icon: BarChart3,
    href: "/admin",
    exact: true,
  },
  {
    title: "Kullanıcılar",
    icon: Users,
    href: "/admin/users",
    badge: "147",
  },
  {
    title: "Ürünler",
    icon: Package,
    href: "/admin/products",
    badge: "4",
  },
  {
    title: "Siparişler",
    icon: ShoppingCart,
    href: "/admin/orders",
    badge: "12",
  },
  {
    title: "NFC İçerik",
    icon: Zap,
    href: "/admin/nfc-content",
    badge: "45",
  },
  {
    title: "Temalar",
    icon: Palette,
    href: "/admin/themes",
  },
  {
    title: "Ayarlar",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Çıkış Yap",
    icon: LogOut,
    href: "#",
    onClick: "logoutAdmin",
    className: "text-red-600 hover:bg-red-50",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logoutAdmin } = useAdmin()

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">NFC Bileklik</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.onClick ? "#" : item.href}
              onClick={item.onClick ? logoutAdmin : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                item.className,
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
