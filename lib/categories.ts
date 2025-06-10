export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
}

export const categories: Category[] = [
  {
    id: "bileklik",
    name: "Bileklik",
    subcategories: [
      { id: "altin", name: "Altın" },
      { id: "gumus", name: "Gümüş" },
      { id: "paslanmaz-celik", name: "Paslanmaz Çelik" },
      { id: "deri", name: "Deri" },
      { id: "silikon", name: "Silikon" },
      { id: "metal", name: "Metal" },
    ],
  },
  {
    id: "kolye",
    name: "Kolye",
    subcategories: [
      { id: "altin", name: "Altın" },
      { id: "gumus", name: "Gümüş" },
      { id: "paslanmaz-celik", name: "Paslanmaz Çelik" },
      { id: "metal", name: "Metal" },
    ],
  },
  {
    id: "yuzuk",
    name: "Yüzük",
    subcategories: [
      { id: "altin", name: "Altın" },
      { id: "gumus", name: "Gümüş" },
      { id: "paslanmaz-celik", name: "Paslanmaz Çelik" },
      { id: "metal", name: "Metal" },
    ],
  },
  {
    id: "kupe",
    name: "Küpe",
    subcategories: [
      { id: "altin", name: "Altın" },
      { id: "gumus", name: "Gümüş" },
      { id: "paslanmaz-celik", name: "Paslanmaz Çelik" },
      { id: "metal", name: "Metal" },
    ],
  },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id)
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  const category = getCategoryById(categoryId)
  return category ? category.subcategories : []
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): Subcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories.find((subcategory) => subcategory.id === subcategoryId)
}
