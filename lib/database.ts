import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Veritabanı bağlantısını test et
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("✅ Veritabanı bağlantısı başarılı:", result[0].current_time)
    return true
  } catch (error) {
    console.error("❌ Veritabanı bağlantı hatası:", error)
    return false
  }
}

// Kullanıcı işlemleri
export async function createUser(userData: {
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
}) {
  const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name, phone)
    VALUES (${userData.email}, ${userData.password_hash}, ${userData.first_name}, ${userData.last_name}, ${userData.phone})
    RETURNING id, email, first_name, last_name, phone, created_at
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, first_name, last_name, phone, created_at, is_active
    FROM users 
    WHERE email = ${email} AND is_active = true
    LIMIT 1
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT id, email, first_name, last_name, phone, created_at, is_active
    FROM users 
    WHERE id = ${id} AND is_active = true
    LIMIT 1
  `
  return result[0] || null
}

// Ürün işlemleri
export async function getAllProducts(limit = 50, offset = 0) {
  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           pi.image_url as primary_image,
           COALESCE(p.rating, 0) as rating,
           COALESCE(p.review_count, 0) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
    WHERE p.is_active = true
    ORDER BY p.featured DESC, p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getProductBySlug(slug: string) {
  const result = await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `
  return result[0] || null
}

export async function getProductImages(productId: string) {
  return await sql`
    SELECT image_url, alt_text, sort_order, is_primary
    FROM product_images
    WHERE product_id = ${productId}
    ORDER BY sort_order ASC
  `
}

export async function getProductFeatures(productId: string) {
  return await sql`
    SELECT feature_name, feature_value
    FROM product_features
    WHERE product_id = ${productId}
    ORDER BY sort_order ASC
  `
}

export async function getProductSpecifications(productId: string) {
  return await sql`
    SELECT spec_name, spec_value
    FROM product_specifications
    WHERE product_id = ${productId}
    ORDER BY sort_order ASC
  `
}

// Kategori işlemleri
export async function getAllCategories() {
  return await sql`
    SELECT id, name, slug, description, parent_id, sort_order
    FROM categories
    WHERE is_active = true
    ORDER BY sort_order ASC
  `
}

export async function getCategoryBySlug(slug: string) {
  const result = await sql`
    SELECT id, name, slug, description, parent_id
    FROM categories
    WHERE slug = ${slug} AND is_active = true
    LIMIT 1
  `
  return result[0] || null
}

export async function getProductsByCategory(categoryId: string, limit = 50, offset = 0) {
  return await sql`
    SELECT p.*, pi.image_url as primary_image
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
    WHERE p.category_id = ${categoryId} AND p.is_active = true
    ORDER BY p.featured DESC, p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

// Sipariş işlemleri
export async function createOrder(orderData: {
  user_id: string
  order_number: string
  subtotal: number
  total_amount: number
  shipping_address: object
  billing_address?: object
  payment_method?: string
}) {
  const result = await sql`
    INSERT INTO orders (user_id, order_number, subtotal, total_amount, shipping_address, billing_address, payment_method)
    VALUES (${orderData.user_id}, ${orderData.order_number}, ${orderData.subtotal}, ${orderData.total_amount}, 
            ${JSON.stringify(orderData.shipping_address)}, ${JSON.stringify(orderData.billing_address)}, ${orderData.payment_method})
    RETURNING *
  `
  return result[0]
}

export async function createOrderItem(itemData: {
  order_id: string
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  nfc_enabled: boolean
}) {
  const result = await sql`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price, nfc_enabled)
    VALUES (${itemData.order_id}, ${itemData.product_id}, ${itemData.product_name}, ${itemData.product_image}, 
            ${itemData.quantity}, ${itemData.unit_price}, ${itemData.total_price}, ${itemData.nfc_enabled})
    RETURNING *
  `
  return result[0]
}

export async function getOrdersByUserId(userId: string) {
  return await sql`
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
}

export async function getOrderById(orderId: string) {
  const result = await sql`
    SELECT o.*, u.first_name, u.last_name, u.email as user_email,
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
}

// Admin işlemleri
export async function getAdminByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, name, role, is_active
    FROM admins 
    WHERE email = ${email} AND is_active = true
    LIMIT 1
  `
  return result[0] || null
}

export async function getAllOrders(limit = 50, offset = 0) {
  return await sql`
    SELECT o.*, u.first_name, u.last_name, u.email as user_email,
           json_agg(
             json_build_object(
               'product_name', oi.product_name,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'nfc_enabled', oi.nfc_enabled
             ) ORDER BY oi.created_at
           ) as items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id, u.id
    ORDER BY o.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getAllUsers(limit = 50, offset = 0) {
  return await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
           COUNT(o.id) as order_count,
           COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.is_active = true
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

// Sepet işlemleri
export async function getCartItems(userId: string) {
  return await sql`
    SELECT ci.*, p.name, p.price, p.stock, pi.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
    WHERE ci.user_id = ${userId} AND p.is_active = true
    ORDER BY ci.created_at DESC
  `
}

export async function addToCart(userId: string, productId: string, quantity = 1) {
  const result = await sql`
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (${userId}, ${productId}, ${quantity})
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + ${quantity}, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return await sql`
      DELETE FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `
  } else {
    const result = await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING *
    `
    return result[0]
  }
}

export async function removeFromCart(userId: string, productId: string) {
  return await sql`
    DELETE FROM cart_items 
    WHERE user_id = ${userId} AND product_id = ${productId}
  `
}

export async function clearCart(userId: string) {
  return await sql`
    DELETE FROM cart_items 
    WHERE user_id = ${userId}
  `
}

// NFC işlemleri
export async function getAllThemes() {
  return await sql`
    SELECT id, name, slug, description, preview_image, is_premium, download_count
    FROM nfc_themes
    WHERE is_active = true
    ORDER BY download_count DESC
  `
}

export async function getThemeBySlug(slug: string) {
  const result = await sql`
    SELECT *
    FROM nfc_themes
    WHERE slug = ${slug} AND is_active = true
    LIMIT 1
  `
  return result[0] || null
}

export async function createNFCContent(contentData: {
  order_id: string
  order_item_id?: string
  theme_id?: string
  customizations: object
}) {
  const result = await sql`
    INSERT INTO nfc_content (order_id, order_item_id, theme_id, customizations)
    VALUES (${contentData.order_id}, ${contentData.order_item_id}, ${contentData.theme_id}, ${JSON.stringify(contentData.customizations)})
    RETURNING *
  `
  return result[0]
}

export async function getNFCContentById(id: string) {
  const result = await sql`
    SELECT nc.*, o.order_number, nt.name as theme_name, nt.slug as theme_slug
    FROM nfc_content nc
    LEFT JOIN orders o ON nc.order_id = o.id
    LEFT JOIN nfc_themes nt ON nc.theme_id = nt.id
    WHERE nc.id = ${id}
    LIMIT 1
  `
  return result[0] || null
}

export async function updateNFCContent(id: string, customizations: object) {
  const result = await sql`
    UPDATE nfc_content 
    SET customizations = ${JSON.stringify(customizations)}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}
