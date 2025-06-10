import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"

// Demo ürünler
const products = [
  {
    id: "1",
    name: "NFC Bileklik Premium",
    description: "Yüksek kaliteli NFC özellikli bileklik",
    price: 299.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 10,
  },
  {
    id: "2",
    name: "NFC Kolye",
    description: "Şık tasarımlı NFC özellikli kolye",
    price: 349.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 8,
  },
  {
    id: "3",
    name: "NFC Yüzük",
    description: "Modern tasarımlı NFC özellikli yüzük",
    price: 399.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 5,
  },
  {
    id: "4",
    name: "Özel Tasarım NFC Takı",
    description: "Kişiselleştirilmiş NFC takı seçenekleri",
    price: 499.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 0,
    isCustomDesign: true,
  },
  {
    id: "5",
    name: "NFC Bileklik Classic",
    description: "Klasik tasarımlı NFC bileklik",
    price: 199.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 15,
  },
  {
    id: "6",
    name: "NFC Kolye Deluxe",
    description: "Premium NFC özellikli kolye",
    price: 449.99,
    image: "/placeholder.svg?height=400&width=400",
    nfcEnabled: true,
    stock: 6,
  },
]

const categories = ["Tümü", "Bileklikler", "Kolyeler", "Yüzükler", "Özel Tasarım"]

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Ürünlerimiz</h1>
        <p className="text-gray-600">NFC teknolojisi ile donatılmış özel tasarım takılarımızı keşfedin</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Ürün ara..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Daha Fazla Yükle
        </Button>
      </div>
    </div>
  )
}
