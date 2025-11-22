const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'boutique.db');
console.log('Database path:', dbPath);

// Удаляем старую базу если есть
const fs = require('fs');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️ Old database deleted');
    }

    // Создаем новую базу
    const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        return;
    }
    console.log('✅ Connected to SQLite database');
    });

    // Включаем foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Создаем таблицы последовательно
    function createTables() {
    console.log('\n📋 Creating tables...');
    
    const tables = [
        `CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE products (
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
        )`,
        
        `CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
        )`
    ];

    let completed = 0;
    
    tables.forEach((sql, index) => {
        db.run(sql, (err) => {
        if (err) {
            console.error(`❌ Error creating table ${index + 1}:`, err.message);
        } else {
            console.log(`✅ Table ${index + 1} created`);
        }
        
        completed++;
        if (completed === tables.length) {
            insertData();
        }
        });
    });
    }

    // Вставляем данные
    function insertData() {
    console.log('\n📝 Inserting data...');
    
    const products = [
        `INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Designer Silk Dress', 'Elegant silk dress for special occasions', 299.99, 10, 'dresses', 'S,M,L,XL', 'Navy Blue', 'Luxury Couture', '/images/dress1.jpg')`,
        
        `INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Cashmere Sweater', 'Soft cashmere sweater for winter', 189.99, 15, 'tops', 'XS,S,M,L', 'Cream', 'Premium Knits', '/images/sweater1.jpg')`,
        
        `INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Designer Jeans', 'High-waisted designer jeans', 159.99, 20, 'bottoms', '24,26,28,30', 'Dark Wash', 'Denim Masters', '/images/jeans1.jpg')`,
        
        `INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Leather Handbag', 'Genuine leather handbag', 399.99, 8, 'accessories', 'One Size', 'Black', 'Leather Craft', '/images/bag1.jpg')`
    ];

    const users = [
        `INSERT INTO users (email, password_hash, name, role) VALUES 
        ('admin@boutique.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin')`
    ];

    let productCount = 0;
    let userCount = 0;

    // Вставляем продукты
    products.forEach((sql, index) => {
        db.run(sql, (err) => {
        if (err) {
            console.error(`❌ Error inserting product ${index + 1}:`, err.message);
        } else {
            console.log(`✅ Product ${index + 1} inserted`);
        }
        
        productCount++;
        if (productCount === products.length) {
            // После продуктов вставляем пользователей
            users.forEach((sql, index) => {
            db.run(sql, (err) => {
                if (err) {
                console.error(`❌ Error inserting user ${index + 1}:`, err.message);
                } else {
                console.log(`✅ User ${index + 1} inserted`);
                }
                
                userCount++;
                if (userCount === users.length) {
                verifyData();
                }
            });
            });
        }
        });
    });
    }

    // Проверяем данные
    function verifyData() {
    console.log('\n🔍 Verifying data...');
    
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
        console.error('Error checking tables:', err);
        } else {
        console.log('📊 Tables created:', tables.map(t => t.name));
        }
    });
    
    db.all('SELECT COUNT(*) as count FROM products', (err, result) => {
        if (err) {
        console.error('Error counting products:', err);
        } else {
        console.log(`📦 Products: ${result[0].count}`);
        }
    });
    
    db.all('SELECT COUNT(*) as count FROM users', (err, result) => {
        if (err) {
        console.error('Error counting users:', err);
        } else {
        console.log(`👥 Users: ${result[0].count}`);
        console.log('\n🎉 Database setup complete!');
        console.log('🔑 Admin: admin@boutique.com / admin123');
        db.close();
        }
    });
}

// Запускаем процесс
createTables();