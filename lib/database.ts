import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from "uuid"

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!")
  console.error("Please add DATABASE_URL to your environment variables.")
  throw new Error("DATABASE_URL environment variable is required")
}

console.log("✅ Database connection initialized")

export const sql = neon(process.env.DATABASE_URL)

export function getFreshConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("✅ Database connection test successful")
    return true
  } catch (error) {
    console.error("❌ Database connection test failed:", error)
    return false
  }
}

// User functions
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} AND is_active = true LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id} AND is_active = true LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by id:", error)
    throw error
  }
}
export async function createCustomDesignOrder(orderData: {
  id?: string
  user_id: string
  product_type: string
  material: string
  description: string
  image_url: string
  price?: number | null
}) {
  try {
    const id = orderData.id ?? uuidv4()
    const result = await sql`
      INSERT INTO custom_design_orders (
          id,
        user_id,
        product_type,
        material,
        description,
        image_url,
        price
      )
      VALUES (
         ${id},
        ${orderData.user_id},
        ${orderData.product_type},
        ${orderData.material},
        ${orderData.description},
        ${orderData.image_url},
        ${orderData.price}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating custom design order:", error)
    throw error
  }
}

export async function getCustomDesignOrdersByUserId(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM custom_design_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting custom design orders by user id:", error)
    throw error
  }
}

export async function updateCustomDesignOrder(
  id: string,
  updates: {
    status?: string
    payment_status?: string
    price?: number | null
  },
) {
  try {
    const fields = []
    const values: any[] = []

    if (updates.status) {
      fields.push(`status = $${fields.length + 1}`)
      values.push(updates.status)
    }
    if (updates.payment_status) {
      fields.push(`payment_status = $${fields.length + 1}`)
      values.push(updates.payment_status)
    }
    if (typeof updates.price !== 'undefined') {
      fields.push(`price = $${fields.length + 1}`)
      values.push(updates.price)
    }

    if (fields.length === 0) {
      throw new Error('No updates provided')
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE custom_design_orders
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `

    const result = await sql.unsafe(query, ...values)
    return result[0]
  } catch (error) {
    console.error('Error updating custom design order:', error)
    throw error
  }
}

export async function createUser(userData: {
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string | null
}) {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone)
      VALUES (${userData.email}, ${userData.password_hash}, ${userData.first_name}, ${userData.last_name}, ${userData.phone})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Admin functions
export async function getAdminByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM admins WHERE email = ${email} AND is_active = true LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting admin by email:", error)
    throw error
  }
}

export async function getAdminById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM admins WHERE id = ${id} AND is_active = true LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting admin by id:", error)
    throw error
  }
}

// Product functions with better error handling and image support
export async function getAllProducts(limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT
        p.*,
        (SELECT pi.image_url
           FROM product_images pi
           WHERE pi.product_id = p.id AND pi.is_primary = true
           ORDER BY pi.sort_order
           LIMIT 1) AS primary_image,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'sort_order', pi.sort_order,
              'is_primary', pi.is_primary
             ) ORDER BY pi.sort_order, pi.id)
          FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) AS product_images
      FROM products p
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'sort_order', pi.sort_order,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.id
          ) FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) as product_images
      FROM products p
      WHERE p.slug = ${slug} AND p.is_active = true
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting product by slug:", error)
    throw error
  }
}

export async function getProductById(id: string) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'sort_order', pi.sort_order,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.id
          ) FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) as product_images
      FROM products p
      WHERE p.id = ${id} AND p.is_active = true
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting product by id:", error)
    throw error
  }
}

// Rest of the functions remain the same...
export async function getProductsByCategory(categoryId: string, limit = 20, offset = 0) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'sort_order', pi.sort_order,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.id
          ) FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) as product_images
      FROM products p
      WHERE p.category_id = ${categoryId} AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error getting products by category:", error)
    throw error
  }
}

export async function getProductImages(productId: string) {
  try {
    const result = await sql`
      SELECT * FROM product_images WHERE product_id = ${productId} ORDER BY sort_order
    `
    return result
  } catch (error) {
    console.error("Error getting product images:", error)
    throw error
  }
}

export async function getProductFeatures(productId: string) {
  try {
    const result = await sql`
      SELECT * FROM product_features WHERE product_id = ${productId} ORDER BY sort_order
    `
    return result
  } catch (error) {
    console.error("Error getting product features:", error)
    throw error
  }
}

export async function getProductSpecifications(productId: string) {
  try {
    const result = await sql`
      SELECT * FROM product_specifications WHERE product_id = ${productId} ORDER BY sort_order
    `
    return result
  } catch (error) {
    console.error("Error getting product specifications:", error)
    throw error
  }
}

