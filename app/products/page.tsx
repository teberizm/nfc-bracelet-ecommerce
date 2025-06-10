import { getProducts } from "@/lib/products"
import { getCategories } from "@/lib/categories"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
  // Veritabanından ürünleri ve kategorileri çek (fallback ile)
  const products = await getProducts(100, 0)
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tüm Ürünler</h1>
        <p className="text-gray-600">NFC teknolojisi ile donatılmış özel takılarımızı keşfedin.</p>
      </div>

      <ProductsClient products={products} categories={categories} />
    </div>
  )
}
