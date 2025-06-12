import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("📦 Ürünler listeleniyor...")

    const result = await sql`
      SELECT 
        p.*,
        pi.image_url as primary_image,
        COALESCE(pi_count.image_count, 0) as image_count
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN (
        SELECT product_id, COUNT(*) as image_count
        FROM product_images
        GROUP BY product_id
      ) pi_count ON p.id = pi_count.product_id
      ORDER BY p.created_at DESC
    `

    console.log("✅ Ürünler başarıyla listelendi:", result.length, "ürün")

    return NextResponse.json({
      success: true,
      products: result,
    })
  } catch (error) {
    console.error("❌ Ürün listeleme hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ürünler yüklenirken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("💾 Yeni ürün kaydediliyor...")

    const productData = await request.json()
    console.log("📦 Ürün verisi alındı:", productData.name)
    console.log("🎥 360° Video URL:", productData.video_360_url || "Yok")

    // Gelen verileri logla
    console.log("📊 Kategori ID:", productData.category_id, "Tipi:", typeof productData.category_id)

    // Zorunlu alanları kontrol et
    if (!productData.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Ürün adı zorunludur",
        },
        { status: 400 },
      )
    }

    // Slug oluştur veya kontrol et
    let slug = productData.slug
    if (!slug) {
      slug = productData.name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    }

    // Ürün ID'si oluştur
    const productId = uuidv4()
    console.log("🆔 Ürün ID:", productId)

    // Kategori ID'sini NULL olarak ayarla eğer geçersizse
    let categoryId = null
    if (productData.category_id) {
      // Eğer kategori ID'si sayı ise NULL olarak ayarla
      if (!isNaN(Number(productData.category_id))) {
        console.log("⚠️ Kategori ID sayı formatında, NULL olarak ayarlanıyor")
        categoryId = null
      } else {
        categoryId = productData.category_id
      }
    }

    // Ana ürün kaydını oluştur - 360 VIDEO DAHİL
    try {
      await sql`
        INSERT INTO products (
          id, name, slug, description, short_description, price, 
          original_price, stock, category_id, nfc_enabled, is_active, 
          weight, dimensions, material, featured, meta_title, meta_description,
          video_360_url
        ) VALUES (
          ${productId}, 
          ${productData.name}, 
          ${slug}, 
          ${productData.description || ""}, 
          ${productData.short_description || ""}, 
          ${Number.parseFloat(productData.price) || 0}, 
          ${productData.original_price ? Number.parseFloat(productData.original_price) : null},
          ${Number.parseInt(productData.stock) || 0}, 
          ${categoryId},
          ${Boolean(productData.nfc_enabled)}, 
          ${Boolean(productData.is_active)},
          ${productData.weight || ""},
          ${productData.dimensions || ""},
          ${productData.material || ""},
          ${Boolean(productData.featured)},
          ${productData.meta_title || ""},
          ${productData.meta_description || ""},
          ${productData.video_360_url || null}
        )
      `
      console.log("✅ Ana ürün kaydedildi (360° video dahil)")
    } catch (error) {
      console.error("❌ Ana ürün kaydetme hatası:", error)
      throw new Error("Ürün kaydedilemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata"))
    }

    // Ürün resimlerini kaydet
    if (Array.isArray(productData.images) && productData.images.length > 0) {
      console.log("📸 Ürün resimleri kaydediliyor:", productData.images.length, "resim")

      for (let i = 0; i < productData.images.length; i++) {
        const image = productData.images[i]
        try {
          await sql`
            INSERT INTO product_images (
              product_id, image_url, alt_text, is_primary, sort_order
            ) VALUES (
              ${productId}, 
              ${image.image_url || image.url}, 
              ${image.alt_text || productData.name}, 
              ${Boolean(image.is_primary)}, 
              ${i}
            )
          `
          console.log(`✅ Resim ${i + 1} kaydedildi:`, image.image_url?.substring(0, 50) + "...")
        } catch (error) {
          console.error(`❌ Resim ${i + 1} kaydetme hatası:`, error)
          // Resim hatası olsa bile devam et
        }
      }
      console.log("✅ Tüm ürün resimleri kaydedildi")
    }

    // Ürün özelliklerini kaydet
    if (Array.isArray(productData.features) && productData.features.length > 0) {
      console.log("🔧 Ürün özellikleri kaydediliyor:", productData.features.length, "özellik")

      for (let i = 0; i < productData.features.length; i++) {
        const feature = productData.features[i]
        if (feature.feature_name && feature.feature_value) {
          try {
            await sql`
              INSERT INTO product_features (
                product_id, feature_name, feature_value, sort_order
              ) VALUES (
                ${productId}, 
                ${feature.feature_name}, 
                ${feature.feature_value}, 
                ${feature.sort_order || i}
              )
            `
          } catch (error) {
            console.error(`❌ Özellik ${i + 1} kaydetme hatası:`, error)
          }
        }
      }
      console.log("✅ Ürün özellikleri kaydedildi")
    }

    // Teknik özellikleri kaydet
    if (Array.isArray(productData.specifications) && productData.specifications.length > 0) {
      console.log("⚙️ Teknik özellikler kaydediliyor:", productData.specifications.length, "özellik")

      for (let i = 0; i < productData.specifications.length; i++) {
        const spec = productData.specifications[i]
        if (spec.spec_name && spec.spec_value) {
          try {
            await sql`
              INSERT INTO product_specifications (
                product_id, spec_name, spec_value, sort_order
              ) VALUES (
                ${productId}, 
                ${spec.spec_name}, 
                ${spec.spec_value}, 
                ${spec.sort_order || i}
              )
            `
          } catch (error) {
            console.error(`❌ Teknik özellik ${i + 1} kaydetme hatası:`, error)
          }
        }
      }
      console.log("✅ Teknik özellikler kaydedildi")
    }

    console.log("🎉 Ürün başarıyla kaydedildi:", productId)

    return NextResponse.json({
      success: true,
      message: "Ürün başarıyla kaydedildi",
      productId: productId,
    })
  } catch (error) {
    console.error("❌ Ürün kaydetme hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ürün kaydedilirken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
