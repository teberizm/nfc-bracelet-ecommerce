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
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
}) {
  return await sql`
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
    VALUES (${userData.id}, ${userData.email}, ${userData.password_hash}, 
            ${userData.first_name}, ${userData.last_name}, ${userData.phone})
    RETURNING *
  `
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `
  return result[0] || null
}

// Sipariş işlemleri
export async function createOrder(orderData: {
  id: string
  user_id: string
  order_number: string
  subtotal: number
  total_amount: number
  shipping_address: object
  billing_address?: object
}) {
  return await sql`
    INSERT INTO orders (id, user_id, order_number, subtotal, total_amount, 
                       shipping_address, billing_address)
    VALUES (${orderData.id}, ${orderData.user_id}, ${orderData.order_number},
            ${orderData.subtotal}, ${orderData.total_amount}, 
            ${JSON.stringify(orderData.shipping_address)}, 
            ${JSON.stringify(orderData.billing_address)})
    RETURNING *
  `
}

export async function getOrdersByUserId(userId: string) {
  return await sql`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'id', oi.id,
               'product_name', oi.product_name,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price
             )
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ${userId}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
}

// Admin işlemleri
export async function getAdminByEmail(email: string) {
  const result = await sql`
    SELECT * FROM admins WHERE email = ${email} AND is_active = true LIMIT 1
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
               'unit_price', oi.unit_price
             )
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
    SELECT id, email, first_name, last_name, phone, created_at,
           (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
    FROM users
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

// NFC içerik işlemleri
export async function createNFCContent(contentData: {
  id: string
  order_id: string
  theme_id?: string
  customizations: object
}) {
  return await sql`
    INSERT INTO nfc_content (id, order_id, theme_id, customizations)
    VALUES (${contentData.id}, ${contentData.order_id}, ${contentData.theme_id}, 
            ${JSON.stringify(contentData.customizations)})
    RETURNING *
  `
}

export async function getNFCContentById(id: string) {
  const result = await sql`
    SELECT nc.*, o.order_number, nt.name as theme_name
    FROM nfc_content nc
    LEFT JOIN orders o ON nc.order_id = o.id
    LEFT JOIN nfc_themes nt ON nc.theme_id = nt.id
    WHERE nc.id = ${id}
    LIMIT 1
  `
  return result[0] || null
}

export async function updateNFCContent(id: string, customizations: object) {
  return await sql`
    UPDATE nfc_content 
    SET customizations = ${JSON.stringify(customizations)}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
}
