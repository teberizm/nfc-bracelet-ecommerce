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

// Mock kullanıcı verileri (gerçek uygulamada API'den gelecek)
const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "Kullanıcı",
    phone: "+90 555 123 4567",
    address: {
      street: "Atatürk Caddesi No: 123",
      city: "İstanbul",
      state: "İstanbul",
      zipCode: "34000",
      country: "Türkiye",
    },
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// mockOrders array'ini güncelle:
const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "1",
    items: [
      {
        productId: "1",
        productName: "Premium NFC Deri Bileklik",
        price: 299,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
        nfcEnabled: true,
      },
    ],
    total: 299,
    status: "delivered", // delivered olarak değiştir
    createdAt: "2024-01-15T10:30:00Z",
    shippingAddress: {
      street: "Atatürk Caddesi No: 123",
      city: "İstanbul",
      state: "İstanbul",
      zipCode: "34000",
      country: "Türkiye",
    },
    nfcContentUploaded: false, // false olarak değiştir
    themeSelected: false, // false olarak değiştir
  },
  {
    id: "order-2",
    userId: "1",
    items: [
      {
        productId: "2",
        productName: "Spor NFC Silikon Bileklik",
        price: 199,
        quantity: 2,
        image: "/placeholder.svg?height=100&width=100",
        nfcEnabled: true,
      },
    ],
    total: 398,
    status: "delivered", // delivered olarak değiştir
    createdAt: "2024-01-20T14:15:00Z",
    shippingAddress: {
      street: "Atatürk Caddesi No: 123",
      city: "İstanbul",
      state: "İstanbul",
      zipCode: "34000",
      country: "Türkiye",
    },
    nfcContentUploaded: false, // false olarak değiştir
    themeSelected: false, // false olarak değiştir
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    orders: [],
    isLoading: true,
    isAuthenticated: false,
  })

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "LOGIN", payload: user })
        // Kullanıcının siparişlerini yükle
        const userOrders = mockOrders.filter((order) => order.userId === user.id)
        dispatch({ type: "SET_ORDERS", payload: userOrders })
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    dispatch({ type: "SET_LOADING", payload: false })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    // Mock authentication (gerçek uygulamada API çağrısı yapılacak)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "123456") {
      // Demo şifre
      dispatch({ type: "LOGIN", payload: user })
      localStorage.setItem("user", JSON.stringify(user))

      // Kullanıcının siparişlerini yükle
      const userOrders = mockOrders.filter((order) => order.userId === user.id)
      dispatch({ type: "SET_ORDERS", payload: userOrders })

      return true
    }

    dispatch({ type: "SET_LOADING", payload: false })
    return false
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    // Mock registration (gerçek uygulamada API çağrısı yapılacak)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
    }

    // Mock kullanıcı listesine ekle (gerçek uygulamada API'ye gönderilecek)
    mockUsers.push(newUser)

    dispatch({ type: "LOGIN", payload: newUser })
    localStorage.setItem("user", JSON.stringify(newUser))

    return true
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ state, dispatch, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
