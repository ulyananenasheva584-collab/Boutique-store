-- Удалить существующие данные
DELETE FROM products;
DELETE FROM users;

-- Сбросить автоинкремент (опционально)
DELETE FROM sqlite_sequence WHERE name='products';
DELETE FROM sqlite_sequence WHERE name='users';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  category TEXT NOT NULL,
  size TEXT,
  color TEXT,
  brand TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);

-- Insert sample products
INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES
('Prada Silk Dress', 'Elegant silk dress for special occasions', 299.99, 10, 'dresses', 'S,M,L,XL', 'Navy Blue', 'Prada', '/images/dress1.jpg'),
('Prada Cashmere Sweater', 'Soft cashmere sweater for winter', 189.99, 15, 'tops', 'XS,S,M,L', 'Cream', 'Prada', '/images/sweater1.jpg'),
('Prada Trousers', 'High-waisted designer trousers', 159.99, 20, 'bottoms', '24,26,28,30', 'Black', 'Prada', '/images/jeans1.jpg'),
('Prada Handbag', 'Genuine leather handbag', 399.99, 8, 'accessories', 'One Size', 'Black', 'Prada', '/images/bag1.jpg');

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@boutique.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');