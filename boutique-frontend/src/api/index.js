    const API_BASE = 'http://localhost:3000/api';

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

    // Товары - ВАЖНО: убедись что эти функции есть
    export const getProducts = () => {
    return fetch(`${API_BASE}/products`);
    };

    export const getProductById = (id) => {
    return fetch(`${API_BASE}/products/${id}`);
    };

    export const createProduct = (productData) => {
    return fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    };

    export const updateProduct = (productId, productData) => {
    return fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    };

    export const deleteProduct = (productId) => {
    return fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
    });
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
    
    // Возвращаем результат независимо от статуса
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