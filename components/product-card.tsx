"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Zap, Wand2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  nfcEnabled?: boolean
  isCustomDesign?: boolean
  stock?: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.isCustomDesign) {
      return // Özel tasarım ürünleri sepete eklenemez
    }

    dispatch({ type: "ADD_ITEM", payload: product })
    toast({
      title: "Sepete Eklendi!",
      description: `${product.name} sepetinize eklendi.`,
    })
  }

  // Özel tasarım ürünü için farklı link ve görünüm
  if (product.isCustomDesign) {
    return (
      <Link href="/custom-design">
        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50">
          <div className="aspect-square relative bg-white flex items-center justify-center p-6">
            <Wand2 className="h-24 w-24 text-purple-500" />
            <Badge className="absolute top-2 right-2 bg-purple-600">
              <Wand2 className="h-3 w-3 mr-1" />
              Özel Tasarım
            </Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 text-purple-700">{product.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Wand2 className="h-4 w-4 mr-2" />
              Tasarlamaya Başla
            </Button>
          </CardFooter>
        </Card>
      </Link>
    )
  }

  // Normal ürünler için standart görünüm
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
        <div className="aspect-square relative bg-gray-100">
          <img
            src={product.image || "/placeholder.svg?height=400&width=400&query=bileklik"}
            alt={product.name}
            className="object-cover w-full h-full"
          />
          {product.nfcEnabled && (
            <Badge className="absolute top-2 right-2 bg-blue-600">
              <Zap className="h-3 w-3 mr-1" />
              NFC Özellikli
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="font-bold text-lg">₺{product.price.toLocaleString("tr-TR")}</span>
          <Button size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
