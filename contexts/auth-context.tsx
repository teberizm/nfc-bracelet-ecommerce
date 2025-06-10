"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
    nfcEnabled: boolean
  }>
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  nfcContentUploaded?: boolean
  themeSelected?: boolean
}

interface AuthState {
  user: User | null
  orders: Order[]
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<User> }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "SET_LOADING"; payload: boolean }

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  fetchOrders: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
} | null>(null)

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        orders: [],
        isAuthenticated: false,
        isLoading: false,
      }
    case "UPDATE_PROFILE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    case "SET_ORDERS":
      return {
        ...state,
        orders: action.payload,
      }
    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    orders: [],
    isLoading: true,
    isAuthenticated: false,
  })

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken")
      if (token) {
        try {
          // Token ile kullanıcı bilgilerini al
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await response.json()

          if (data.success && data.user) {
            // Kullanıcı bilgilerini state'e kaydet
            dispatch({
              type: "LOGIN",
              payload: {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                phone: data.user.phone,
                createdAt: data.user.created_at,
              },
            })

            // Kullanıcının siparişlerini yükle
            fetchOrders()
          } else {
            // Token geçersiz ise localStorage'dan temizle
            localStorage.removeItem("authToken")
            dispatch({ type: "LOGOUT" })
          }
        } catch (error) {
          console.error("Auth check error:", error)
          localStorage.removeItem("authToken")
          dispatch({ type: "LOGOUT" })
        }
      }

      dispatch({ type: "SET_LOADING", payload: false })
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user && data.token) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem("authToken", data.token)

        // Kullanıcı bilgilerini state'e kaydet
        dispatch({
          type: "LOGIN",
          payload: {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phone: data.user.phone,
            createdAt: data.user.created_at,
          },
        })

        // Kullanıcının siparişlerini yükle
        await fetchOrders()

        return true
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || "",
        }),
      })

      const data = await response.json()

      if (data.success && data.user && data.token) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem("authToken", data.token)

        // Kullanıcı bilgilerini state'e kaydet
        dispatch({
          type: "LOGIN",
          payload: {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phone: data.user.phone,
            createdAt: data.user.created_at,
          },
        })

        return true
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    } catch (error) {
      console.error("Register error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return false
    }
  }

  const fetchOrders = async (): Promise<void> => {
    if (!state.isAuthenticated || !state.user) return

    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success && data.orders) {
        // Siparişleri formatlayarak state'e kaydet
        const formattedOrders = data.orders.map((order: any) => ({
          id: order.id,
          userId: order.user_id,
          total: order.total_amount,
          status: order.status,
          createdAt: order.created_at,
          shippingAddress: order.shipping_address,
          items: order.items.map((item: any) => ({
            productId: item.product_id,
            productName: item.product_name,
            price: item.unit_price,
            quantity: item.quantity,
            image: item.product_image || "",
            nfcEnabled: item.nfc_enabled,
          })),
          nfcContentUploaded: order.nfc_content_uploaded,
          themeSelected: order.theme_selected,
        }))

        dispatch({ type: "SET_ORDERS", payload: formattedOrders })
      }
    } catch (error) {
      console.error("Fetch orders error:", error)
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!state.isAuthenticated || !state.user) return false

    try {
      const token = localStorage.getItem("authToken")
      if (!token) return false

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          address: userData.address,
        }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        // Kullanıcı bilgilerini güncelle
        dispatch({
          type: "UPDATE_PROFILE",
          payload: {
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phone: data.user.phone,
            address: data.user.address,
          },
        })

        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Update profile error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        fetchOrders,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
