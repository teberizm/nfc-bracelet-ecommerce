"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, state } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/profile"

  // Eğer kullanıcı zaten giriş yapmışsa redirect et
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      router.push(redirectTo)
    }
  }, [state.isAuthenticated, state.isLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.")
      return
    }

    const success = await login(email, password)
    if (success) {
      toast({
        title: "Giriş Başarılı!",
        description: "Hoş geldiniz! Yönlendiriliyorsunuz...",
      })

      // Kısa bir gecikme ile redirect
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } else {
      setError("E-posta veya şifre hatalı. Demo için: demo@example.com / 123456")
    }
  }

  // Eğer kullanıcı zaten giriş yapmışsa loading göster
  if (state.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
            <CardDescription>Hesabınıza giriş yapın ve siparişlerinizi yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={state.isLoading}>
                {state.isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Şifremi unuttum
              </Link>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    Kayıt olun
                  </Link>
                </p>
              </div>

              {/* Demo Bilgileri */}
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <p className="text-sm font-medium text-blue-800 mb-2">Demo Hesap Bilgileri:</p>
                <p className="text-sm text-blue-700">E-posta: demo@example.com</p>
                <p className="text-sm text-blue-700">Şifre: 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
