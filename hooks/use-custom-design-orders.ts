"use client"

import { useCallback } from "react"
import { toast } from "@/hooks/use-toast"

export interface CustomDesignOrder {
  id: string
  first_name: string
  last_name: string
  user_email: string
  user_phone: string | null
  product_type: string
  material: string
  status: string
  payment_status: string
  price: number | null
  created_at: string
  description?: string
  image_url?: string
}

export function useCustomDesignOrders() {
  const fetchOrders = useCallback(async (): Promise<CustomDesignOrder[]> => {
    try {
      const res = await fetch("/api/admin/custom-design-orders")
      const data = await res.json()
      if (data.success) {
        return data.orders as CustomDesignOrder[]
      } else {
        toast({
          title: "Hata",
          description: data.message || "Siparişler yüklenemedi",
          variant: "destructive",
        })
        throw new Error(data.message || "Siparişler yüklenemedi")
      }
    } catch (err) {
      console.error("Error fetching custom design orders", err)
      toast({
        title: "Hata",
        description: "Siparişler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
      throw err
    }
  }, [])

  const fetchOrder = useCallback(
    async (id: string): Promise<CustomDesignOrder> => {
      try {
        const res = await fetch(`/api/admin/custom-design-orders/${id}`)
        const data = await res.json()
        if (data.success) {
          return data.order as CustomDesignOrder
        } else {
          toast({
            title: "Hata",
            description: data.message || "Sipariş bulunamadı",
            variant: "destructive",
          })
          throw new Error(data.message || "Sipariş bulunamadı")
        }
      } catch (err) {
        console.error("Error fetching custom design order", err)
        toast({
          title: "Hata",
          description: "Sipariş yüklenirken hata oluştu",
          variant: "destructive",
        })
        throw err
      }
    },
    [],
  )

  const updateOrder = useCallback(
    async (
      id: string,
      updates: { status?: string; payment_status?: string; price?: number | null },
    ): Promise<CustomDesignOrder> => {
      try {
        const res = await fetch(`/api/admin/custom-design-orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        const data = await res.json()
        if (data.success) {
          toast({ title: "Başarılı", description: "Sipariş güncellendi" })
          return data.order as CustomDesignOrder
        } else {
          toast({
            title: "Hata",
            description: data.message || "Güncelleme hatası",
            variant: "destructive",
          })
          throw new Error(data.message || "Güncelleme hatası")
        }
      } catch (err) {
        console.error("Error updating custom design order", err)
        toast({
          title: "Hata",
          description: "Güncelleme sırasında sorun oluştu",
          variant: "destructive",
        })
        throw err
      }
    },
    [],
  )

  return { fetchOrders, fetchOrder, updateOrder }
}