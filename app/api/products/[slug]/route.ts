import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    console.log(`API: Ürün detayı isteniyor (slug: ${slug})`)

    // Önce ID ile dene
    let product
    try {
      const productById = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ${slug}
      `

      if (productById.length > 0) {
        product = productById[0]
      }
    } catch (error) {
      console.log("ID ile arama başarısız, slug ile deneniyor...")
    }

    // ID ile bulunamazsa slug ile dene
    if (!product) {
      try {
        const productBySlug = await sql`
          SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.slug = ${slug}
        `

        if (productBySlug.length > 0) {
          product = productBySlug[0]
        }
      } catch (error) {
        console.log("Slug ile arama da başarısız...")
      }
    }

    if (!product) {
      console.log(`Ürün bulunamadı: ${slug}`)
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
    }

    console.log(`Ürün bulundu: ${product.name}`)

    // Ürün verisini normalize et
    const normalizedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number.parseFloat(product.price),
      original_price: product.original_price ? Number.parseFloat(product.original_price) : null,
      primary_image: product.primary_image || "/placeholder.svg?height=600&width=600",
      images: product.images,
      category_id: product.category_id,
      category_name: product.category_name || "Genel",
      category_slug: product.category_slug,
      nfc_enabled: Boolean(product.nfc_enabled),
      stock: Number.parseInt(product.stock) || 0,
      featured: Boolean(product.featured),
      rating: Number.parseFloat(product.rating) || 4.5,
      review_count: Number.parseInt(product.review_count) || 0,
      features: product.features,
      specifications: product.specifications,
      nfc_features: product.nfc_features,
      video_360: product.video_360,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }

    return NextResponse.json(normalizedProduct)
  } catch (error) {
    console.error("Ürün detayı API hatası:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
