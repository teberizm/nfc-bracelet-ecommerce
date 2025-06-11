import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

// GET - Tüm ürünleri getir
export async function GET(request: Request) {
  try {
    console.log("Admin products API başladı")

    // Admin token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token bulunamadı")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Geçersiz token")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Token doğrulandı, ürünler çekiliyor...")

    // Users API'si ile aynı pattern kullanarak basit sorgu
    const result = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock,
        p.nfc_enabled,
        p.is_active,
        p.created_at,
        COALESCE(c.name, 'Kategori Yok') as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    console.log("SQL sorgusu tamamlandı, sonuç:", result?.length || 0, "ürün")

    if (!result || !Array.isArray(result)) {
      console.error("SQL sonucu geçersiz:", result)
      return NextResponse.json({
        success: true,
        products: [],
        message: "Veri bulunamadı",
      })
    }

    // Users API'si ile aynı pattern kullanarak veri işleme
    const products = result
      .map((row) => {
        try {
          return {
            id: row.id || "",
            name: row.name || "İsimsiz Ürün",
            slug: row.slug || "",
            price: row.price ? Number.parseFloat(row.price.toString()) : 0,
            stock: row.stock ? Number.parseInt(row.stock.toString()) : 0,
            category_name: row.category_name || "Kategori Yok",
            primary_image: "/placeholder.svg?height=120&width=120&text=" + encodeURIComponent(row.name || "Ürün"),
            is_active: Boolean(row.is_active),
            nfc_enabled: Boolean(row.nfc_enabled),
            created_at: row.created_at || new Date().toISOString(),
          }
        } catch (error) {
          console.error("Ürün işleme hatası:", error)
          return null
        }
      })
      .filter(Boolean) // null değerleri filtrele

    console.log("Ürünler işlendi:", products.length)

    // Users API'si ile aynı response format
    const response = NextResponse.json({
      success: true,
      products: products,
    })

    // Cache kontrolü
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("API Hatası - Detay:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return NextResponse.json(
      {
        success: false,
        message: "Sunucu hatası oluştu",
        error: error.message,
        details: "Veritabanı bağlantısı veya sorgu hatası",
      },
      { status: 500 },
    )
  }
}

// POST - Yeni ürün ekle
export async function POST(request: Request) {
  try {
    console.log("Yeni ürün ekleme API başladı")

    // Admin token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token bulunamadı")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Geçersiz token")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    // Request body'den ürün verilerini al
    const body = await request.json()
    console.log("Ürün verileri alındı:", { name: body.name, slug: body.slug })

    // Zorunlu alanları kontrol et
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, message: "Ürün adı ve slug zorunludur" }, { status: 400 })
    }

    // Slug benzersizliğini kontrol et
    const existingProduct = await sql`SELECT id FROM products WHERE slug = ${body.slug} LIMIT 1`
    if (existingProduct && existingProduct.length > 0) {
      return NextResponse.json({ success: false, message: "Bu slug zaten kullanılıyor" }, { status: 400 })
    }

    // Yeni ürün ID'si oluştur
    const productId = uuidv4()
    console.log("Yeni ürün ID'si:", productId)

    // Ürünü veritabanına ekle
    await sql`
      INSERT INTO products (
        id, name, slug, description, short_description, price, original_price,
        stock, category_id, nfc_enabled, is_active, weight, dimensions, material,
        featured, meta_title, meta_description, video_360_url
      ) VALUES (
        ${productId},
        ${body.name},
        ${body.slug},
        ${body.description || ""},
        ${body.short_description || ""},
        ${body.price || 0},
        ${body.original_price || null},
        ${body.stock || 0},
        ${body.category_id || null},
        ${body.nfc_enabled || false},
        ${body.is_active !== false},
        ${body.weight || ""},
        ${body.dimensions || ""},
        ${body.material || ""},
        ${body.featured || false},
        ${body.meta_title || null},
        ${body.meta_description || null},
        ${body.video_360_url || null}
      )
    `

    console.log("Ürün veritabanına eklendi")

    // Ürün özellikleri varsa ekle
    if (Array.isArray(body.features) && body.features.length > 0) {
      console.log(`${body.features.length} özellik ekleniyor...`)

      for (const feature of body.features) {
        if (feature.feature_name && feature.feature_value) {
          await sql`
            INSERT INTO product_features (
              product_id, feature_name, feature_value, sort_order
            ) VALUES (
              ${productId},
              ${feature.feature_name},
              ${feature.feature_value},
              ${feature.sort_order || 0}
            )
          `
        }
      }
    }

    // Teknik özellikler varsa ekle
    if (Array.isArray(body.specifications) && body.specifications.length > 0) {
      console.log(`${body.specifications.length} teknik özellik ekleniyor...`)

      for (const spec of body.specifications) {
        if (spec.spec_name && spec.spec_value) {
          await sql`
            INSERT INTO product_specifications (
              product_id, spec_name, spec_value, sort_order
            ) VALUES (
              ${productId},
              ${spec.spec_name},
              ${spec.spec_value},
              ${spec.sort_order || 0}
            )
          `
        }
      }
    }

    // Resimler varsa ekle
    if (Array.isArray(body.images) && body.images.length > 0) {
      console.log(`${body.images.length} resim ekleniyor...`)

      for (const image of body.images) {
        if (image.image_url) {
          await sql`
            INSERT INTO product_images (
              product_id, image_url, alt_text, sort_order, is_primary
            ) VALUES (
              ${productId},
              ${image.image_url},
              ${image.alt_text || ""},
              ${image.sort_order || 0},
              ${image.is_primary || false}
            )
          `
        }
      }
    }

    console.log("Ürün başarıyla eklendi:", productId)

    return NextResponse.json({
      success: true,
      message: "Ürün başarıyla eklendi",
      productId: productId,
    })
  } catch (error) {
    console.error("Ürün ekleme hatası:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Ürün eklenirken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
