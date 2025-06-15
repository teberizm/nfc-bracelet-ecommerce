"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ContentProvider } from "@/contexts/content-context"
import { AdminProvider } from "@/contexts/admin-context"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const simpleLayout = pathname.startsWith("/demo") || pathname.startsWith("/nfc")

  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <ContentProvider>
               <LayoutWrapper>{children}</LayoutWrapper>
              </ContentProvider>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
