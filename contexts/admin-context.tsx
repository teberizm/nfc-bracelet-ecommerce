"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

export interface Admin {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin" | "moderator"
  createdAt: string
  lastLogin?: string
  avatar?: string
}

export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  deliveredOrders: number
  totalProducts: number
  activeNFCContent: number
  monthlyGrowth: number
}

interface AdminState {
  admin: Admin | null
  stats: AdminStats | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AdminAction =
  | { type: "LOGIN"; payload: Admin }
  | { type: "LOGOUT" }
  | { type: "SET_STATS"; payload: AdminStats }
  | { type: "SET_LOADING"; payload: boolean }

const AdminContext = createContext<{
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  loginAdmin: (email: string, password: string) => Promise<boolean>
  logoutAdmin: () => void
  fetchAdminStats: () => Promise<void>
} | null>(null)

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        admin: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        admin: null,
        stats: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case "SET_STATS":
      return {
        ...state,
        stats: action.payload,
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    admin: null,
    stats: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem("adminToken")
      if (token) {
        try {
          // Token ile admin bilgilerini al
          const response = await fetch("/api/admin/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await response.json()

          if (data.success && data.admin) {
            // Admin bilgilerini state'e kaydet
            dispatch({
              type: "LOGIN",
              payload: {
                id: data.admin.id,
                email: data.admin.email,
                name: data.admin.name,
                role: data.admin.role,
                createdAt: data.admin.created_at,
                lastLogin: data.admin.last_login,
              },
            })

            // Admin istatistiklerini yükle
            fetchAdminStats()
          } else {
            // Token geçersiz ise localStorage'dan temizle
            localStorage.removeItem("adminToken")
            dispatch({ type: "LOGOUT" })
          }
        } catch (error) {
          console.error("Admin auth check error:", error)
          localStorage.removeItem("adminToken")
          dispatch({ type: "LOGOUT" })
        }
      }

      dispatch({ type: "SET_LOADING", payload: false })
    }

    checkAdminAuth()
  }, [])

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.admin && data.token) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem("adminToken", data.token)

        // Admin bilgilerini state'e kaydet
        dispatch({
          type: "LOGIN",
          payload: {
            id: data.admin.id,
            email: data.admin.email,
            name: data.admin.name,
            role: data.admin.role,
            createdAt: data.admin.created_at,
            lastLogin: data.admin.last_login,
          },
        })

        // Admin istatistiklerini yükle
        await fetchAdminStats()

        return true
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    } catch (error) {
      console.error("Admin login error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return false
    }
  }

  const fetchAdminStats = async (): Promise<void> => {
    if (!state.isAuthenticated) return

    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success && data.stats) {
        dispatch({ type: "SET_STATS", payload: data.stats })
      }
    } catch (error) {
      console.error("Fetch admin stats error:", error)
    }
  }

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken")
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AdminContext.Provider
      value={{
        state,
        dispatch,
        loginAdmin,
        logoutAdmin,
        fetchAdminStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
