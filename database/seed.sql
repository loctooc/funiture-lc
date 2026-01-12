-- Categories
INSERT INTO categories (name, slug, image, description, created_at, updated_at) VALUES 
('Living Room', 'living-room', '/category-living.png', 'Comfortable and stylish furniture for your gathering space.', NOW(), NOW()),
('Bedroom', 'bedroom', '/category-bedroom.png', 'Create your personal sanctuary with our premium bedroom collection.', NOW(), NOW()),
('Dining Room', 'dining-room', '/category-dining.png', 'Elegant tables and chairs for memorable meals.', NOW(), NOW()),
('Office', 'office', '/hero-bg.png', 'Productive workspaces designed for modern professionals.', NOW(), NOW());

-- Products
-- 1. Velvet Accent Chair (Living Room)
INSERT INTO products (name, slug, description, price, sale_price, image, inventory, status, content, is_featured, created_at, updated_at) VALUES 
('Velvet Accent Chair', 'velvet-accent-chair', 'A luxurious velvet chair with gold legs.', 599.00, 499.00, '/category-living.png', 50, 1, '<p>Experience the ultimate in comfort and style with our Velvet Accent Chair. Featuring plush velvet upholstery and sturdy gold-finished legs, this chair is the perfect addition to any modern living room.</p>', 1, NOW(), NOW());

-- 2. Minimalist Coffee Table (Living Room)
INSERT INTO products (name, slug, description, price, sale_price, image, inventory, status, content, is_featured, created_at, updated_at) VALUES 
('Minimalist Coffee Table', 'minimalist-coffee-table', 'Sleek wooden coffee table with storage.', 349.00, 299.00, '/category-living.png', 30, 1, '<p>Clean lines and functional design define this Minimalist Coffee Table. Crafted from high-quality oak, it offers ample surface area and a lower shelf for magazines or books.</p>', 1, NOW(), NOW());

-- 3. King Size Upholstered Bed (Bedroom)
INSERT INTO products (name, slug, description, price, sale_price, image, inventory, status, content, is_featured, created_at, updated_at) VALUES 
('King Size Upholstered Bed', 'king-size-upholstered-bed', 'Elegant king bed with a tufted headboard.', 1299.00, 1099.00, '/category-bedroom.png', 15, 1, '<p>Sleep in luxury with our King Size Upholstered Bed. The tall, button-tufted headboard provides excellent back support for reading in bed, while the sturdy frame ensures durability.</p>', 1, NOW(), NOW());

-- 4. Nordic Dining Chair (Dining Room)
INSERT INTO products (name, slug, description, price, sale_price, image, inventory, status, content, is_featured, created_at, updated_at) VALUES 
('Nordic Dining Chair', 'nordic-dining-chair', 'Classic wooden chair with a comfortable seat.', 249.00, NULL, '/category-dining.png', 100, 1, '<p>Bring Scandinavian charm to your dining room with the Nordic Dining Chair. Made from solid beech wood, it features a curved backrest for ergonomic support.</p>', 0, NOW(), NOW());

-- 5. Executive Office Desk (Office)
INSERT INTO products (name, slug, description, price, sale_price, image, inventory, status, content, is_featured, created_at, updated_at) VALUES 
('Executive Office Desk', 'executive-office-desk', 'Spacious desk with integrated cable management.', 799.00, NULL, '/hero-bg.png', 10, 1, '<p>Maximize your productivity with the Executive Office Desk. Its large surface area and built-in drawers provide plenty of space for your computer, documents, and office supplies.</p>', 0, NOW(), NOW());

-- Product Categories Mapping (product_n_category)
-- Assuming IDs: Chair=1, Table=2, Bed=3, DiningChair=4, Desk=5
-- Categories: Living=1, Bedroom=2, Dining=3, Office=4
INSERT INTO product_n_category (product_id, category_id, create_time) VALUES 
(1, 1, NOW()), -- Chair -> Living Room
(2, 1, NOW()), -- Table -> Living Room
(3, 2, NOW()), -- Bed -> Bedroom
(4, 3, NOW()), -- Dining Chair -> Dining Room
(5, 4, NOW()); -- Desk -> Office

-- Product Gallery
INSERT INTO product_gallery (product_id, image_url, create_time, update_time) VALUES 
(1, '/category-living.png', NOW(), NOW()),
(1, '/hero-bg.png', NOW(), NOW()),
(3, '/category-bedroom.png', NOW(), NOW()),
(4, '/category-dining.png', NOW(), NOW());
