import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
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

    console.log("✅ Ürünler başarıyla listelendi:", result.rows.length, "ürün")

    return NextResponse.json({
      success: true,
      products: result.rows,
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

    // Ürün ID'si oluştur
    const productId = uuidv4()

    // Ana ürün kaydını oluştur
    const productResult = await sql`
      INSERT INTO products (
        id, name, slug, description, short_description, price, original_price,
        stock, category_id, nfc_enabled, is_active, weight, dimensions, material,
        featured, meta_title, meta_description, video_360_url, created_at, updated_at
      ) VALUES (
        ${productId}, ${productData.name}, ${productData.slug}, ${productData.description},
        ${productData.short_description}, ${productData.price}, ${productData.original_price},
        ${productData.stock}, ${productData.category_id || null}, ${productData.nfc_enabled},
        ${productData.is_active}, ${productData.weight}, ${productData.dimensions},
        ${productData.material}, ${productData.featured}, ${productData.meta_title},
        ${productData.meta_description}, ${productData.video_360_url || null},
        NOW(), NOW()
      )
      RETURNING id
    `

    console.log("✅ Ana ürün kaydedildi:", productId)

    // Ürün resimlerini kaydet
    if (productData.images && productData.images.length > 0) {
      console.log("📸 Ürün resimleri kaydediliyor:", productData.images.length, "resim")

      for (let i = 0; i < productData.images.length; i++) {
        const image = productData.images[i]
        const imageId = uuidv4()

        await sql`
          INSERT INTO product_images (
            id, product_id, image_url, alt_text, is_primary, sort_order, created_at
          ) VALUES (
            ${imageId}, ${productId}, ${image.image_url}, ${image.alt_text},
            ${image.is_primary || i === 0}, ${image.sort_order || i}, NOW()
          )
        `
      }

      console.log("✅ Ürün resimleri kaydedildi")
    }

    // Ürün özelliklerini kaydet
    if (productData.features && productData.features.length > 0) {
      console.log("🏷️ Ürün özellikleri kaydediliyor:", productData.features.length, "özellik")

      for (const feature of productData.features) {
        if (feature.feature_name && feature.feature_value) {
          const featureId = uuidv4()

          await sql`
            INSERT INTO product_features (
              id, product_id, feature_name, feature_value, sort_order, created_at
            ) VALUES (
              ${featureId}, ${productId}, ${feature.feature_name}, ${feature.feature_value},
              ${feature.sort_order || 0}, NOW()
            )
          `
        }
      }

      console.log("✅ Ürün özellikleri kaydedildi")
    }

    // Teknik özellikleri kaydet
    if (productData.specifications && productData.specifications.length > 0) {
      console.log("🔧 Teknik özellikler kaydediliyor:", productData.specifications.length, "özellik")

      for (const spec of productData.specifications) {
        if (spec.spec_name && spec.spec_value) {
          const specId = uuidv4()

          await sql`
            INSERT INTO product_specifications (
              id, product_id, spec_name, spec_value, sort_order, created_at
            ) VALUES (
              ${specId}, ${productId}, ${spec.spec_name}, ${spec.spec_value},
              ${spec.sort_order || 0}, NOW()
            )
          `
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
