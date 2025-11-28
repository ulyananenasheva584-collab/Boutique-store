// api.js
const API_BASE = 'http://localhost:3000/api';

// Локальное хранилище для товаров
const LOCAL_STORAGE_KEY = 'vogue_shop_products';

const getLocalProducts = () => {
    try {
        const products = localStorage.getItem(LOCAL_STORAGE_KEY);
        return products ? JSON.parse(products) : [];
    } catch (error) {
        console.error('Ошибка загрузки товаров из localStorage:', error);
        return [];
    }
};

const saveLocalProducts = (products) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
        console.error('Ошибка сохранения товаров в localStorage:', error);
    }
};

// Функция для объединения серверных и локальных товаров
const mergeProducts = (serverProducts, localProducts) => {
    const serverProductsMap = new Map();
    const localProductsMap = new Map();
    
    // Добавляем серверные товары
    serverProducts.forEach(product => {
        serverProductsMap.set(product.id, product);
    });
    
    // Добавляем локальные товары (только те, которых нет на сервере)
    localProducts.forEach(product => {
        if (!serverProductsMap.has(product.id)) {
            localProductsMap.set(product.id, product);
        }
    });
    
    // Объединяем
    return [...Array.from(serverProductsMap.values()), ...Array.from(localProductsMap.values())];
};

// Авторизация
export const login = (email, password) => {
    return fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
};

// Регистрация  
export const register = (name, email, password) => {
    return fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
};

// Товары - комбинированный подход
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE}/products`);
        
        if (response.ok) {
            const serverData = await response.json();
            const localProducts = getLocalProducts();
            
            // Если сервер вернул товары, объединяем с локальными
            if (serverData.success && serverData.data) {
                const mergedProducts = mergeProducts(serverData.data, localProducts);
                
                // Сохраняем объединенный список
                saveLocalProducts(mergedProducts);
                
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: mergedProducts,
                        count: mergedProducts.length
                    })
                };
            }
        }
        
        throw new Error('Server response not ok');
        
    } catch (error) {
        console.log('Используем локальные товары:', error.message);
        // Возвращаем товары из localStorage
        const localProducts = getLocalProducts();
        return {
            ok: true,
            json: async () => ({
                success: true,
                data: localProducts,
                count: localProducts.length
            })
        };
    }
};

export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        
        if (response.ok) {
            return response;
        }
        throw new Error('Server not available');
    } catch (error) {
        console.log('Ищем товар локально:', error.message);
        // Ищем товар в localStorage
        const localProducts = getLocalProducts();
        const product = localProducts.find(p => p.id == id);
        
        if (product) {
            return {
                ok: true,
                json: async () => ({
                    success: true,
                    data: product
                })
            };
        } else {
            return {
                ok: false,
                json: async () => ({
                    success: false,
                    error: 'Товар не найден'
                })
            };
        }
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Если успешно создали на сервере, синхронизируем localStorage
            if (data.success) {
                const localProducts = getLocalProducts();
                const updatedProducts = localProducts.filter(p => p.id !== data.data.id); // Удаляем старую версию если есть
                updatedProducts.push(data.data);
                saveLocalProducts(updatedProducts);
            }
            
            return response;
        }
        throw new Error('Server not available');
    } catch (error) {
        console.log('Создаем товар локально:', error.message);
        // Создаем товар в localStorage
        const localProducts = getLocalProducts();
        const newProduct = {
            ...productData,
            id: Date.now(), // Генерируем уникальный ID
            created_at: new Date().toISOString(),
            title: productData.name, // Добавляем title для совместимости
            brand: productData.brand || 'Vogue' // Добавляем бренд по умолчанию
        };
        
        const updatedProducts = [...localProducts, newProduct];
        saveLocalProducts(updatedProducts);
        
        return {
            ok: true,
            json: async () => ({
                success: true,
                data: newProduct
            })
        };
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Если успешно обновили на сервере, синхронизируем localStorage
            if (data.success) {
                const localProducts = getLocalProducts();
                const updatedProducts = localProducts.map(product => 
                    product.id == productId ? { ...product, ...productData } : product
                );
                saveLocalProducts(updatedProducts);
            }
            
            return response;
        }
        throw new Error('Server not available');
    } catch (error) {
        console.log('Обновляем товар локально:', error.message);
        // Обновляем товар в localStorage
        const localProducts = getLocalProducts();
        const updatedProducts = localProducts.map(product => 
            product.id == productId ? { ...product, ...productData, title: productData.name } : product
        );
        saveLocalProducts(updatedProducts);
        
        return {
            ok: true,
            json: async () => ({
                success: true,
                data: { ...productData, id: productId }
            })
        };
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            // Если успешно удалили на сервере, синхронизируем localStorage
            const localProducts = getLocalProducts();
            const updatedProducts = localProducts.filter(product => product.id != productId);
            saveLocalProducts(updatedProducts);
            
            return response;
        }
        throw new Error('Server not available');
    } catch (error) {
        console.log('Удаляем товар локально:', error.message);
        // Удаляем товар из localStorage
        const localProducts = getLocalProducts();
        const updatedProducts = localProducts.filter(product => product.id != productId);
        saveLocalProducts(updatedProducts);
        
        return {
            ok: true,
            json: async () => ({
                success: true
            })
        };
    }
};

// Отзывы
export const getProductReviews = (productId) => {
    return fetch(`${API_BASE}/products/${productId}/reviews`);
};

export const getUserReviews = (userId) => {
    return fetch(`${API_BASE}/users/${userId}/reviews`);
};

export const createReview = (reviewData) => {
    return fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
    });
};

export const deleteReview = (reviewId) => {
    return fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
    });
};

// Магазины
export const getShops = () => {
    return fetch(`${API_BASE}/shops`);
};

export const createShop = (shopData) => {
    return fetch(`${API_BASE}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData)
    });
};

export const createOrder = async (orderData) => {
    console.log('Sending order data:', orderData);
    
    const serverOrderData = {
        user_id: orderData.userId,
        total_amount: orderData.total,
        address: orderData.address,
        phone: orderData.phone,
        items: (orderData.items || []).map(item => ({
            product_id: item.id || item.productId,
            quantity: item.quantity || 1,
            price: item.price,
            size: item.size || item.selectedSize || "M",
            color: item.color || "Black"
        }))
    };

    console.log('Transformed order data:', serverOrderData);
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serverOrderData)
        });

        const result = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            data: result
        };
        
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
};

export const getUserOrders = (userId) => {
    return fetch(`${API_BASE}/users/${userId}/orders`);
};

export const getOrderById = (orderId) => {
    return fetch(`${API_BASE}/orders/${orderId}`);
};