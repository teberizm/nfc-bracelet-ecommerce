DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'ORD-2024-%');
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'ORD-2024-%');
DELETE FROM nfc_content WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'ORD-2024-%');
DELETE FROM orders WHERE order_number LIKE 'ORD-2024-%';

INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active) 
VALUES ('testuser@example.com', '$2b$10$example.hash.here', 'Test', 'Kullanıcı', '+90 555 000 0001', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO orders (
    user_id, 
    order_number, 
    status, 
    subtotal, 
    shipping_amount, 
    tax_amount, 
    total_amount, 
    payment_status, 
    payment_method, 
    shipping_address, 
    billing_address, 
    notes, 
    created_at, 
    updated_at
) VALUES 
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-001',
    'pending',
    299.00,
    29.90,
    0.00,
    328.90,
    'pending',
    'credit_card',
    '{"name": "Ahmet Yılmaz", "phone": "+90 555 123 4567", "address": "Atatürk Cad. No:123", "district": "Kadıköy", "city": "İstanbul", "postal_code": "34710"}',
    '{"name": "Ahmet Yılmaz", "phone": "+90 555 123 4567", "address": "Atatürk Cad. No:123", "district": "Kadıköy", "city": "İstanbul", "postal_code": "34710"}',
    'Hızlı teslimat isteniyor',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-002',
    'processing',
    199.00,
    29.90,
    0.00,
    228.90,
    'paid',
    'paytr',
    '{"name": "Fatma Demir", "phone": "+90 532 987 6543", "address": "İnönü Bulvarı No:456", "district": "Çankaya", "city": "Ankara", "postal_code": "06100"}',
    '{"name": "Fatma Demir", "phone": "+90 532 987 6543", "address": "İnönü Bulvarı No:456", "district": "Çankaya", "city": "Ankara", "postal_code": "06100"}',
    'Hediye paketi yapılsın',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '4 hours'
),
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-003',
    'shipped',
    499.00,
    0.00,
    0.00,
    499.00,
    'paid',
    'bank_transfer',
    '{"name": "Mehmet Kaya", "phone": "+90 544 111 2233", "address": "Cumhuriyet Mah. Barış Sok. No:78", "district": "Konak", "city": "İzmir", "postal_code": "35220"}',
    '{"name": "Mehmet Kaya", "phone": "+90 544 111 2233", "address": "Cumhuriyet Mah. Barış Sok. No:78", "district": "Konak", "city": "İzmir", "postal_code": "35220"}',
    'Kargo takip numarası: TK123456789',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-004',
    'delivered',
    299.00,
    29.90,
    0.00,
    328.90,
    'paid',
    'credit_card',
    '{"name": "Ayşe Özkan", "phone": "+90 505 444 5566", "address": "Gazi Mah. Şehit Sok. No:12", "district": "Muratpaşa", "city": "Antalya", "postal_code": "07100"}',
    '{"name": "Ayşe Özkan", "phone": "+90 505 444 5566", "address": "Gazi Mah. Şehit Sok. No:12", "district": "Muratpaşa", "city": "Antalya", "postal_code": "07100"}',
    'Müşteri çok memnun kaldı',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-005',
    'cancelled',
    199.00,
    29.90,
    0.00,
    228.90,
    'refunded',
    'paytr',
    '{"name": "Can Arslan", "phone": "+90 533 777 8899", "address": "Yeni Mah. Doğa Cad. No:34", "district": "Nilüfer", "city": "Bursa", "postal_code": "16110"}',
    '{"name": "Can Arslan", "phone": "+90 533 777 8899", "address": "Yeni Mah. Doğa Cad. No:34", "district": "Nilüfer", "city": "Bursa", "postal_code": "16110"}',
    'Müşteri fikir değiştirdi, iade edildi',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
),
(
    (SELECT id FROM users WHERE email = 'testuser@example.com' LIMIT 1),
    'ORD-2024-006',
    'processing',
    799.00,
    0.00,
    0.00,
    799.00,
    'paid',
    'bank_transfer',
    '{"name": "Zeynep Şahin", "phone": "+90 542 333 4455", "address": "Merkez Mah. Güneş Sok. No:67", "district": "Serdivan", "city": "Sakarya", "postal_code": "54100"}',
    '{"name": "Zeynep Şahin", "phone": "+90 542 333 4455", "address": "Merkez Mah. Güneş Sok. No:67", "district": "Serdivan", "city": "Sakarya", "postal_code": "54100"}',
    'Özel tasarım talebi var',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '2 hours'
);

INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price, nfc_enabled) VALUES 
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 
 (SELECT id FROM products WHERE name LIKE '%Premium%' LIMIT 1), 
 'Premium NFC Deri Bileklik', 
 '/images/premium-leather.jpg', 
 1, 299.00, 299.00, true),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 
 (SELECT id FROM products WHERE name LIKE '%Silikon%' LIMIT 1), 
 'Spor NFC Silikon Bileklik', 
 '/images/sport-silicone.jpg', 
 1, 199.00, 199.00, true),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 
 (SELECT id FROM products WHERE name LIKE '%Metal%' LIMIT 1), 
 'Lüks NFC Metal Bileklik', 
 '/images/luxury-metal.jpg', 
 1, 499.00, 499.00, true),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 
 (SELECT id FROM products WHERE name LIKE '%Premium%' LIMIT 1), 
 'Premium NFC Deri Bileklik', 
 '/images/premium-leather.jpg', 
 1, 299.00, 299.00, true),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 
 (SELECT id FROM products WHERE name LIKE '%Silikon%' LIMIT 1), 
 'Spor NFC Silikon Bileklik', 
 '/images/sport-silicone.jpg', 
 1, 199.00, 199.00, true),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 
 (SELECT id FROM products WHERE name LIKE '%Metal%' LIMIT 1), 
 'Lüks NFC Metal Bileklik', 
 '/images/luxury-metal.jpg', 
 1, 799.00, 799.00, true);

INSERT INTO order_status_history (order_id, status, created_by, created_at) VALUES 
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 'pending', 1, NOW() - INTERVAL '2 hours'),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'pending', 1, NOW() - INTERVAL '1 day'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'processing', 1, NOW() - INTERVAL '4 hours'),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'pending', 1, NOW() - INTERVAL '3 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'processing', 1, NOW() - INTERVAL '2 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'shipped', 1, NOW() - INTERVAL '1 day'),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'pending', 1, NOW() - INTERVAL '1 week'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'processing', 1, NOW() - INTERVAL '5 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'shipped', 1, NOW() - INTERVAL '4 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'delivered', 1, NOW() - INTERVAL '2 days'),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'pending', 1, NOW() - INTERVAL '5 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'cancelled', 1, NOW() - INTERVAL '3 days'),

((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 'pending', 1, NOW() - INTERVAL '6 hours'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 'processing', 1, NOW() - INTERVAL '2 hours');

SELECT 
    o.order_number,
    o.status,
    o.subtotal,
    o.total_amount,
    u.first_name,
    u.last_name,
    COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'ORD-2024-%'
GROUP BY o.id, o.order_number, o.status, o.subtotal, o.total_amount, u.first_name, u.last_name
ORDER BY o.created_at DESC;
