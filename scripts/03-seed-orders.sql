-- Örnek siparişler ekle
INSERT INTO orders (
    user_id, 
    order_number, 
    status, 
    total_amount, 
    shipping_amount, 
    tax_amount, 
    payment_status, 
    payment_method,
    shipping_address,
    billing_address,
    notes,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-001',
    'pending',
    498.00,
    29.90,
    89.64,
    'pending',
    'credit_card',
    '{"name": "Ahmet Yılmaz", "phone": "+90 555 123 4567", "address": "Atatürk Cad. No:123", "district": "Kadıköy", "city": "İstanbul", "postal_code": "34710"}',
    '{"name": "Ahmet Yılmaz", "phone": "+90 555 123 4567", "address": "Atatürk Cad. No:123", "district": "Kadıköy", "city": "İstanbul", "postal_code": "34710"}',
    'Hızlı teslimat isteniyor',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-002',
    'processing',
    398.00,
    29.90,
    71.64,
    'paid',
    'bank_transfer',
    '{"name": "Fatma Demir", "phone": "+90 532 987 6543", "address": "İnönü Bulvarı No:456", "district": "Çankaya", "city": "Ankara", "postal_code": "06100"}',
    '{"name": "Fatma Demir", "phone": "+90 532 987 6543", "address": "İnönü Bulvarı No:456", "district": "Çankaya", "city": "Ankara", "postal_code": "06100"}',
    'Hediye paketi yapılsın',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '4 hours'
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-003',
    'shipped',
    797.00,
    0.00,
    143.46,
    'paid',
    'credit_card',
    '{"name": "Mehmet Kaya", "phone": "+90 544 111 2233", "address": "Cumhuriyet Mah. Barış Sok. No:78", "district": "Konak", "city": "İzmir", "postal_code": "35220"}',
    '{"name": "Mehmet Kaya", "phone": "+90 544 111 2233", "address": "Cumhuriyet Mah. Barış Sok. No:78", "district": "Konak", "city": "İzmir", "postal_code": "35220"}',
    'Kargo takip numarası: TK123456789',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-004',
    'delivered',
    199.00,
    29.90,
    35.82,
    'paid',
    'paytr',
    '{"name": "Ayşe Özkan", "phone": "+90 505 444 5566", "address": "Gazi Mah. Şehit Sok. No:12", "district": "Muratpaşa", "city": "Antalya", "postal_code": "07100"}',
    '{"name": "Ayşe Özkan", "phone": "+90 505 444 5566", "address": "Gazi Mah. Şehit Sok. No:12", "district": "Muratpaşa", "city": "Antalya", "postal_code": "07100"}',
    'Müşteri çok memnun kaldı',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-005',
    'cancelled',
    299.00,
    29.90,
    53.82,
    'refunded',
    'credit_card',
    '{"name": "Can Arslan", "phone": "+90 533 777 8899", "address": "Yeni Mah. Doğa Cad. No:34", "district": "Nilüfer", "city": "Bursa", "postal_code": "16110"}',
    '{"name": "Can Arslan", "phone": "+90 533 777 8899", "address": "Yeni Mah. Doğa Cad. No:34", "district": "Nilüfer", "city": "Bursa", "postal_code": "16110"}',
    'Müşteri fikir değiştirdi, iade edildi',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'ORD-2024-006',
    'processing',
    1597.00,
    0.00,
    287.46,
    'paid',
    'bank_transfer',
    '{"name": "Zeynep Şahin", "phone": "+90 542 333 4455", "address": "Merkez Mah. Güneş Sok. No:67", "district": "Serdivan", "city": "Sakarya", "postal_code": "54100"}',
    '{"name": "Zeynep Şahin", "phone": "+90 542 333 4455", "address": "Merkez Mah. Güneş Sok. No:67", "district": "Serdivan", "city": "Sakarya", "postal_code": "54100"}',
    'Özel tasarım talebi var',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '2 hours'
);

-- Sipariş ürünlerini ekle
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES 
-- ORD-2024-001 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), (SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 1, 299.00, 299.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), (SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), 1, 199.00, 199.00),

-- ORD-2024-002 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), (SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 1, 299.00, 299.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), (SELECT id FROM products WHERE slug = 'klasik-deri-bileklik'), 1, 99.00, 99.00),

-- ORD-2024-003 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), (SELECT id FROM products WHERE slug = 'luks-nfc-metal-bileklik'), 1, 499.00, 499.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), (SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 1, 299.00, 299.00),

-- ORD-2024-004 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), 1, 199.00, 199.00),

-- ORD-2024-005 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), (SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 1, 299.00, 299.00),

-- ORD-2024-006 için
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), (SELECT id FROM products WHERE slug = 'altin-nfc-kolye'), 1, 1299.00, 1299.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), (SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 1, 299.00, 299.00);

-- Sipariş durumu geçmişi ekle
INSERT INTO order_status_history (order_id, status, notes, created_by, created_at) VALUES 
-- ORD-2024-001 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '2 hours'),

-- ORD-2024-002 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '1 day'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'processing', 'Ödeme onaylandı, hazırlanıyor', 1, NOW() - INTERVAL '4 hours'),

-- ORD-2024-003 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '3 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'processing', 'Hazırlanıyor', 1, NOW() - INTERVAL '2 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'shipped', 'Kargoya verildi', 1, NOW() - INTERVAL '1 day'),

-- ORD-2024-004 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '1 week'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'processing', 'Hazırlanıyor', 1, NOW() - INTERVAL '5 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'shipped', 'Kargoya verildi', 1, NOW() - INTERVAL '4 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'delivered', 'Teslim edildi', 1, NOW() - INTERVAL '2 days'),

-- ORD-2024-005 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '5 days'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'cancelled', 'Müşteri talebi ile iptal edildi', 1, NOW() - INTERVAL '3 days'),

-- ORD-2024-006 geçmişi
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 'pending', 'Sipariş alındı', 1, NOW() - INTERVAL '6 hours'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 'processing', 'Ödeme onaylandı, özel tasarım hazırlanıyor', 1, NOW() - INTERVAL '2 hours');
