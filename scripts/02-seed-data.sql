-- Admin kullanıcısı ekle
INSERT INTO admins (email, password_hash, name, role) VALUES 
('admin@nfcbileklik.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/5PI/PG', 'Admin Kullanıcı', 'super_admin');

-- Kategoriler ekle
INSERT INTO categories (name, slug, description, sort_order) VALUES 
('Bileklik', 'bileklik', 'NFC özellikli ve klasik bileklikler', 1),
('Kolye', 'kolye', 'Şık ve modern kolyeler', 2),
('Yüzük', 'yuzuk', 'Özel tasarım yüzükler', 3),
('Küpe', 'kupe', 'Zarif küpe modelleri', 4);

-- Alt kategoriler ekle
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES 
('Deri', 'deri', 'Gerçek deri bileklikler', (SELECT id FROM categories WHERE slug = 'bileklik'), 1),
('Metal', 'metal', 'Paslanmaz çelik ve metal bileklikler', (SELECT id FROM categories WHERE slug = 'bileklik'), 2),
('Silikon', 'silikon', 'Su geçirmez silikon bileklikler', (SELECT id FROM categories WHERE slug = 'bileklik'), 3),
('Altın', 'altin', 'Altın kaplama ürünler', (SELECT id FROM categories WHERE slug = 'kolye'), 1),
('Gümüş', 'gumus', 'Gümüş ürünler', (SELECT id FROM categories WHERE slug = 'kolye'), 2);

-- NFC temaları ekle
INSERT INTO nfc_themes (name, slug, description, layout_config, is_active) VALUES 
('Eternal Love', 'eternal-love', 'Aşk ve romantizm teması', '{"type": "love", "colors": ["#ff69b4", "#ff1493"], "layout": "romantic"}', true),
('Wild Adventure', 'wild-adventure', 'Macera ve doğa teması', '{"type": "adventure", "colors": ["#4169e1", "#8a2be2"], "layout": "dynamic"}', true),
('Golden Memories', 'golden-memories', 'Değerli anılar teması', '{"type": "memories", "colors": ["#ffd700", "#ff8c00"], "layout": "elegant"}', true);

-- Ürünler ekle
INSERT INTO products (name, slug, description, short_description, price, original_price, stock, category_id, nfc_enabled, material, weight, dimensions, featured) VALUES 
(
    'Premium NFC Deri Bileklik',
    'premium-nfc-deri-bileklik',
    'Gerçek dana derisi ve premium NFC teknolojisi ile üretilmiş özel bileklik. Su geçirmez özelliği ile günlük kullanıma uygun.',
    'Gerçek deri ve NFC teknolojisi ile özel anılarınızı paylaşın.',
    299.00,
    399.00,
    25,
    (SELECT id FROM categories WHERE slug = 'deri'),
    true,
    'Gerçek Dana Derisi',
    45.0,
    '18-22 cm (ayarlanabilir)',
    true
),
(
    'Spor NFC Silikon Bileklik',
    'spor-nfc-silikon-bileklik',
    'Medikal silikon malzeme ile üretilmiş su geçirmez NFC bileklik. Spor aktiviteleri için ideal.',
    'Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.',
    199.00,
    NULL,
    50,
    (SELECT id FROM categories WHERE slug = 'silikon'),
    true,
    'Medikal Silikon',
    28.0,
    'S, M, L, XL',
    true
),
(
    'Lüks NFC Metal Bileklik',
    'luks-nfc-metal-bileklik',
    '316L paslanmaz çelik ile üretilmiş premium NFC bileklik. Altın kaplama seçeneği mevcut.',
    'Paslanmaz çelik ve şık tasarım ile özel günleriniz için.',
    499.00,
    NULL,
    15,
    (SELECT id FROM categories WHERE slug = 'metal'),
    true,
    '316L Paslanmaz Çelik',
    85.0,
    '19-21 cm (ayarlanabilir)',
    true
),
(
    'Klasik Deri Bileklik',
    'klasik-deri-bileklik',
    'Geleneksel deri işçiliği ile üretilmiş klasik bileklik. NFC özelliği bulunmamaktadır.',
    'Geleneksel deri işçiliği ile zamansız şıklık.',
    149.00,
    NULL,
    30,
    (SELECT id FROM categories WHERE slug = 'deri'),
    false,
    'Doğal Deri',
    35.0,
    '17-23 cm (ayarlanabilir)',
    false
),
(
    'Altın NFC Kolye',
    'altin-nfc-kolye',
    '24 ayar altın kaplama ile üretilmiş lüks NFC kolye. Özel hediye kutusu ile birlikte.',
    '24 ayar altın kaplama ve NFC teknolojisi ile lüks bir hediye.',
    1299.00,
    NULL,
    8,
    (SELECT id FROM categories WHERE slug = 'altin'),
    true,
    '24 Ayar Altın Kaplama',
    18.0,
    '45-50 cm (ayarlanabilir)',
    true
);

-- Ürün görselleri ekle
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES 
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), '/placeholder.svg?height=400&width=400&text=Premium+Deri+Bileklik', 'Premium NFC Deri Bileklik', 0, true),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), '/placeholder.svg?height=400&width=400&text=Yan+Görünüm', 'Yan görünüm', 1, false),
((SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), '/placeholder.svg?height=400&width=400&text=Spor+Silikon+Bileklik', 'Spor NFC Silikon Bileklik', 0, true),
((SELECT id FROM products WHERE slug = 'luks-nfc-metal-bileklik'), '/placeholder.svg?height=400&width=400&text=Lüks+Metal+Bileklik', 'Lüks NFC Metal Bileklik', 0, true),
((SELECT id FROM products WHERE slug = 'klasik-deri-bileklik'), '/placeholder.svg?height=400&width=400&text=Klasik+Deri+Bileklik', 'Klasik Deri Bileklik', 0, true),
((SELECT id FROM products WHERE slug = 'altin-nfc-kolye'), '/placeholder.svg?height=400&width=400&text=Altın+NFC+Kolye', 'Altın NFC Kolye', 0, true);

-- Ürün özellikleri ekle
INSERT INTO product_features (product_id, feature_name, feature_value, sort_order) VALUES 
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Malzeme', 'Gerçek dana derisi', 0),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'NFC Özelliği', 'NTAG213 çip', 1),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Su Geçirmezlik', 'IPX4 sertifikalı', 2),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Boyut', 'Ayarlanabilir (18-22 cm)', 3),
((SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), 'Malzeme', 'Medikal silikon', 0),
((SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), 'Su Geçirmezlik', 'IPX8 sertifikalı', 1),
((SELECT id FROM products WHERE slug = 'spor-nfc-silikon-bileklik'), 'Alerjik Reaksiyon', 'Hipoalerjenik', 2);

-- Ürün spesifikasyonları ekle
INSERT INTO product_specifications (product_id, spec_name, spec_value, sort_order) VALUES 
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Malzeme', 'Gerçek Dana Derisi', 0),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'NFC Çip', 'NTAG213 (180 byte)', 1),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Su Geçirmezlik', 'IPX4', 2),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Boyut', '18-22 cm (ayarlanabilir)', 3),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Ağırlık', '45g', 4),
((SELECT id FROM products WHERE slug = 'premium-nfc-deri-bileklik'), 'Renk Seçenekleri', 'Siyah, Kahverengi, Lacivert', 5);

-- Test kullanıcısı ekle
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES 
('test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/5PI/PG', 'Test', 'Kullanıcı', '+90 555 123 4567');
-- Şifre: admin123
