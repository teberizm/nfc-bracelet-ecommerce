import { getProducts } from "@/lib/products"
import { getAllCategories } from "@/lib/database"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
  // Veritabanından ürünleri ve kategorileri çek
  const products = await getProducts(100, 0) // Daha fazla ürün çek
  const categories = await getAllCategories()

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
