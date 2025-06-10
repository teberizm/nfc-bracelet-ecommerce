import type { Product } from "@/contexts/cart-context"

export interface DetailedProduct extends Product {
  images: string[]
  features: string[]
  specifications: Record<string, string>
  nfcFeatures?: string[]
  category: string // Ana kategori (Bileklik, Kolye, vb.)
  subcategory: string // Alt kategori (Altın, Gümüş, vb.)
  tags: string[]
  rating: number
  reviewCount: number
  video360?: string // 360° video URL'i
}

export const products: DetailedProduct[] = [
  {
    id: "1",
    name: "Premium NFC Deri Bileklik",
    price: 299,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&text=Yan+Görünüm",
      "/placeholder.svg?height=400&width=400&text=Detay",
      "/placeholder.svg?height=400&width=400&text=Kullanım",
    ],
    video360: "/videos/jewelry-360.mp4", // 360° video eklendi
    description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
    nfcEnabled: true,
    stock: 15,
    category: "Bileklik",
    subcategory: "Deri",
    features: [
      "Gerçek dana derisi",
      "Su geçirmez NFC çip",
      "Ayarlanabilir boyut",
      "Premium metal tokalar",
      "Çizilmeye dayanıklı yüzey",
    ],
    specifications: {
      Malzeme: "Gerçek Dana Derisi",
      "NFC Çip": "NTAG213 (180 byte)",
      "Su Geçirmezlik": "IPX4",
      Boyut: "18-22 cm (ayarlanabilir)",
      Ağırlık: "45g",
      "Renk Seçenekleri": "Siyah, Kahverengi, Lacivert",
    },
    nfcFeatures: [
      "Sınırsız içerik paylaşımı",
      "Fotoğraf, video, ses kayıtları",
      "Kişisel mesajlar",
      "Sosyal medya linkleri",
      "İletişim bilgileri",
    ],
    tags: ["premium", "deri", "nfc", "su-gecirmez"],
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: "2",
    name: "Spor NFC Silikon Bileklik",
    price: 199,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&text=Spor+Kullanım",
      "/placeholder.svg?height=400&width=400&text=Renk+Seçenekleri",
      "/placeholder.svg?height=400&width=400&text=Su+Geçirmez",
    ],
    description: "Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.",
    nfcEnabled: true,
    stock: 8,
    category: "Bileklik",
    subcategory: "Silikon",
    features: [
      "Medikal silikon malzeme",
      "Tamamen su geçirmez",
      "Ter ve kir tutmaz",
      "Esnek ve dayanıklı",
      "Alerjik reaksiyon yapmaz",
    ],
    specifications: {
      Malzeme: "Medikal Silikon",
      "NFC Çip": "NTAG213 (180 byte)",
      "Su Geçirmezlik": "IPX8",
      Boyut: "S, M, L, XL",
      Ağırlık: "28g",
      "Renk Seçenekleri": "Siyah, Mavi, Kırmızı, Yeşil, Beyaz",
    },
    nfcFeatures: [
      "Spor aktiviteleri paylaşımı",
      "Antrenman videoları",
      "Motivasyon mesajları",
      "Sağlık verileri",
      "Acil durum bilgileri",
    ],
    tags: ["spor", "silikon", "nfc", "su-gecirmez", "aktif"],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: "3",
    name: "Lüks NFC Metal Bileklik",
    price: 499,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&text=Lüks+Tasarım",
      "/placeholder.svg?height=400&width=400&text=Metal+Detay",
      "/placeholder.svg?height=400&width=400&text=Özel+Kutu",
    ],
    description: "Paslanmaz çelik ve şık tasarım ile özel günleriniz için.",
    nfcEnabled: true,
    stock: 3,
    category: "Bileklik",
    subcategory: "Metal",
    features: [
      "316L paslanmaz çelik",
      "Altın kaplama seçeneği",
      "Hassas işçilik",
      "Özel hediye kutusu",
      "Ömür boyu garanti",
    ],
    specifications: {
      Malzeme: "316L Paslanmaz Çelik",
      "NFC Çip": "NTAG216 (924 byte)",
      "Su Geçirmezlik": "IPX6",
      Boyut: "19-21 cm (ayarlanabilir)",
      Ağırlık: "85g",
      Kaplama: "Altın, Gümüş, Rose Gold",
    },
    nfcFeatures: [
      "Yüksek kapasiteli veri depolama",
      "4K video paylaşımı",
      "Profesyonel portfolyo",
      "İş kartı bilgileri",
      "Özel etkinlik davetleri",
    ],
    tags: ["lüks", "metal", "nfc", "paslanmaz-çelik", "özel"],
    rating: 4.9,
    reviewCount: 45,
  },
  {
    id: "4",
    name: "Klasik Deri Bileklik",
    price: 149,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&text=Klasik+Stil",
      "/placeholder.svg?height=400&width=400&text=El+Yapımı",
      "/placeholder.svg?height=400&width=400&text=Vintage",
    ],
    description: "Geleneksel deri işçiliği ile zamansız şıklık.",
    nfcEnabled: false,
    stock: 25,
    category: "Bileklik",
    subcategory: "Deri",
    features: [
      "El yapımı deri işçiliği",
      "Vintage görünüm",
      "Doğal yaşlanma",
      "Klasik toka sistemi",
      "Günlük kullanım",
    ],
    specifications: {
      Malzeme: "Doğal Deri",
      "Su Geçirmezlik": "Yok",
      Boyut: "17-23 cm (ayarlanabilir)",
      Ağırlık: "35g",
      "Renk Seçenekleri": "Kahverengi, Siyah, Taba",
    },
    tags: ["klasik", "deri", "el-yapımı", "vintage"],
    rating: 4.4,
    reviewCount: 203,
  },
  {
    id: "5",
    name: "Altın NFC Kolye",
    price: 1299,
    image: "/placeholder.svg?height=400&width=400&text=Altın+NFC+Kolye",
    images: [
      "/placeholder.svg?height=400&width=400&text=Altın+NFC+Kolye",
      "/placeholder.svg?height=400&width=400&text=Kolye+Detay",
      "/placeholder.svg?height=400&width=400&text=Kutu+İçinde",
    ],
    description: "24 ayar altın kaplama ve NFC teknolojisi ile lüks bir hediye.",
    nfcEnabled: true,
    stock: 5,
    category: "Kolye",
    subcategory: "Altın",
    features: ["24 ayar altın kaplama", "Gizli NFC çip", "Ayarlanabilir zincir", "Özel tasarım", "Lüks hediye kutusu"],
    specifications: {
      Malzeme: "24 Ayar Altın Kaplama",
      "NFC Çip": "NTAG216 (924 byte)",
      "Su Geçirmezlik": "IPX4",
      "Zincir Uzunluğu": "45-50 cm (ayarlanabilir)",
      Ağırlık: "18g",
    },
    nfcFeatures: ["Özel mesajlar", "Fotoğraf galerisi", "Aşk şarkıları", "Özel anlar", "Konum paylaşımı"],
    tags: ["altın", "kolye", "nfc", "lüks", "hediye"],
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: "6",
    name: "Gümüş NFC Yüzük",
    price: 599,
    image: "/placeholder.svg?height=400&width=400&text=Gümüş+NFC+Yüzük",
    images: [
      "/placeholder.svg?height=400&width=400&text=Gümüş+NFC+Yüzük",
      "/placeholder.svg?height=400&width=400&text=Yüzük+Detay",
      "/placeholder.svg?height=400&width=400&text=Parmakta",
    ],
    description: "925 ayar gümüş ve NFC teknolojisi ile şık bir aksesuar.",
    nfcEnabled: true,
    stock: 12,
    category: "Yüzük",
    subcategory: "Gümüş",
    features: ["925 ayar gümüş", "Gizli NFC çip", "Ayarlanabilir boyut", "Çizilmeye dayanıklı", "Özel tasarım"],
    specifications: {
      Malzeme: "925 Ayar Gümüş",
      "NFC Çip": "NTAG213 (180 byte)",
      "Su Geçirmezlik": "IPX4",
      Boyut: "16-20 mm (ayarlanabilir)",
      Ağırlık: "8g",
    },
    nfcFeatures: [
      "Kişisel bilgiler",
      "Sosyal medya profilleri",
      "İletişim bilgileri",
      "Web sitesi",
      "Dijital kartvizit",
    ],
    tags: ["gümüş", "yüzük", "nfc", "şık", "aksesuar"],
    rating: 4.7,
    reviewCount: 42,
  },
  {
    id: "7",
    name: "Titanyum NFC Küpe",
    price: 399,
    image: "/placeholder.svg?height=400&width=400&text=Titanyum+NFC+Küpe",
    images: [
      "/placeholder.svg?height=400&width=400&text=Titanyum+NFC+Küpe",
      "/placeholder.svg?height=400&width=400&text=Küpe+Detay",
      "/placeholder.svg?height=400&width=400&text=Kulakta",
    ],
    description: "Titanyum malzeme ve NFC teknolojisi ile modern bir aksesuar.",
    nfcEnabled: true,
    stock: 18,
    category: "Küpe",
    subcategory: "Metal",
    features: ["Titanyum malzeme", "Gizli NFC çip", "Hipoalerjenik", "Hafif tasarım", "Kolay kullanım"],
    specifications: {
      Malzeme: "Titanyum",
      "NFC Çip": "NTAG213 (180 byte)",
      "Su Geçirmezlik": "IPX6",
      Boyut: "12mm",
      Ağırlık: "3g",
    },
    nfcFeatures: ["Müzik paylaşımı", "Spotify playlist", "Ses mesajları", "Konum paylaşımı", "Etkinlik davetleri"],
    tags: ["titanyum", "küpe", "nfc", "modern", "aksesuar"],
    rating: 4.6,
    reviewCount: 35,
  },
]

export function getProductById(id: string): DetailedProduct | undefined {
  return products.find((product) => product.id === id)
}

export function getRelatedProducts(productId: string, category: string, limit = 4): DetailedProduct[] {
  return products.filter((product) => product.id !== productId && product.category === category).slice(0, limit)
}

export function getProductsByCategory(category: string): DetailedProduct[] {
  return products.filter((product) => product.category === category)
}

export function getProductsBySubcategory(category: string, subcategory: string): DetailedProduct[] {
  return products.filter((product) => product.category === category && product.subcategory === subcategory)
}
