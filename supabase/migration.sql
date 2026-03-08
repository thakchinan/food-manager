-- ============================================
-- Four Allies POS — Database Schema
-- ============================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  color TEXT NOT NULL DEFAULT '#e63946',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '🍛',
  description TEXT,
  options JSONB DEFAULT '{}',
  addons JSONB DEFAULT '[]',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  table_no TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  vat NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  image TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  note TEXT DEFAULT '',
  selected_options JSONB DEFAULT '{}',
  selected_addons JSONB DEFAULT '[]',
  line_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for anon key — suitable for POS system)
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);

-- ============================================
-- SEED DATA — Categories
-- ============================================
INSERT INTO categories (id, label, icon, color, sort_order) VALUES
  ('all', 'ทั้งหมด', '📋', '#e63946', 0),
  ('food', 'อาหาร', '🍛', '#f4a236', 1),
  ('drink', 'เครื่องดื่ม', '🧋', '#d4380d', 2),
  ('dessert', 'ของหวาน', '🍨', '#ffd166', 3),
  ('snack', 'ของทานเล่น', '🍢', '#ff6b6b', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA — Menu Items
-- ============================================
INSERT INTO menu_items (id, name, name_en, category, price, image, description, options, addons) VALUES
(1, 'ข้าวผัดกระเพรา', 'Basil Fried Rice', 'food', 55, '🍛', 'ข้าวผัดกระเพราหมูสับ เสิร์ฟพร้อมไข่ดาว',
  '{"spicyLevel":{"type":"radio","label":"ระดับความเผ็ด","choices":[{"value":0,"label":"ไม่เผ็ด"},{"value":1,"label":"เผ็ดน้อย"},{"value":2,"label":"เผ็ดกลาง"},{"value":3,"label":"เผ็ดมาก"}],"default":1},"protein":{"type":"radio","label":"เลือกเนื้อสัตว์","choices":[{"value":"pork","label":"หมู","extraPrice":0},{"value":"chicken","label":"ไก่","extraPrice":0},{"value":"beef","label":"เนื้อ","extraPrice":20},{"value":"seafood","label":"ทะเล","extraPrice":30}],"default":"pork"}}',
  '[{"id":101,"name":"ไข่ดาว","price":10},{"id":102,"name":"ไข่เจียว","price":15},{"id":103,"name":"ผักเพิ่ม","price":5}]'),

(2, 'ผัดไทย', 'Pad Thai', 'food', 60, '🍜', 'ผัดไทยกุ้งสด เส้นเหนียวนุ่ม',
  '{"size":{"type":"radio","label":"ขนาด","choices":[{"value":"regular","label":"ธรรมดา","extraPrice":0},{"value":"large","label":"พิเศษ","extraPrice":20}],"default":"regular"}}',
  '[{"id":201,"name":"กุ้งเพิ่ม","price":30},{"id":202,"name":"ถั่วงอก","price":5},{"id":203,"name":"พริกป่น","price":0}]'),

(3, 'ส้มตำ', 'Som Tum', 'food', 45, '🥗', 'ส้มตำไทยรสจัดจ้าน',
  '{"spicyLevel":{"type":"radio","label":"ระดับความเผ็ด","choices":[{"value":0,"label":"ไม่เผ็ด"},{"value":1,"label":"เผ็ดน้อย"},{"value":2,"label":"เผ็ดกลาง"},{"value":3,"label":"เผ็ดมาก"},{"value":4,"label":"เผ็ดสุดๆ"}],"default":2}}',
  '[{"id":301,"name":"ปูไข่","price":40},{"id":302,"name":"กุ้งสด","price":30},{"id":303,"name":"ข้าวเหนียว","price":10}]'),

(4, 'ต้มยำกุ้ง', 'Tom Yum Goong', 'food', 85, '🍲', 'ต้มยำกุ้งน้ำข้น รสเข้มข้น',
  '{"soupType":{"type":"radio","label":"ประเภทน้ำซุป","choices":[{"value":"clear","label":"น้ำใส"},{"value":"creamy","label":"น้ำข้น"}],"default":"creamy"},"spicyLevel":{"type":"radio","label":"ระดับความเผ็ด","choices":[{"value":1,"label":"เผ็ดน้อย"},{"value":2,"label":"เผ็ดกลาง"},{"value":3,"label":"เผ็ดมาก"}],"default":2}}',
  '[{"id":401,"name":"กุ้งเพิ่ม","price":40},{"id":402,"name":"เห็ด","price":15},{"id":403,"name":"ข้าวสวย","price":10}]'),

(5, 'ข้าวมันไก่', 'Khao Man Gai', 'food', 50, '🍗', 'ข้าวมันไก่ต้ม เสิร์ฟพร้อมน้ำจิ้ม',
  '{"chickenType":{"type":"radio","label":"ประเภทไก่","choices":[{"value":"boiled","label":"ไก่ต้ม"},{"value":"fried","label":"ไก่ทอด","extraPrice":10},{"value":"mixed","label":"ไก่รวม","extraPrice":15}],"default":"boiled"}}',
  '[{"id":501,"name":"ไก่เพิ่ม","price":25},{"id":502,"name":"น้ำซุป","price":10},{"id":503,"name":"เลือดหมู","price":10}]'),

(6, 'กะเพราไก่', 'Chicken Basil', 'food', 50, '🥘', 'กะเพราไก่ใส่ถั่วฝักยาว',
  '{"spicyLevel":{"type":"radio","label":"ระดับความเผ็ด","choices":[{"value":0,"label":"ไม่เผ็ด"},{"value":1,"label":"เผ็ดน้อย"},{"value":2,"label":"เผ็ดกลาง"},{"value":3,"label":"เผ็ดมาก"}],"default":2}}',
  '[{"id":601,"name":"ไข่ดาว","price":10},{"id":602,"name":"ข้าวเพิ่ม","price":10}]'),

(7, 'ชาเย็น', 'Thai Iced Tea', 'drink', 35, '🧋', 'ชาเย็นสูตรโบราณ หวานมัน',
  '{"sweetLevel":{"type":"radio","label":"ระดับความหวาน","choices":[{"value":0,"label":"ไม่หวาน"},{"value":25,"label":"หวานน้อย (25%)"},{"value":50,"label":"หวานปกติ (50%)"},{"value":75,"label":"หวานมาก (75%)"},{"value":100,"label":"หวานเต็ม (100%)"}],"default":50}}',
  '[{"id":701,"name":"วิปครีม","price":10},{"id":702,"name":"ไข่มุก","price":15}]'),

(8, 'กาแฟเย็น', 'Iced Coffee', 'drink', 40, '☕', 'กาแฟเย็นสดคั่วบด',
  '{"sweetLevel":{"type":"radio","label":"ระดับความหวาน","choices":[{"value":0,"label":"ไม่หวาน"},{"value":25,"label":"หวานน้อย"},{"value":50,"label":"หวานปกติ"},{"value":100,"label":"หวานเต็ม"}],"default":50},"milkType":{"type":"radio","label":"ประเภทนม","choices":[{"value":"regular","label":"นมสด"},{"value":"soy","label":"นมถั่วเหลือง","extraPrice":5},{"value":"oat","label":"นมข้าวโอ๊ต","extraPrice":10}],"default":"regular"}}',
  '[{"id":801,"name":"ช็อตเพิ่ม","price":15},{"id":802,"name":"วิปครีม","price":10}]'),

(9, 'น้ำมะนาว', 'Lemonade', 'drink', 25, '🍋', 'น้ำมะนาวสดคั้น เย็นชื่นใจ',
  '{"sweetLevel":{"type":"radio","label":"ระดับความหวาน","choices":[{"value":0,"label":"ไม่หวาน"},{"value":25,"label":"หวานน้อย"},{"value":50,"label":"หวานปกติ"},{"value":100,"label":"หวานเต็ม"}],"default":25}}',
  '[{"id":901,"name":"น้ำผึ้ง","price":10},{"id":902,"name":"โซดา","price":5}]'),

(10, 'สมูทตี้มะม่วง', 'Mango Smoothie', 'drink', 55, '🥭', 'สมูทตี้มะม่วงสุก เข้มข้น',
  '{"size":{"type":"radio","label":"ขนาด","choices":[{"value":"regular","label":"ปกติ (16oz)","extraPrice":0},{"value":"large","label":"ใหญ่ (22oz)","extraPrice":15}],"default":"regular"}}',
  '[{"id":1001,"name":"โยเกิร์ต","price":15},{"id":1002,"name":"วิปครีม","price":10},{"id":1003,"name":"ท็อปปิ้งผลไม้","price":20}]'),

(11, 'ไอศกรีมกะทิ', 'Coconut Ice Cream', 'dessert', 45, '🍨', 'ไอศกรีมกะทิสดใส่ท็อปปิ้ง',
  '{"scoops":{"type":"radio","label":"จำนวนลูก","choices":[{"value":1,"label":"1 ลูก"},{"value":2,"label":"2 ลูก","extraPrice":20},{"value":3,"label":"3 ลูก","extraPrice":40}],"default":1}}',
  '[{"id":1101,"name":"ถั่วลิสง","price":5},{"id":1102,"name":"ข้าวเหนียว","price":10},{"id":1103,"name":"ลูกชิด","price":10},{"id":1104,"name":"ข้าวโพด","price":10}]'),

(12, 'ขนมปังปิ้ง', 'Toast', 'dessert', 35, '🍞', 'ขนมปังปิ้งเนยน้ำตาล',
  '{"topping":{"type":"radio","label":"ท็อปปิ้ง","choices":[{"value":"butter","label":"เนยน้ำตาล"},{"value":"jam","label":"แยม","extraPrice":5},{"value":"chocolate","label":"ช็อกโกแลต","extraPrice":10},{"value":"honey","label":"น้ำผึ้ง","extraPrice":10}],"default":"butter"}}',
  '[{"id":1201,"name":"ไอศกรีมวานิลา","price":20},{"id":1202,"name":"ผลไม้","price":15}]'),

(13, 'บัวลอย', 'Bua Loy', 'dessert', 40, '🍡', 'บัวลอยไข่หวานน้ำกะทิ',
  '{"temperature":{"type":"radio","label":"อุณหภูมิ","choices":[{"value":"hot","label":"ร้อน"},{"value":"cold","label":"เย็น"}],"default":"hot"}}',
  '[{"id":1301,"name":"ไข่หวานเพิ่ม","price":10},{"id":1302,"name":"มันม่วง","price":10}]'),

(14, 'หมูปิ้ง', 'Grilled Pork Skewer', 'snack', 15, '🍢', 'หมูปิ้งไม้ละ 15 บาท เนื้อนุ่มหมักจนเข้าเนื้อ',
  '{"spicyDip":{"type":"radio","label":"น้ำจิ้ม","choices":[{"value":"jaew","label":"แจ่ว"},{"value":"sweet","label":"น้ำจิ้มหวาน"},{"value":"seafood","label":"ซีฟู้ด"}],"default":"jaew"}}',
  '[{"id":1401,"name":"ข้าวเหนียว","price":10},{"id":1402,"name":"ส้มตำ","price":30}]'),

(15, 'ลูกชิ้นทอด', 'Fried Meatballs', 'snack', 20, '🧆', 'ลูกชิ้นทอดกรอบ เสิร์ฟพร้อมน้ำจิ้ม',
  '{"spicyLevel":{"type":"radio","label":"ระดับความเผ็ด (ซอส)","choices":[{"value":0,"label":"ไม่เผ็ด"},{"value":1,"label":"เผ็ดน้อย"},{"value":2,"label":"เผ็ดมาก"}],"default":1}}',
  '[{"id":1501,"name":"ซอสพริกเพิ่ม","price":5}]'),

(16, 'เกี๊ยวทอด', 'Fried Dumplings', 'snack', 30, '🥟', 'เกี๊ยวทอดกรอบ ไส้หมู',
  '{"quantity":{"type":"radio","label":"จำนวน","choices":[{"value":5,"label":"5 ชิ้น"},{"value":10,"label":"10 ชิ้น","extraPrice":25}],"default":5}}',
  '[{"id":1601,"name":"ซอสพริก","price":5},{"id":1602,"name":"น้ำจิ้มบ๊วย","price":5}]')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  addons = EXCLUDED.addons,
  updated_at = NOW();

-- Reset sequence to avoid conflicts
SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));
