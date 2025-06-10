import { getAllCategories as getCategoriesFromDB } from "@/lib/database"

// Fallback kategori verisi
const fallbackCategories = [
  {
    id: "1",
    name: "Deri Bileklik",
    slug: "deri-bileklik",
    description: "Premium deri malzemeden üretilmiş şık bileklikler",
    parent_id: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    name: "Silikon Bileklik",
    slug: "silikon-bileklik",
    description: "Su geçirmez ve dayanıklı silikon bileklikler",
    parent_id: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    name: "Metal Bileklik",
    slug: "metal-bileklik",
    description: "Paslanmaz çelik ve lüks metal bileklikler",
    parent_id: null,
    sort_order: 3,
    is_active: true,
  },
]

export async function getCategories() {
  try {
    console.log("Veritabanından kategoriler çekiliyor...")
    const categories = await getCategoriesFromDB()
    console.log(`✅ ${categories.length} kategori başarıyla çekildi`)
    return categories
  } catch (error) {
    console.error("❌ Veritabanı hatası, fallback veriler kullanılıyor:", error)
    return fallbackCategories
  }
}
