"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  nfcEnabled: boolean
  stock: number
}

export interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncCart: () => Promise<void>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState

  switch (action.type) {
    case "LOAD_CART": {
      const items = action.payload
      return {
        ...state,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
      }
    }

    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        newState = {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      } else {
        const newItems = [...state.items, { ...action.payload, quantity: 1 }]
        newState = {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }
      break
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      newState = {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
      break
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
        )
        .filter((item) => item.quantity > 0)

      newState = {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
      break
    }

    case "CLEAR_CART":
      newState = {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      }
      break

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }

  // localStorage'a kaydet
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(newState.items))
  }

  return newState
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: true,
  })

  // Sayfa yüklendiğinde sepeti yükle
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: "SET_LOADING", payload: true })

      // Kullanıcı giriş yapmışsa veritabanından sepeti yükle
      if (authState.isAuthenticated && authState.user) {
        try {
          const token = localStorage.getItem("authToken")
          if (!token) {
            loadLocalCart()
            return
          }

          const response = await fetch("/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await response.json()

          if (data.success && data.items) {
            // Sepet öğelerini formatlayarak state'e kaydet
            const cartItems = data.items.map((item: any) => ({
              id: item.product_id,
              name: item.name,
              price: item.price,
              image: item.image_url || "",
              description: "",
              nfcEnabled: item.nfc_enabled,
              stock: item.stock,
              quantity: item.quantity,
            }))

            dispatch({ type: "LOAD_CART", payload: cartItems })
          } else {
            // Veritabanından sepet yüklenemezse localStorage'dan yükle
            loadLocalCart()
          }
        } catch (error) {
          console.error("Load cart error:", error)
          loadLocalCart()
        }
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'dan sepeti yükle
        loadLocalCart()
      }
    }

    const loadLocalCart = () => {
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart)
            dispatch({ type: "LOAD_CART", payload: parsedCart })
          } catch (error) {
            console.error("Sepet verisi yüklenirken hata:", error)
            dispatch({ type: "SET_LOADING", payload: false })
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false })
        }
      }
    }

    loadCart()
  }, [authState.isAuthenticated, authState.user])

  // Kullanıcı giriş yaptığında veya çıkış yaptığında sepeti senkronize et
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      syncCart()
    }
  }, [authState.isAuthenticated])

  // Sepeti veritabanı ile senkronize et
  const syncCart = async (): Promise<void> => {
    if (!authState.isAuthenticated || !authState.user) return

    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      // Sepeti veritabanına senkronize et
      await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: state.items }),
      })
    } catch (error) {
      console.error("Sync cart error:", error)
    }
  }

  // Sepete ürün ekle
  const addToCart = async (product: Product, quantity = 1): Promise<void> => {
    dispatch({ type: "ADD_ITEM", payload: product })

    if (authState.isAuthenticated && authState.user) {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) return

        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity,
          }),
        })
      } catch (error) {
        console.error("Add to cart error:", error)
      }
    }
  }

  // Sepetten ürün çıkar
  const removeFromCart = async (productId: string): Promise<void> => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })

    if (authState.isAuthenticated && authState.user) {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) return

        await fetch(`/api/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error("Remove from cart error:", error)
      }
    }
  }

  // Ürün miktarını güncelle
  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } })

    if (authState.isAuthenticated && authState.user) {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) return

        if (quantity <= 0) {
          await fetch(`/api/cart/${productId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } else {
          await fetch(`/api/cart/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          })
        }
      } catch (error) {
        console.error("Update quantity error:", error)
      }
    }
  }

  // Sepeti temizle
  const clearCart = async (): Promise<void> => {
    dispatch({ type: "CLEAR_CART" })

    if (authState.isAuthenticated && authState.user) {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) return

        await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error("Clear cart error:", error)
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
