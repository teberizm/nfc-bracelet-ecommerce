// Auth utility functions
export async function login(email: string, password: string): Promise<boolean> {
  // Demo authentication - gerçek uygulamada API çağrısı yapılacak
  if (email === "demo@example.com" && password === "123456") {
    // LocalStorage'a kullanıcı bilgilerini kaydet
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          email: email,
          name: "Demo Kullanıcı",
          isAuthenticated: true,
        }),
      )
    }
    return true
  }
  return false
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  return null
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser()
  return user && user.isAuthenticated === true
}
