"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/contexts/admin-context"

export function AdminHeader() {
  const { state } = useAdmin()

  if (!state.admin) return null

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Arama */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Ara..." className="pl-10" />
          </div>
        </div>

        {/* Sağ Taraf */}
        <div className="flex items-center gap-4">
          {/* Bildirimler */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
          </Button>

          {/* Admin Profili */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={state.admin.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{state.admin.name}</p>
              <p className="text-gray-500">{state.admin.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