// Category functions
export async function getAllCategories() {
  try {
    const result = await sql`
      SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name
    `
    return result
  } catch (error) {
    console.error("Error getting all categories:", error)
    throw error
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const result = await sql`
      SELECT * FROM categories WHERE slug = ${slug} AND is_active = true LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting category by slug:", error)
    throw error
  }
}

// Cart functions
export async function getCartItems(userId: string) {
  try {
    const result = await sql`
      SELECT ci.*, p.name, p.price, p.stock, p.nfc_enabled,
             COALESCE(
               (SELECT pi.image_url FROM product_images pi 
                WHERE pi.product_id = p.id AND pi.is_primary = true 
                ORDER BY pi.sort_order LIMIT 1),
               '/placeholder.svg?height=100&width=100&text=No+Image'
             ) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${userId} AND p.is_active = true
      ORDER BY ci.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting cart items:", error)
    throw error
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  try {
    // Check if item already exists in cart
    const existing = await sql`
      SELECT * FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}
    `

    if (existing.length > 0) {
      // Update quantity
      const result = await sql`
        UPDATE cart_items 
        SET quantity = quantity + ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND product_id = ${productId}
        RETURNING *
      `
      return result[0]
    } else {
      // Insert new item
      const result = await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${userId}, ${productId}, ${quantity})
        RETURNING *
      `
      return result[0]
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    throw error
  }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(userId, productId)
    }

    const result = await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating cart item quantity:", error)
    throw error
  }
}

export async function removeFromCart(userId: string, productId: string) {
  try {
    const result = await sql`
      DELETE FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error removing from cart:", error)
    throw error
  }
}

export async function clearCart(userId: string) {
  try {
    const result = await sql`
      DELETE FROM cart_items WHERE user_id = ${userId}
    `
    return result
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}

// Order functions
export async function createOrder(orderData: {
  user_id: string
  order_number: string
  subtotal: number
  total_amount: number
  shipping_address: any
  billing_address?: any
  payment_method: string
}) {
  try {
    const result = await sql`
      INSERT INTO orders (
        user_id, order_number, subtotal, total_amount, 
        shipping_address, billing_address, payment_method, status
      )
      VALUES (
        ${orderData.user_id}, ${orderData.order_number}, ${orderData.subtotal}, 
        ${orderData.total_amount}, ${JSON.stringify(orderData.shipping_address)}, 
        ${JSON.stringify(orderData.billing_address)}, ${orderData.payment_method}, 'pending'
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function createOrderItem(itemData: {
  order_id: string
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
  nfc_enabled: boolean
}) {
  try {
    const result = await sql`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_image,
        quantity, unit_price, total_price, nfc_enabled
      )
      VALUES (
        ${itemData.order_id}, ${itemData.product_id}, ${itemData.product_name}, 
        ${itemData.product_image}, ${itemData.quantity}, ${itemData.unit_price}, 
        ${itemData.total_price}, ${itemData.nfc_enabled}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating order item:", error)
    throw error
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const result = await sql`
      SELECT o.*, 
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'product_name', oi.product_name,
                   'product_image', oi.product_image,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'total_price', oi.total_price,
                   'nfc_enabled', oi.nfc_enabled
                 ) ORDER BY oi.created_at
               ) FROM order_items oi WHERE oi.order_id = o.id),
               '[]'::json
             ) as items
      FROM orders o
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting orders by user id:", error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const result = await sql`
      SELECT o.*, u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
             COALESCE(
               (SELECT json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'product_name', oi.product_name,
                   'product_image', oi.product_image,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'total_price', oi.total_price,
                   'nfc_enabled', oi.nfc_enabled
                 ) ORDER BY oi.created_at
               ) FROM order_items oi WHERE oi.order_id = o.id),
               '[]'::json
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting order by id:", error)
    throw error
  }
}

// NFC Content functions
export async function createNFCContent(contentData: {
  order_id: string
  theme: string
  content: any
}) {
  try {
    const result = await sql`
      INSERT INTO nfc_content (order_id, theme, content)
      VALUES (${contentData.order_id}, ${contentData.theme}, ${JSON.stringify(contentData.content)})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating NFC content:", error)
    throw error
  }
}

export async function getNFCContentByOrderId(orderId: string) {
  try {
    const result = await sql`
      SELECT * FROM nfc_content WHERE order_id = ${orderId} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting NFC content by order id:", error)
    throw error
  }
}

export async function updateNFCContent(
  orderId: string,
  contentData: {
    theme?: string
    content?: any
  },
) {
  try {
    const updates = []
    const values = []

    if (contentData.theme) {
      updates.push("theme = $" + (values.length + 1))
      values.push(contentData.theme)
    }

    if (contentData.content) {
      updates.push("content = $" + (values.length + 1))
      values.push(JSON.stringify(contentData.content))
    }

    if (updates.length === 0) {
      throw new Error("No updates provided")
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    values.push(orderId)

    const query = `
      UPDATE nfc_content 
      SET ${updates.join(", ")}
      WHERE order_id = $${values.length}
      RETURNING *
    `

    const result = await sql.unsafe(query, ...values)
    return result[0]
  } catch (error) {
    console.error("Error updating NFC content:", error)
    throw error
  }
}

// Admin specific functions - FIXED VERSION
export async function getAllOrdersForAdmin(filters: {
  limit?: number
  offset?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}) {
  try {
    console.log("getAllOrdersForAdmin çağrıldı:", filters)

    const { limit = 50, offset = 0, status, search, sortBy = "created_at", sortOrder = "desc" } = filters

    // Basit sorgu ile başlayalım
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.subtotal,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        o.shipping_address,
        o.billing_address,
        o.payment_method,
        u.first_name,
        u.last_name,
        u.email as user_email,
        u.phone as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `

    const conditions = []
    const params = []

    // Status filtresi
    if (status && status !== "") {
      conditions.push(`o.status = $${params.length + 1}`)
      params.push(status)
    }

    // Search filtresi
    if (search && search !== "") {
      conditions.push(`(
        o.order_number ILIKE $${params.length + 1} OR 
        u.first_name ILIKE $${params.length + 1} OR 
        u.last_name ILIKE $${params.length + 1} OR 
        u.email ILIKE $${params.length + 1}
      )`)
      params.push(`%${search}%`)
    }

    // WHERE koşulları ekle
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    // Sıralama ekle
    query += ` ORDER BY o.${sortBy} ${sortOrder}`

    // Limit ve offset ekle
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("SQL Query:", query)
    console.log("Parameters:", params)

    const orders = await sql.unsafe(query, ...params)

    console.log(`${orders.length} sipariş bulundu`)

    // Her sipariş için items'ları ayrı ayrı çek
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        try {
          const items = await sql`
            SELECT 
              id,
              product_id,
              product_name,
              product_image,
              quantity,
              unit_price,
              total_price,
              nfc_enabled
            FROM order_items 
            WHERE order_id = ${order.id}
            ORDER BY created_at
          `

          return {
            ...order,
            items: items || [],
          }
        } catch (error) {
          console.error(`Error getting items for order ${order.id}:`, error)
          return {
            ...order,
            items: [],
          }
        }
      }),
    )

    return ordersWithItems
  } catch (error) {
    console.error("Error in getAllOrdersForAdmin:", error)
    throw error
  }
}

export async function getAllUsersForAdmin(filters: {
  limit?: number
  offset?: number
  search?: string
  sortBy?: string
  sortOrder?: string
}) {
  try {
    const { limit = 50, offset = 0, search, sortBy = "created_at", sortOrder = "desc" } = filters

    const whereConditions = ["u.is_active = true"]
    const queryParams = []

    if (search) {
      whereConditions.push(`(
        u.first_name ILIKE $${queryParams.length + 1} OR 
        u.last_name ILIKE $${queryParams.length + 1} OR 
        u.email ILIKE $${queryParams.length + 1} OR
        u.phone ILIKE $${queryParams.length + 1}
      )`)
      queryParams.push(`%${search}%`)
    }

    queryParams.push(limit, offset)

    const query = `
      SELECT u.*, 
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY u.id
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `

    const result = await sql.unsafe(query, ...queryParams)
    return result
  } catch (error) {
    console.error("Error getting all users for admin:", error)
    throw error
  }
}

export async function getAllNFCContentForAdmin(filters: {
  limit?: number
  offset?: number
  search?: string
  theme?: string
}) {
  try {
    const { limit = 50, offset = 0, search, theme } = filters

    const whereConditions = []
    const queryParams = []

    if (theme) {
      whereConditions.push(`nc.theme = $${queryParams.length + 1}`)
      queryParams.push(theme)
    }

    if (search) {
      whereConditions.push(`(
        o.order_number ILIKE $${queryParams.length + 1} OR 
        u.first_name ILIKE $${queryParams.length + 1} OR 
        u.last_name ILIKE $${queryParams.length + 1} OR 
        u.email ILIKE $${queryParams.length + 1}
      )`)
      queryParams.push(`%${search}%`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    queryParams.push(limit, offset)

    const query = `
      SELECT nc.*, o.order_number, u.first_name, u.last_name, u.email
      FROM nfc_content nc
      JOIN orders o ON nc.order_id = o.id
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY nc.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `

    const result = await sql.unsafe(query, ...queryParams)
    return result
  } catch (error) {
    console.error("Error getting all NFC content for admin:", error)
    throw error
  }
}

// Test bağlantısı için basit bir fonksiyon
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("Database connection test successful:", result)
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
