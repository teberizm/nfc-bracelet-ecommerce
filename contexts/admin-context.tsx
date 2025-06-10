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

// Mock admin verisi
const mockAdmins: Admin[] = [
  {
    id: "admin-1",
    email: "admin@nfcbileklik.com",
    name: "Admin User",
    role: "super_admin",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T10:30:00Z",
  },
]

// Mock istatistikler
const mockStats: AdminStats = {
  totalUsers: 147,
  totalOrders: 89,
  totalRevenue: 26750,
  pendingOrders: 12,
  deliveredOrders: 67,
  totalProducts: 4,
  activeNFCContent: 45,
  monthlyGrowth: 15.7,
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    admin: null,
    stats: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin")
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin)
        dispatch({ type: "LOGIN", payload: admin })
        dispatch({ type: "SET_STATS", payload: mockStats })
      } catch (error) {
        console.error("Error parsing saved admin:", error)
        localStorage.removeItem("admin")
      }
    }
    dispatch({ type: "SET_LOADING", payload: false })
  }, [])

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const admin = mockAdmins.find((a) => a.email === email)
    if (admin && password === "admin123") {
      const loggedInAdmin = {
        ...admin,
        lastLogin: new Date().toISOString(),
      }

      dispatch({ type: "LOGIN", payload: loggedInAdmin })
      dispatch({ type: "SET_STATS", payload: mockStats })
      localStorage.setItem("admin", JSON.stringify(loggedInAdmin))
      return true
    }

    dispatch({ type: "SET_LOADING", payload: false })
    return false
  }

  const logoutAdmin = () => {
    dispatch({ type: "LOGOUT" })
    localStorage.removeItem("admin")
  }

  return <AdminContext.Provider value={{ state, dispatch, loginAdmin, logoutAdmin }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
