-- Campus Lost & Found System - Seed Data
-- Provides initial mock users, items, matches, and claims for testing

INSERT INTO users (id, email, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'alex.chen@campus.edu', 'Alex Chen', 'student'),
('22222222-2222-2222-2222-222222222222', 'maya.patel@campus.edu', 'Maya Patel', 'student'),
('33333333-3333-3333-3333-333333333333', 'prof.roberts@campus.edu', 'Dr. David Roberts', 'faculty'),
('44444444-4444-4444-4444-444444444444', 'admin.security@campus.edu', 'Campus Public Safety Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO items (id, user_id, type, title, description, category, location, incident_date, image_url, ai_tags, status) VALUES
(
  'aaaa1111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'lost',
  'Space Gray MacBook Air M2 13"',
  'Left on 2nd floor silent study desk near the north window. Has a small NASA sticker on the top right corner of the lid and a slight scuff mark near the USB-C port.',
  'Electronics',
  'Main Library',
  NOW() - INTERVAL '2 days',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  '{"extracted_color": "Space Gray", "brand": "Apple", "distinguishing_features": ["NASA sticker on lid top-right", "scuff on USB-C port", "M2 chip 13-inch model"], "condition": "good", "summary_tags": ["laptop", "apple", "macbook", "space gray", "nasa sticker"]}'::jsonb,
  'matched'
),
(
  'bbbb2222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'found',
  'Found Apple MacBook Laptop in Sleeve',
  'Turned in by custodial staff from the 2nd floor library study carrels. Grey Apple laptop inside a grey padded neoprene sleeve with a sticker on the exterior lid.',
  'Electronics',
  'Main Library',
  NOW() - INTERVAL '1 day',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
  '{"extracted_color": "Space Gray", "brand": "Apple", "distinguishing_features": ["Decal/sticker on outer shell", "padded grey sleeve", "US keyboard layout"], "condition": "very good", "summary_tags": ["laptop", "apple", "macbook", "library found", "space gray"]}'::jsonb,
  'matched'
),
(
  'cccc3333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'lost',
  'Blue North Face Thermoball Jacket',
  'Navy blue zip-up insulated jacket left on back of chair in Dining Hall booth. Size M with red lanyard in left zippered pocket.',
  'Apparel & Accessories',
  'Cafeteria',
  NOW() - INTERVAL '3 days',
  'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
  '{"extracted_color": "Navy Blue", "brand": "The North Face", "distinguishing_features": ["Size M", "quilted pattern", "red lanyard inside left pocket"], "condition": "excellent", "summary_tags": ["jacket", "north face", "navy blue", "apparel", "cafeteria"]}'::jsonb,
  'active'
),
(
  'dddd4444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'lost',
  'Student ID Card - Maya Patel',
  'Campus ID card with badge holder and university seal clip. Lost somewhere between Engineering Block lecture hall 101 and the Student Center courtyard.',
  'ID & Cards',
  'Engineering Block',
  NOW() - INTERVAL '1 day',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  '{"extracted_color": "White/Blue", "brand": "University Campus ID", "distinguishing_features": ["Clear plastic clip badge", "Name: Maya Patel", "Student ID 2024-8849"], "condition": "mint", "summary_tags": ["student id", "card", "engineering", "maya patel"]}'::jsonb,
  'active'
),
(
  'eeee5555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'found',
  'Black Sony WH-1000XM5 Wireless Headphones',
  'Found on bench outside Sports Complex gym entrance. In original hard-shell case with audio cable.',
  'Electronics',
  'Sports Complex',
  NOW() - INTERVAL '4 hours',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  '{"extracted_color": "Matte Black", "brand": "Sony", "distinguishing_features": ["WH-1000XM5 model", "hard zipper carry case included", "3.5mm aux cable"], "condition": "excellent", "summary_tags": ["headphones", "sony", "sports complex", "wireless"]}'::jsonb,
  'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO item_matches (id, lost_item_id, found_item_id, confidence_score, match_reasoning, status) VALUES
(
  'mmmm1111-1111-1111-1111-111111111111',
  'aaaa1111-1111-1111-1111-111111111111',
  'bbbb2222-2222-2222-2222-222222222222',
  94.50,
  '### Match Evaluation Analysis\n- **Device Overlap:** Both items are Apple MacBook Air models with Space Gray finish.\n- **Distinctive Markings:** The lost item specifies a sticker on the lid, and the found item notes a sticker on the exterior shell.\n- **Location Correlation:** High correlation; both were reported in the **Main Library** on the 2nd floor study desk/carrel area.\n- **Temporal Alignment:** The found item report was filed ~24 hours after the loss occurred, fitting standard custodial pickup cycles.\n- **Conclusion:** Extremely high probability match (94.5% confidence).',
  'pending'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO claims (id, match_id, claimant_id, proof_description, status) VALUES
(
  'cccc1111-1111-1111-1111-111111111111',
  'mmmm1111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'I can unlock the MacBook with my student fingerprint/password (username: achen). The desktop wallpaper is the James Webb Carina Nebula. Serial number ends in -J84K. I have the original purchase invoice from the campus bookstore.',
  'pending_review'
)
ON CONFLICT (id) DO NOTHING;
