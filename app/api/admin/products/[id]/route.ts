import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// GET - Fetch a single product with all details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Fetching product with ID: ${params.id}`)

    // Validate product ID
    if (!params.id || params.id.trim() === "") {
      return NextResponse.json({ success: false, message: "Geçersiz ürün ID'si" }, { status: 400 })
    }

    // Fetch product details
    const productResult = await sql`
      SELECT * FROM products WHERE id = ${params.id}
    `

    if (!productResult || productResult.length === 0) {
      console.log(`Product not found with ID: ${params.id}`)
      return NextResponse.json({ success: false, message: "Ürün bulunamadı" }, { status: 404 })
    }

    const product = productResult[0]
    console.log(`Found product: ${product.name}`)

    // Fetch product features
    const featuresResult = await sql`
      SELECT * FROM product_features 
      WHERE product_id = ${params.id}
      ORDER BY sort_order ASC
    `

    // Fetch product specifications
    const specificationsResult = await sql`
      SELECT * FROM product_specifications 
      WHERE product_id = ${params.id}
      ORDER BY sort_order ASC
    `

    // Fetch product images
    const imagesResult = await sql`
      SELECT * FROM product_images 
      WHERE product_id = ${params.id}
      ORDER BY sort_order ASC
    `

    // Combine all data
    const productWithDetails = {
      ...product,
      features: featuresResult || [],
      specifications: specificationsResult || [],
      images: imagesResult || [],
    }

    console.log("Product fetched successfully:", productWithDetails.name)

    // Set cache control headers
    const response = NextResponse.json({ success: true, product: productWithDetails }, { status: 200 })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error fetching product:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Ürün detayı çekilirken hata oluştu",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Updating product with ID: ${params.id}`)

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug || !body.price) {
      return NextResponse.json({ success: false, message: "Ürün adı, slug ve fiyat zorunludur" }, { status: 400 })
    }

    // Update product in database
    await sql`
      UPDATE products
      SET 
        name = ${body.name},
        slug = ${body.slug},
        description = ${body.description || ""},
        short_description = ${body.short_description || ""},
        price = ${body.price},
        original_price = ${body.original_price},
        stock = ${body.stock || 0},
        category_id = ${body.category_id},
        nfc_enabled = ${body.nfc_enabled || false},
        is_active = ${body.is_active || true},
        weight = ${body.weight || ""},
        dimensions = ${body.dimensions || ""},
        material = ${body.material || ""},
        featured = ${body.featured || false},
        meta_title = ${body.meta_title},
        meta_description = ${body.meta_description},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    // Handle features
    if (Array.isArray(body.features)) {
      // Delete existing features
      await sql`DELETE FROM product_features WHERE product_id = ${params.id}`

      // Insert new features
      for (const feature of body.features) {
        if (feature.feature_name && feature.feature_value) {
          await sql`
            INSERT INTO product_features (
              product_id, feature_name, feature_value, sort_order
            ) VALUES (
              ${params.id}, ${feature.feature_name}, ${feature.feature_value}, ${feature.sort_order || 0}
            )
          `
        }
      }
    }

    // Handle specifications
    if (Array.isArray(body.specifications)) {
      // Delete existing specifications
      await sql`DELETE FROM product_specifications WHERE product_id = ${params.id}`

      // Insert new specifications
      for (const spec of body.specifications) {
        if (spec.spec_name && spec.spec_value) {
          await sql`
            INSERT INTO product_specifications (
              product_id, spec_name, spec_value, sort_order
            ) VALUES (
              ${params.id}, ${spec.spec_name}, ${spec.spec_value}, ${spec.sort_order || 0}
            )
          `
        }
      }
    }

    // Handle images
    if (Array.isArray(body.images)) {
      // Delete existing images
      await sql`DELETE FROM product_images WHERE product_id = ${params.id}`

      // Insert new images
      for (const image of body.images) {
        if (image.image_url) {
          await sql`
            INSERT INTO product_images (
              product_id, image_url, alt_text, sort_order, is_primary
            ) VALUES (
              ${params.id}, ${image.image_url}, ${image.alt_text || ""}, ${image.sort_order || 0}, ${image.is_primary || false}
            )
          `
        }
      }
    }

    console.log("Product updated successfully")

    return NextResponse.json({ success: true, message: "Ürün başarıyla güncellendi" }, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { success: false, message: "Ürün güncellenirken hata oluştu", error: String(error) },
      { status: 500 },
    )
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Deleting product with ID: ${params.id}`)

    // Check if product exists
    const productResult = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (!productResult || productResult.length === 0) {
      return NextResponse.json({ success: false, message: "Ürün bulunamadı" }, { status: 404 })
    }

    // Delete related data first
    await sql`DELETE FROM product_features WHERE product_id = ${params.id}`
    await sql`DELETE FROM product_specifications WHERE product_id = ${params.id}`
    await sql`DELETE FROM product_images WHERE product_id = ${params.id}`

    // Delete the product
    await sql`DELETE FROM products WHERE id = ${params.id}`

    console.log("Product deleted successfully")

    return NextResponse.json({ success: true, message: "Ürün başarıyla silindi" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { success: false, message: "Ürün silinirken hata oluştu", error: String(error) },
      { status: 500 },
    )
  }
}
