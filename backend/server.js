// Подключаем необходимые модули
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// Подключаем базу
const Database = require('./database');

// Инициализация Express и порта
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Инициализация базы данных
const db = new Database();

// Middleware для обработки ошибок базы данных
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await db.register({ name, email, password });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

    // Обновление товара
// Добавь эти routes в server.js после существующих routes

// Обновление товара
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, price, description, image_url, category } = req.body;
        
        const result = await db.updateProduct(productId, {
        name,
        price: parseFloat(price),
        description,
        image_url,
        category
        });
        
        res.json({
        success: true,
        data: result
        });
    } catch (error) {
        res.status(400).json({
        success: false,
        error: error.message
        });
    }
    });

    // Удаление товара
    app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const result = await db.deleteProduct(productId);
        
        res.json({
        success: true,
        data: result
        });
    } catch (error) {
        res.status(400).json({
        success: false,
        error: error.message
        });
    }
    });

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.login({ email, password });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

// Получение всех товаров
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Получение товара по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await db.getProductById(productId);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Получение отзывов по product_id
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const reviews = await db.getReviewsByProductId(productId);
        res.json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Получение отзывов по user_id
app.get('/api/users/:id/reviews', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const reviews = await db.getReviewsByUserId(userId);
        res.json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Создание отзыва
app.post('/api/reviews', async (req, res) => {
    try {
        const { user_id, product_id, review, stars } = req.body;
        const result = await db.createReview({
            user_id: parseInt(user_id),
            product_id: parseInt(product_id),
            review,
            stars: parseInt(stars)
        });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Получение всех магазинов
app.get('/api/shops', async (req, res) => {
    try {
        const shops = await db.getAllShops();
        res.json({
            success: true,
            data: shops,
            count: shops.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Создание заказа
app.post('/api/orders', async (req, res) => {
    try {
        console.log('=== ORDER CREATION REQUEST ===');
        console.log('Body received:', JSON.stringify(req.body, null, 2));
        
        const { user_id, total_amount, address, phone, items } = req.body;

        // Детальная проверка каждого поля
        if (!user_id) {
        return res.status(400).json({
            success: false,
            error: 'Отсутствует user_id'
        });
        }

        if (!total_amount) {
        return res.status(400).json({
            success: false,
            error: 'Отсутствует total_amount'
        });
        }

        if (!address) {
        return res.status(400).json({
            success: false,
            error: 'Отсутствует address'
        });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Отсутствует или неверный формат items'
        });
        }

        console.log('All validation passed, creating order...');

        const result = await db.createOrder({
        user_id: parseInt(user_id),
        total_amount: parseFloat(total_amount),
        address,
        phone: phone || null,
        items: items.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            size: item.size || null,
            color: item.color || null
        }))
        });
        
        console.log('Order created successfully:', result);
        
        res.status(201).json({
        success: true,
        data: result
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({
        success: false,
        error: error.message
        });
    }
    });

// Создание магазина
app.post('/api/shops', async (req, res) => {
    try {
        const { address, phone, latitude, longitude } = req.body;
        const result = await db.createShop({
            address,
            phone,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
        });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// НОВЫЕ ROUTES ДЛЯ ЗАКАЗОВ

// Создание заказа
app.post('/api/orders', async (req, res) => {
  try {
    console.log('=== ORDER CREATION REQUEST ===');
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    
    // Поддерживаем оба варианта названий полей
    const user_id = req.body.user_id || req.body.userId;
    const total_amount = req.body.total_amount || req.body.total;
    const address = req.body.address;
    const phone = req.body.phone;
    const items = req.body.items;

    console.log('Processed fields:', { user_id, total_amount, address, phone, items });

    // Детальная проверка каждого поля
    if (!user_id) {
      console.log('MISSING: user_id/userId');
      return res.status(400).json({
        success: false,
        error: 'Отсутствует user_id'
      });
    }

    if (!total_amount) {
      console.log('MISSING: total_amount/total');
      return res.status(400).json({
        success: false,
        error: 'Отсутствует total_amount'
      });
    }

    if (!address) {
      console.log('MISSING: address'); 
      return res.status(400).json({
        success: false,
        error: 'Отсутствует address'
      });
    }

    if (!items || !Array.isArray(items)) {
      console.log('MISSING or INVALID: items');
      return res.status(400).json({
        success: false,
        error: 'Отсутствует или неверный формат items'
      });
    }

    if (items.length === 0) {
      console.log('EMPTY: items array');
      return res.status(400).json({
        success: false,
        error: 'Список товаров не может быть пустым'
      });
    }

    // Проверяем каждый item (также поддерживаем оба варианта)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product_id = item.product_id || item.id;
      const quantity = item.quantity;
      const price = item.price;

      if (!product_id) {
        console.log(`MISSING: product_id/id in item ${i}`);
        return res.status(400).json({
          success: false,
          error: `Отсутствует product_id в товаре ${i + 1}`
        });
      }
      if (!quantity) {
        console.log(`MISSING: quantity in item ${i}`);
        return res.status(400).json({
          success: false,
          error: `Отсутствует quantity в товаре ${i + 1}`
        });
      }
      if (!price) {
        console.log(`MISSING: price in item ${i}`);
        return res.status(400).json({
          success: false,
          error: `Отсутствует price в товаре ${i + 1}`
        });
      }
    }

    console.log('All validation passed, creating order...');

    const result = await db.createOrder({
      user_id: parseInt(user_id),
      total_amount: parseFloat(total_amount),
      address,
      phone: phone || null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id || item.id),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        size: item.size || null,
        color: item.color || null
      }))
    });
    
    console.log('Order created successfully:', result);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Получение заказов пользователя
app.get('/api/users/:userId/orders', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const orders = await db.getUserOrders(userId);
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Получение конкретного заказа
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const order = await db.getOrderById(orderId);
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API работает',
    endpoints: {
      auth: {
        register: 'POST /api/register',
        login: 'POST /api/login'
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      reviews: {
        getByProduct: 'GET /api/products/:id/reviews',
        getByUser: 'GET /api/users/:id/reviews',
        create: 'POST /api/reviews'
      },
      shops: {
        getAll: 'GET /api/shops',
        create: 'POST /api/shops'
      },
      orders: {
        create: 'POST /api/orders',
        getUserOrders: 'GET /api/users/:userId/orders',
        getOrder: 'GET /api/orders/:orderId'
      }
    }
  });
});

// Middleware для обработки ошибок
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// Временная проверка таблицы
app.get('/api/debug/tables', async (req, res) => {
    try {
        const tables = await new Promise((resolve, reject) => {
            db.db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const tableInfo = {};
        for (const table of tables) {
            const info = await new Promise((resolve, reject) => {
                db.db.all(`PRAGMA table_info(${table.name})`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            tableInfo[table.name] = info;
        }

        res.json({ success: true, tables: tableInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Запуск сервера
const startServer = async () => {

    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
    });
};

// Завершение работы сервера при прерывании процесса
process.on('SIGINT', async () => {
    console.log('\nЗавершение работы сервера...');
    if (db) {
        await db.close();
    }
    process.exit(0);
});

startServer().catch(console.error);