import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// Simple admin token verification
function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false
    }

    const token = authHeader.substring(7)
    const expectedToken = process.env.ADMIN_TOKEN || "admin-token-123"
    return token === expectedToken
  } catch (error) {
    console.error("Token verification error:", error)
    return false
  }
}

// GET - Fetch a single product with all details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Admin API: Fetching product with ID: ${params.id}`)

    // Verify admin authentication
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 })
    }

    // Validate product ID
    if (!params.id || params.id.trim() === "") {
      return NextResponse.json({ success: false, message: "Geçersiz ürün ID'si" }, { status: 400 })
    }

    // Fetch product details
    const productResult = await sql`
      SELECT 
        id, name, slug, description, short_description, price, original_price,
        stock, category_id, nfc_enabled, is_active, weight, dimensions, material,
        rating, review_count, sales_count, featured, meta_title, meta_description,
        created_at, updated_at
      FROM products 
      WHERE id = ${params.id}
    `

    if (!productResult || productResult.length === 0) {
      console.log(`Product not found with ID: ${params.id}`)
      return NextResponse.json({ success: false, message: "Ürün bulunamadı" }, { status: 404 })
    }

    const product = productResult[0]
    console.log(`Found product: ${product.name}`)

    // Fetch product features
    let featuresResult = []
    try {
      featuresResult = await sql`
        SELECT id, feature_name, feature_value, sort_order
        FROM product_features 
        WHERE product_id = ${params.id}
        ORDER BY sort_order ASC, id ASC
      `
    } catch (error) {
      console.warn("Error fetching features:", error)
    }

    // Fetch product specifications
    let specificationsResult = []
    try {
      specificationsResult = await sql`
        SELECT id, spec_name, spec_value, sort_order
        FROM product_specifications 
        WHERE product_id = ${params.id}
        ORDER BY sort_order ASC, id ASC
      `
    } catch (error) {
      console.warn("Error fetching specifications:", error)
    }

    // Fetch product images
    let imagesResult = []
    try {
      imagesResult = await sql`
        SELECT id, image_url, alt_text, sort_order, is_primary
        FROM product_images 
        WHERE product_id = ${params.id}
        ORDER BY sort_order ASC, id ASC
      `
    } catch (error) {
      console.warn("Error fetching images:", error)
    }

    // Combine all data
    const productWithDetails = {
      ...product,
      features: featuresResult || [],
      specifications: specificationsResult || [],
      images: imagesResult || [],
    }

    console.log("Product fetched successfully:", productWithDetails.name)

    return NextResponse.json({ success: true, product: productWithDetails }, { status: 200 })
  } catch (error) {
    console.error("Error fetching product:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Ürün detayı çekilirken hata oluştu",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Admin API: Updating product with ID: ${params.id}`)

    // Verify admin authentication
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log("Update data received:", { name: body.name, slug: body.slug, price: body.price })

    // Validate required fields
    if (!body.name || !body.slug || body.price === undefined) {
      return NextResponse.json({ success: false, message: "Ürün adı, slug ve fiyat zorunludur" }, { status: 400 })
    }

    // Validate price
    const price = Number.parseFloat(body.price)
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ success: false, message: "Geçerli bir fiyat giriniz" }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json({ success: false, message: "Ürün bulunamadı" }, { status: 404 })
    }

    // Update product in database
    await sql`
      UPDATE products
      SET 
        name = ${body.name},
        slug = ${body.slug},
        description = ${body.description || ""},
        short_description = ${body.short_description || ""},
        price = ${price.toString()},
        original_price = ${body.original_price ? Number.parseFloat(body.original_price).toString() : null},
        stock = ${Number.parseInt(body.stock) || 0},
        category_id = ${body.category_id || null},
        nfc_enabled = ${body.nfc_enabled || false},
        is_active = ${body.is_active !== false},
        weight = ${body.weight || ""},
        dimensions = ${body.dimensions || ""},
        material = ${body.material || ""},
        featured = ${body.featured || false},
        meta_title = ${body.meta_title || null},
        meta_description = ${body.meta_description || null},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    console.log("Product updated successfully")

    // Handle features
    if (Array.isArray(body.features)) {
      try {
        // Delete existing features
        await sql`DELETE FROM product_features WHERE product_id = ${params.id}`

        // Insert new features
        for (let i = 0; i < body.features.length; i++) {
          const feature = body.features[i]
          if (feature.feature_name && feature.feature_value) {
            await sql`
              INSERT INTO product_features (
                product_id, feature_name, feature_value, sort_order
              ) VALUES (
                ${params.id}, ${feature.feature_name}, ${feature.feature_value}, ${feature.sort_order || i}
              )
            `
          }
        }
        console.log(`Updated ${body.features.length} features`)
      } catch (error) {
        console.error("Error updating features:", error)
      }
    }

    // Handle specifications
    if (Array.isArray(body.specifications)) {
      try {
        // Delete existing specifications
        await sql`DELETE FROM product_specifications WHERE product_id = ${params.id}`

        // Insert new specifications
        for (let i = 0; i < body.specifications.length; i++) {
          const spec = body.specifications[i]
          if (spec.spec_name && spec.spec_value) {
            await sql`
              INSERT INTO product_specifications (
                product_id, spec_name, spec_value, sort_order
              ) VALUES (
                ${params.id}, ${spec.spec_name}, ${spec.spec_value}, ${spec.sort_order || i}
              )
            `
          }
        }
        console.log(`Updated ${body.specifications.length} specifications`)
      } catch (error) {
        console.error("Error updating specifications:", error)
      }
    }

    // Handle images
    if (Array.isArray(body.images)) {
      try {
        // Delete existing images
        await sql`DELETE FROM product_images WHERE product_id = ${params.id}`

        // Insert new images
        for (let i = 0; i < body.images.length; i++) {
          const image = body.images[i]
          if (image.image_url) {
            await sql`
              INSERT INTO product_images (
                product_id, image_url, alt_text, sort_order, is_primary
              ) VALUES (
                ${params.id}, ${image.image_url}, ${image.alt_text || ""}, ${image.sort_order || i}, ${image.is_primary || false}
              )
            `
          }
        }
        console.log(`Updated ${body.images.length} images`)
      } catch (error) {
        console.error("Error updating images:", error)
      }
    }

    console.log("Product update completed successfully")

    return NextResponse.json({ success: true, message: "Ürün başarıyla güncellendi" }, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ürün güncellenirken hata oluştu",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Admin API: Deleting product with ID: ${params.id}`)

    // Verify admin authentication
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 })
    }

    // Check if product exists
    const productResult = await sql`
      SELECT id, name FROM products WHERE id = ${params.id}
    `

    if (!productResult || productResult.length === 0) {
      return NextResponse.json({ success: false, message: "Ürün bulunamadı" }, { status: 404 })
    }

    const productName = productResult[0].name

    // Delete related data first (to maintain referential integrity)
    try {
      await sql`DELETE FROM product_features WHERE product_id = ${params.id}`
      await sql`DELETE FROM product_specifications WHERE product_id = ${params.id}`
      await sql`DELETE FROM product_images WHERE product_id = ${params.id}`

      // Also delete from cart items if exists
      await sql`DELETE FROM cart_items WHERE product_id = ${params.id}`
    } catch (error) {
      console.warn("Error deleting related data:", error)
    }

    // Delete the product
    await sql`DELETE FROM products WHERE id = ${params.id}`

    console.log(`Product "${productName}" deleted successfully`)

    return NextResponse.json({ success: true, message: "Ürün başarıyla silindi" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ürün silinirken hata oluştu",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
