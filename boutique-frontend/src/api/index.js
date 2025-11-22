import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (userData) => API.post('/auth/register', userData),
    login: (credentials) => API.post('/auth/login', credentials),
    getProfile: () => API.get('/auth/me'),
    }

    export const productsAPI = {
    getProducts: (params) => API.get('/products', { params }),
    getProduct: (id) => API.get(`/products/${id}`),
    createProduct: (productData) => API.post('/products', productData),
    }

    export const ordersAPI = {
    createOrder: (orderData) => API.post('/orders', orderData),
    getOrders: (userId) => API.get('/orders', { params: { userId } }),
    }

export default API