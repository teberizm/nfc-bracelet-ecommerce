-- Test queries to check if tables exist and have data

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'orders', 'products', 'nfc_content', 'nfc_themes');

-- Check users table
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as active_users FROM users WHERE is_active = true;

-- Check orders table
SELECT COUNT(*) as total_orders FROM orders;
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- Check products table
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as active_products FROM products WHERE is_active = true;

-- Check nfc_content table
SELECT COUNT(*) as total_nfc_content FROM nfc_content;

-- Check nfc_themes table
SELECT COUNT(*) as total_themes FROM nfc_themes;
SELECT name, is_active FROM nfc_themes;

-- Test revenue calculation
SELECT 
  COALESCE(SUM(total_amount), 0) as total_revenue,
  COUNT(*) as order_count
FROM orders 
WHERE status != 'cancelled';
