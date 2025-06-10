"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus, Check } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  images: string[]
}

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { dispatch } = useCart()

  const handleAddToCart = async () => {
    if (product.stock === 0) return

    setIsAdding(true)

    try {
      // Sepete ekle
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: product })
      }

      toast({
        title: "Sepete Eklendi!",
        description: `${quantity} adet ${product.name} sepetinize eklendi.`,
      })

      // Başarı animasyonu için kısa bir süre bekle
      setTimeout(() => {
        setIsAdding(false)
      }, 1000)
    } catch (error) {
      console.error("Sepete ekleme hatası:", error)
      toast({
        title: "Hata!",
        description: "Ürün sepete eklenirken bir hata oluştu.",
        variant: "destructive",
      })
      setIsAdding(false)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (product.stock === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-medium">Bu ürün şu anda stokta bulunmamaktadır</p>
        </div>
        <Button disabled className="w-full" size="lg">
          Stokta Yok
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stok Bilgisi */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Stok Durumu:</span>
        <span className="text-green-600 font-medium">{product.stock} adet mevcut</span>
      </div>

      {/* Miktar Seçici */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Miktar:</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
            <Minus className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-lg w-12 text-center">{quantity}</span>
          <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= product.stock}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toplam Fiyat */}
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Toplam:</span>
        <span className="text-primary">₺{(product.price * quantity).toLocaleString()}</span>
      </div>

      {/* Sepete Ekle Butonu */}
      <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAdding || product.stock === 0}>
        {isAdding ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Eklendi!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Sepete Ekle
          </>
        )}
      </Button>

      {/* Hızlı Satın Al Butonu */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => {
          handleAddToCart()
          // Sepet sayfasına yönlendir
          setTimeout(() => {
            window.location.href = "/cart"
          }, 1000)
        }}
        disabled={isAdding || product.stock === 0}
      >
        Hızlı Satın Al
      </Button>
    </div>
  )
}
