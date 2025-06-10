import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

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

// Product functions
export async function getAllProducts(limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
             array_agg(DISTINCT pf.feature_name) FILTER (WHERE pf.feature_name IS NOT NULL) as features,
             json_object_agg(ps.spec_name, ps.spec_value) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      WHERE p.is_active = true
      GROUP BY p.id, c.id
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
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
             array_agg(DISTINCT pf.feature_name) FILTER (WHERE pf.feature_name IS NOT NULL) as features,
             json_object_agg(ps.spec_name, ps.spec_value) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      WHERE p.slug = ${slug} AND p.is_active = true
      GROUP BY p.id, c.id
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
    console.log("🔍 Database: Getting product by ID:", id)

    const result = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
             array_agg(DISTINCT pf.feature_name) FILTER (WHERE pf.feature_name IS NOT NULL) as features,
             json_object_agg(ps.spec_name, ps.spec_value) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      WHERE p.id = ${id} AND p.is_active = true
      GROUP BY p.id, c.id
      LIMIT 1
    `

    console.log("🔍 Database: Query result length:", result.length)
    if (result.length > 0) {
      console.log("🔍 Database: Found product:", {
        id: result[0].id,
        name: result[0].name,
        price: result[0].price,
      })
    }

    return result[0] || null
  } catch (error) {
    console.error("❌ Database: Error getting product by id:", error)
    throw error
  }
}

export async function getProductsByCategory(categoryId: string, limit = 20, offset = 0) {
  try {
    const result = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
             array_agg(DISTINCT pf.feature_name) FILTER (WHERE pf.feature_name IS NOT NULL) as features,
             json_object_agg(ps.spec_name, ps.spec_value) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      WHERE p.category_id = ${categoryId} AND p.is_active = true
      GROUP BY p.id, c.id
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
      SELECT ci.*, p.name, p.price, p.primary_image as image_url, p.stock, p.nfc_enabled
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
    // Önce sepette var mı kontrol et
    const existing = await sql`
      SELECT * FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}
    `

    if (existing.length > 0) {
      // Varsa miktarı artır
      const result = await sql`
        UPDATE cart_items 
        SET quantity = quantity + ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND product_id = ${productId}
        RETURNING *
      `
      return result[0]
    } else {
      // Yoksa yeni ekle
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
             json_agg(
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
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${userId}
      GROUP BY o.id
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
             json_agg(
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
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId}
      GROUP BY o.id, u.id
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
    let paramIndex = 1

    if (contentData.theme) {
      updates.push(`theme = $${paramIndex}`)
      values.push(contentData.theme)
      paramIndex++
    }

    if (contentData.content) {
      updates.push(`content = $${paramIndex}`)
      values.push(JSON.stringify(contentData.content))
      paramIndex++
    }

    if (updates.length === 0) {
      throw new Error("No updates provided")
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(orderId)

    const query = `
      UPDATE nfc_content 
      SET ${updates.join(", ")}
      WHERE order_id = $${paramIndex}
      RETURNING *
    `

    const result = await sql.unsafe(query, ...values)
    return result[0]
  } catch (error) {
    console.error("Error updating NFC content:", error)
    throw error
  }
}

// Admin specific functions
export async function getAllOrdersForAdmin(filters: {
  limit?: number
  offset?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}) {
  try {
    const { limit = 50, offset = 0, status, search, sortBy = "created_at", sortOrder = "desc" } = filters

    let query = `
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
             json_agg(
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
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `

    const whereConditions = []
    const queryParams = []

    if (status) {
      whereConditions.push(`o.status = $${queryParams.length + 1}`)
      queryParams.push(status)
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

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += `
      GROUP BY o.id, u.id
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    const result = await sql.unsafe(query, ...queryParams)
    return result
  } catch (error) {
    console.error("Error getting all orders for admin:", error)
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

    let query = `
      SELECT u.*, 
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
    `

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

    query += ` WHERE ${whereConditions.join(" AND ")}`

    query += `
      GROUP BY u.id
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

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

    let query = `
      SELECT nc.*, o.order_number, u.first_name, u.last_name, u.email
      FROM nfc_content nc
      JOIN orders o ON nc.order_id = o.id
      JOIN users u ON o.user_id = u.id
    `

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

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += `
      ORDER BY nc.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    const result = await sql.unsafe(query, ...queryParams)
    return result
  } catch (error) {
    console.error("Error getting all NFC content for admin:", error)
    throw error
  }
}
