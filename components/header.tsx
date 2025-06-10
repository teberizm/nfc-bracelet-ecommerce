"use client"

import Link from "next/link"
import { ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { state: cartState } = useCart()
  const { state } = useAuth()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">NFC Bileklik</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Ürünler
            </Link>
            <Link
              href="/custom-design"
              className="text-purple-600 hover:text-purple-700 transition-colors font-semibold"
            >
              Kendin Tasarla
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              İletişim
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {state.isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Merhaba, {state.user?.firstName}
                </Link>
                <Button variant="outline" asChild>
                  <Link href="/profile">Profilim</Link>
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
            )}

            <Link href="/cart" className="relative">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-4 w-4" />
                {cartState.itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
