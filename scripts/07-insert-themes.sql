-- NFC Themes tablosuna örnek temalar ekle
INSERT INTO nfc_themes (id, name, slug, description, preview_image, layout_config, is_premium, is_active, download_count, created_at, updated_at) VALUES
('e9166729-f1b8-4309-9250-7094230b560d', 'Eternal Love', 'eternal-love', 'Aşk ve romantizm teması', null, '{"type":"love","colors":["#ff69b4","#ff1493"],"layout":"romantic"}', false, true, 0, '2025-06-11 14:46:23.644309', '2025-06-11 14:46:23.644309'),
('c890347f-0ec5-4f5a-9927-e146b1c02eac', 'Wild Adventure', 'wild-adventure', 'Macera ve doğa teması', null, '{"type":"adventure","colors":["#4169e1","#8a2be2"],"layout":"dynamic"}', false, true, 0, '2025-06-11 14:46:23.644309', '2025-06-11 14:46:23.644309'),
('de89332d-b31e-4c4a-8e9d-59718716f31d', 'Golden Memories', 'golden-memories', 'Değerli anılar teması', null, '{"type":"memories","colors":["#ffd700","#ff8c00"],"layout":"elegant"}', false, true, 0, '2025-06-11 14:46:23.644309', '2025-06-11 14:46:23.644309')
ON CONFLICT (id) DO NOTHING;
