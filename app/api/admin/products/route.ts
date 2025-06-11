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

    // Ana ürün kaydını oluştur
    try {
      await sql`
        INSERT INTO products (
          id, name, slug, description, short_description, price, 
          stock, nfc_enabled, is_active
        ) VALUES (
          ${productId}, 
          ${productData.name}, 
          ${slug}, 
          ${productData.description || ""}, 
          ${productData.short_description || ""}, 
          ${Number.parseFloat(productData.price) || 0}, 
          ${Number.parseInt(productData.stock) || 0}, 
          ${Boolean(productData.nfc_enabled)}, 
          true
        )
      `
      console.log("✅ Ana ürün kaydedildi")
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
              ${image.image_url}, 
              ${image.alt_text || productData.name}, 
              ${i === 0}, 
              ${i}
            )
          `
        } catch (error) {
          console.error(`❌ Resim ${i + 1} kaydetme hatası:`, error)
          // Resim hatası olsa bile devam et
        }
      }
      console.log("✅ Ürün resimleri kaydedildi")
    }

    // 360 video varsa kaydet
    if (productData.video_360_url) {
      try {
        await sql`
          UPDATE products 
          SET video_360_url = ${productData.video_360_url}
          WHERE id = ${productId}
        `
        console.log("✅ 360° video kaydedildi")
      } catch (error) {
        console.error("❌ 360° video kaydetme hatası:", error)
        // Video hatası olsa bile devam et
      }
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
