-- Basit admin hesabı oluştur
INSERT INTO admins (email, password_hash, name, role, is_active) 
VALUES (
  'admin@nfcbileklik.com', 
  '$2b$10$K7L/8Y3QGV5q5q5q5q5q5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 
  'Admin', 
  'super_admin', 
  true
) 
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = CURRENT_TIMESTAMP;
