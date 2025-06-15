"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const simpleLayout = pathname.startsWith("/demo") || pathname.startsWith("/nfc")
  return simpleLayout ? (
    <>
      <main>{children}</main>
      <Toaster />
    </>
  ) : (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </>
  )
}