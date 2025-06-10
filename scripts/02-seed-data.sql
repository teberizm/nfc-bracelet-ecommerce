-- Admin kullanıcısı ekle (şifre: admin123)
INSERT INTO admins (id, email, password_hash, name, role) VALUES 
('admin-1', 'admin@nfcbileklik.com', '$2a$12$LQv3c1yqBwEHFl5yCuHJ2.ZSGEffxWJQoYNjVuqAyb0TC2fxdoyvK', 'Admin User', 'super_admin');

-- NFC temaları ekle
INSERT INTO nfc_themes (id, name, description, preview_image, layout_config, is_active) VALUES 
('theme-love', 'Eternal Love', 'Aşk dolu anılarınız için romantik tema', '/images/themes/love-preview.jpg', 
 '{"background": "gradient-pink", "animations": "hearts", "font": "romantic"}', true),
('theme-adventure', 'Wild Adventure', 'Macera dolu anılarınız için dinamik tema', '/images/themes/adventure-preview.jpg',
 '{"background": "gradient-blue", "animations": "stars", "font": "bold"}', true),
('theme-memories', 'Golden Memories', 'Değerli anılarınız için zarif tema', '/images/themes/memories-preview.jpg',
 '{"background": "gradient-gold", "animations": "sparkles", "font": "elegant"}', true);

-- Örnek ürünler ekle
INSERT INTO products (id, name, description, price, stock, category, nfc_enabled, is_active) VALUES 
('product-1', 'Klasik NFC Bileklik', 'Şık ve zarif tasarım ile günlük kullanım için ideal', 299.99, 50, 'Klasik', true, true),
('product-2', 'Spor NFC Bileklik', 'Su geçirmez ve dayanıklı spor bileklik', 399.99, 30, 'Spor', true, true),
('product-3', 'Premium NFC Bileklik', 'Lüks malzemeler ile üretilmiş premium bileklik', 599.99, 20, 'Premium', true, true);

-- Ürün görselleri ekle
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary) VALUES 
('img-1', 'product-1', '/images/products/classic-1.jpg', 'Klasik NFC Bileklik', true),
('img-2', 'product-2', '/images/products/sport-1.jpg', 'Spor NFC Bileklik', true),
('img-3', 'product-3', '/images/products/premium-1.jpg', 'Premium NFC Bileklik', true);
