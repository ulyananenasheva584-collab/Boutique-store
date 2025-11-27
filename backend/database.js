// Импортируем модуль sqlite3
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    // Конструктор объекта класса
    constructor() {
        // Путь к базе данных
        this.dbPath = path.join(__dirname, 'database.db');
        this.db = null;
        this.init();
    }

    // Метод инициализации базы данных
    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Ошибка при подключении к базе данных:', err.message);
                    reject(err);
                } else {
                    console.log('База данных подключена успешно');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    // Метод для создания таблиц для БД
    createTables() {
        return new Promise((resolve, reject) => {
            const createTablesQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    price REAL,
                    description TEXT,
                    image_url TEXT,
                    category TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    review TEXT NOT NULL,
                    stars INTEGER CHECK (stars >= 1 AND stars <= 5) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(product_id) REFERENCES products(id)
                );

                CREATE TABLE IF NOT EXISTS shops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT,
                    phone TEXT,
                    latitude REAL, -- широта
                    longitude REAL, -- долгота
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- НОВЫЕ ТАБЛИЦЫ ДЛЯ ЗАКАЗОВ
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    total_amount REAL NOT NULL,
                    status TEXT DEFAULT 'pending',
                    address TEXT NOT NULL,
                    phone TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );

                CREATE TABLE IF NOT EXISTS order_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    size TEXT,
                    color TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(order_id) REFERENCES orders(id),
                    FOREIGN KEY(product_id) REFERENCES products(id)
                );
            `;

            this.db.exec(createTablesQuery, (err) => {
                if (err) {
                    console.error('Ошибка при создании таблиц:', err.message);
                    reject(err);
                } else {
                    console.log('Таблицы созданы успешно');
                    resolve();
                }
            });
        });
    }

    // Метод для регистрации пользователя
    register(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password } = userData;

            if (!email || !password) {
                return reject(new Error('Email и пароль обязательны'));
            }

            const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

            this.db.run(query, [name, email, password], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Пользователь с таким email уже существует'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        name,
                        email,
                        message: 'Пользователь успешно зарегистрирован'
                    });
                }
            });
        });
    }

    // Метод для авторизации пользователя
    login(credentials) {
        return new Promise((resolve, reject) => {
            const { email, password } = credentials;

            if (!email || !password) {
                return reject(new Error('Email и пароль обязательны'));
            }

            const query = `SELECT id, name, email, created_at FROM users WHERE email = ? AND password = ?`;

            this.db.get(query, [email, password], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve({
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        created_at: row.created_at,
                        message: 'Авторизация успешна'
                    });
                } else {
                    reject(new Error('Неверный email или пароль'));
                }
            });
        });
    }

    // Метод для получения всех товаров
    getAllProducts() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT id, name, price, description, image_url, category, created_at
            FROM products
            ORDER BY created_at DESC
        `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Метод для получения одного товара по ID
    getProductById(productId) {
        return new Promise((resolve, reject) => {
            if (!productId) {
                return reject(new Error('ID товара обязателен'));
            }

            const query = `
            SELECT id, name, price, description, image_url, category, created_at
            FROM products
            WHERE id = ?
        `;

            this.db.get(query, [productId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(row);
                } else {
                    reject(new Error('Товар не найден'));
                }
            });
        });
    }

    // Метод для получения отзывов по product_id
    getReviewsByProductId(productId) {
        return new Promise((resolve, reject) => {
            if (!productId) {
                return reject(new Error('ID товара обязателен'));
            }

            const query = `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.review,
                r.stars,
                r.created_at,
                u.name as user_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;

            this.db.all(query, [productId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Метод для получения отзывов по user_id
    getReviewsByUserId(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject(new Error('ID пользователя обязателен'));
            }

            const query = `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.review,
                r.stars,
                r.created_at,
                p.name as product_name
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

            this.db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Метод для оставления отзыва по product_id
    createReview(reviewData) {
        return new Promise((resolve, reject) => {
            const { user_id, product_id, review, stars } = reviewData;

            // Валидация обязательных полей
            if (!user_id || !product_id || !review || !stars) {
                return reject(new Error('Все поля обязательны для заполнения'));
            }

            // Валидация оценки
            if (stars < 1 || stars > 5) {
                return reject(new Error('Оценка должна быть от 1 до 5 звезд'));
            }

            const query = `
            INSERT INTO reviews (user_id, product_id, review, stars)
            VALUES (?, ?, ?, ?)
        `;

            this.db.run(query, [user_id, product_id, review, stars], function(err) {
                if (err) {
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                        reject(new Error('Пользователь или товар не существует'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        user_id,
                        product_id,
                        review,
                        stars,
                        message: 'Отзыв успешно добавлен'
                    });
                }
            });
        });
    }

    // Метод для получения всех магазинов
    getAllShops() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT
                id,
                address,
                phone,
                latitude,
                longitude,
                created_at
            FROM shops
            ORDER BY created_at DESC
        `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Метод для создания товара
    createProduct(productData) {
        return new Promise((resolve, reject) => {
            const { name, price, description, image_url, category } = productData;

            // Валидация обязательных полей
            if (!name || !price) {
                return reject(new Error('Название и цена товара обязательны'));
            }

            const query = `
            INSERT INTO products (name, price, description, image_url, category)
            VALUES (?, ?, ?, ?, ?)
        `;

            this.db.run(query, [name, price, description, image_url, category], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        name,
                        price,
                        description,
                        image_url,
                        category,
                        message: 'Товар успешно создан'
                    });
                }
            });
        });
    }

    // Метод для создания магазина
    createShop(shopData) {
        return new Promise((resolve, reject) => {
            const { address, phone, latitude, longitude } = shopData;

            // Валидация обязательных полей
            if (!address) {
                return reject(new Error('Адрес магазина обязателен'));
            }

            const query = `
            INSERT INTO shops (address, phone, latitude, longitude)
            VALUES (?, ?, ?, ?)
        `;

            this.db.run(query, [address, phone, latitude, longitude], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        address,
                        phone,
                        latitude,
                        longitude,
                        message: 'Магазин успешно создан'
                    });
                }
            });
        });
    }

    // НОВЫЕ МЕТОДЫ ДЛЯ ЗАКАЗОВ

// Метод для создания заказа (исправленная версия)
// Метод для создания заказа (полностью переписанная версия)
createOrder(orderData) {
    return new Promise(async (resolve, reject) => {
        try {
            const { user_id, total_amount, address, phone, items } = orderData;

            // Валидация обязательных полей
            if (!user_id || !total_amount || !address || !items || items.length === 0) {
                return reject(new Error('Все обязательные поля должны быть заполнены'));
            }

            // Шаг 1: Создаем заказ
            const orderResult = await new Promise((resolveOrder, rejectOrder) => {
                const orderQuery = `
                    INSERT INTO orders (user_id, total_amount, address, phone, status)
                    VALUES (?, ?, ?, ?, 'pending')
                `;
                
                this.db.run(orderQuery, [user_id, total_amount, address, phone], function(err) {
                    if (err) {
                        rejectOrder(err);
                    } else {
                        resolveOrder(this.lastID);
                    }
                });
            });

            const orderId = orderResult;

            // Шаг 2: Добавляем товары в заказ
            for (const item of items) {
                await new Promise((resolveItem, rejectItem) => {
                    const itemQuery = `
                        INSERT INTO order_items (order_id, product_id, quantity, price, size, color)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    
                    this.db.run(itemQuery, [
                        orderId, 
                        item.product_id, 
                        item.quantity, 
                        item.price, 
                        item.size || null, 
                        item.color || null
                    ], function(err) {
                        if (err) {
                            rejectItem(err);
                        } else {
                            resolveItem();
                        }
                    });
                });
            }

            // Шаг 3: Возвращаем результат
            resolve({
                id: orderId,
                user_id,
                total_amount,
                address,
                phone,
                status: 'pending',
                message: 'Заказ успешно создан'
            });

        } catch (error) {
            reject(error);
        }
    });
}

    // Метод для получения заказов пользователя
    getUserOrders(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject(new Error('ID пользователя обязателен'));
            }

            const ordersQuery = `
                SELECT 
                    o.id,
                    o.user_id,
                    o.total_amount,
                    o.status,
                    o.address,
                    o.phone,
                    o.created_at,
                    o.updated_at
                FROM orders o
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `;

            this.db.all(ordersQuery, [userId], (err, orders) => {
                if (err) {
                    reject(err);
                } else {
                    // Для каждого заказа получаем его товары
                    const ordersWithItems = orders.map(order => {
                        return new Promise((orderResolve, orderReject) => {
                            const itemsQuery = `
                                SELECT 
                                    oi.id,
                                    oi.product_id,
                                    oi.quantity,
                                    oi.price,
                                    oi.size,
                                    oi.color,
                                    p.name as title,
                                    p.image_url,
                                    p.description
                                FROM order_items oi
                                JOIN products p ON oi.product_id = p.id
                                WHERE oi.order_id = ?
                            `;

                            this.db.all(itemsQuery, [order.id], (itemsErr, items) => {
                                if (itemsErr) {
                                    orderReject(itemsErr);
                                } else {
                                    orderResolve({
                                        ...order,
                                        items: items
                                    });
                                }
                            });
                        });
                    });

                    Promise.all(ordersWithItems)
                        .then(ordersData => resolve(ordersData))
                        .catch(reject);
                }
            });
        });
    }



    // Метод для обновления товара
    updateProduct(productId, productData) {
    return new Promise((resolve, reject) => {
        const { name, price, description, image_url, category } = productData;

        if (!productId) {
        return reject(new Error('ID товара обязателен'));
        }

        const query = `
        UPDATE products 
        SET name = ?, price = ?, description = ?, image_url = ?, category = ?
        WHERE id = ?
        `;

        this.db.run(query, [name, price, description, image_url, category, productId], function(err) {
        if (err) {
            reject(err);
        } else {
            resolve({
            id: productId,
            name,
            price,
            description,
            image_url,
            category,
            message: 'Товар успешно обновлен'
            });
        }
        });
    });
    }

    // Метод для удаления товара
    deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        if (!productId) {
        return reject(new Error('ID товара обязателен'));
        }

        // Сначала проверяем существование товара
        const checkQuery = 'SELECT id FROM products WHERE id = ?';
        
        this.db.get(checkQuery, [productId], (checkErr, row) => {
        if (checkErr) {
            reject(checkErr);
        } else if (!row) {
            reject(new Error('Товар не найден'));
        } else {
            // Удаляем товар
            const deleteQuery = 'DELETE FROM products WHERE id = ?';
            
            this.db.run(deleteQuery, [productId], function(deleteErr) {
            if (deleteErr) {
                reject(deleteErr);
            } else {
                resolve({
                id: productId,
                message: 'Товар успешно удален'
                });
            }
            });
        }
        });
    });
    }

    // Метод для получения заказа по ID
    getOrderById(orderId, userId = null) {
        return new Promise((resolve, reject) => {
            if (!orderId) {
                return reject(new Error('ID заказа обязателен'));
            }

            let orderQuery = `
                SELECT 
                    o.id,
                    o.user_id,
                    o.total_amount,
                    o.status,
                    o.address,
                    o.phone,
                    o.created_at,
                    o.updated_at
                FROM orders o
                WHERE o.id = ?
            `;
            
            const queryParams = [orderId];

            // Если передан userId, проверяем что заказ принадлежит пользователю
            if (userId) {
                orderQuery += ' AND o.user_id = ?';
                queryParams.push(userId);
            }

            this.db.get(orderQuery, queryParams, (err, order) => {
                if (err) {
                    reject(err);
                } else if (!order) {
                    reject(new Error('Заказ не найден'));
                } else {
                    // Получаем товары заказа
                    const itemsQuery = `
                        SELECT 
                            oi.id,
                            oi.product_id,
                            oi.quantity,
                            oi.price,
                            oi.size,
                            oi.color,
                            p.name as title,
                            p.image_url,
                            p.description
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = ?
                    `;

                    this.db.all(itemsQuery, [orderId], (itemsErr, items) => {
                        if (itemsErr) {
                            reject(itemsErr);
                        } else {
                            resolve({
                                ...order,
                                items: items
                            });
                        }
                    });
                }
            });
        });
    }

    // Метод для закрытия соединения
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Соединение с базой данных закрыто');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

// Экспорт класса
module.exports = Database;