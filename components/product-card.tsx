import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    primary_image?: string
    category?: string
    category_name?: string
    nfc_enabled?: boolean
    nfcEnabled?: boolean
    stock?: number
    isCustomDesign?: boolean
    originalPrice?: number
    original_price?: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  // Normalize product data
  const normalizedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.primary_image || product.image || "/placeholder.svg?height=300&width=300",
    category: product.category_name || product.category || "Genel",
    nfcEnabled: product.nfc_enabled || product.nfcEnabled || false,
    stock: product.stock || 0,
    isCustomDesign: product.id === "custom-design" || product.isCustomDesign || false,
    originalPrice: product.original_price || product.originalPrice,
  }

  // Calculate discount percentage
  const discountPercentage = normalizedProduct.originalPrice
    ? Math.round(((normalizedProduct.originalPrice - normalizedProduct.price) / normalizedProduct.originalPrice) * 100)
    : 0

  return (
    <Link href={`/product/${normalizedProduct.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={normalizedProduct.image || "/placeholder.svg"}
            alt={normalizedProduct.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=300&width=300"
            }}
          />
          {normalizedProduct.originalPrice && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              %{discountPercentage} İndirim
            </Badge>
          )}
          {normalizedProduct.stock <= 5 && normalizedProduct.stock > 0 && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Son {normalizedProduct.stock} Ürün
            </Badge>
          )}
          {normalizedProduct.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1.5">
                Tükendi
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {normalizedProduct.category}
            </Badge>
            {normalizedProduct.nfcEnabled && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                NFC
              </Badge>
            )}
          </div>
          <h3 className="font-medium mb-2 line-clamp-2 min-h-[2.5rem]">{normalizedProduct.name}</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-primary">₺{normalizedProduct.price.toLocaleString()}</span>
              {normalizedProduct.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₺{normalizedProduct.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {normalizedProduct.isCustomDesign && <Badge className="bg-purple-100 text-purple-800">Özel</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
