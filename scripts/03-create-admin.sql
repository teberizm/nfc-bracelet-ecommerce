-- Admin hesabı oluştur
-- Şifre: admin123 (bcrypt hash)
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
  'admin@nfcbileklik.com', 
  '$2a$12$LQv3c1yqBwlVHpPjrCeyAuVFqNn5GvjD/.vGq/ZeHahHBdQnq/u2O', 
  'Admin User', 
  'super_admin'
) ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Test için başka bir admin hesabı
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
  'test@admin.com', 
  '$2a$12$LQv3c1yqBwlVHpPjrCeyAuVFqNn5GvjD/.vGq/ZeHahHBdQnq/u2O', 
  'Test Admin', 
  'admin'
) ON CONFLICT (email) DO NOTHING;
