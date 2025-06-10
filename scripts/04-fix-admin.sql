-- Önce mevcut admin hesabını sil
DELETE FROM admins WHERE email = 'admin@nfcbileklik.com';

-- Yeni admin hesabı oluştur (şifre: admin123)
INSERT INTO admins (
  id,
  email, 
  password_hash, 
  name, 
  role, 
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin@nfcbileklik.com',
  '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'Admin',
  'super_admin',
  true,
  CURRENT_TIMESTAMP
);

-- Admin tablosunu kontrol et
SELECT * FROM admins WHERE email = 'admin@nfcbileklik.com';
