const db = require('./src/config/database');

console.log('Initializing database with fixed script...');

// Функция для выполнения SQL с обработкой ошибок
function runSQL(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, function(err) {
        if (err) {
            console.error('❌ Error:', err.message);
            console.error('SQL:', sql);
            reject(err);
        } else {
            console.log('✅ Executed:', sql.substring(0, 50) + '...');
            resolve(this);
        }
        });
    });
    }

    async function initializeDatabase() {
    try {
        // Создание таблиц
        console.log('Creating tables...');
        
        await runSQL(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE IF NOT EXISTS products (
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
        )`);

        await runSQL(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await runSQL(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
        )`);

        // Вставка тестовых данных
        console.log('Inserting test data...');
        
        // Продукты
        await runSQL(`INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Designer Silk Dress', 'Elegant silk dress for special occasions', 299.99, 10, 'dresses', 'S,M,L,XL', 'Navy Blue', 'Luxury Couture', '/images/dress1.jpg')`);
        
        await runSQL(`INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Cashmere Sweater', 'Soft cashmere sweater for winter', 189.99, 15, 'tops', 'XS,S,M,L', 'Cream', 'Premium Knits', '/images/sweater1.jpg')`);
        
        await runSQL(`INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Designer Jeans', 'High-waisted designer jeans', 159.99, 20, 'bottoms', '24,26,28,30', 'Dark Wash', 'Denim Masters', '/images/jeans1.jpg')`);
        
        await runSQL(`INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) VALUES 
        ('Leather Handbag', 'Genuine leather handbag', 399.99, 8, 'accessories', 'One Size', 'Black', 'Leather Craft', '/images/bag1.jpg')`);

        // Админ пользователь
        await runSQL(`INSERT INTO users (email, password_hash, name, role) VALUES 
        ('admin@boutique.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin')`);

        console.log('🎉 Database initialized successfully!');

        // Проверка данных
        db.all('SELECT * FROM products', (err, products) => {
        if (err) {
            console.error('Error checking products:', err);
        } else {
            console.log(`📦 Products inserted: ${products.length}`);
            products.forEach(p => console.log(`   - ${p.title}: $${p.price}`));
        }
        });

        db.all('SELECT * FROM users', (err, users) => {
        if (err) {
            console.error('Error checking users:', err);
        } else {
            console.log(`👥 Users inserted: ${users.length}`);
            users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
        }
        db.close();
        });

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        db.close();
    }
}

initializeDatabase();