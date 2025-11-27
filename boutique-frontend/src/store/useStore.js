    import { create } from 'zustand'
    import { login, register, getProducts, getProductById } from '../api'

    const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    products: [],
    product: null,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    
    // Новый метод логина под новый API
    login: async (email, password) => {
        try {
        const response = await login(email, password)
        const data = await response.json()
        
        if (data.success) {
            const user = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            created_at: data.data.created_at
            }
            
            localStorage.setItem('user', JSON.stringify(user))
            set({ user, isAuthenticated: true })
            return { success: true }
        } else {
            return { success: false, error: data.error }
        }
        } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: 'Login failed' }
        }
    },
    
    // Новый метод регистрации под новый API
    register: async (name, email, password) => {
        try {
        const response = await register(name, email, password)
        const data = await response.json()
        
        if (data.success) {
            return { success: true, data: data.data }
        } else {
            return { success: false, error: data.error }
        }
        } catch (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Registration failed' }
        }
    },
    
    logout: () => {
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
        set({ user: null, isAuthenticated: false, cart: [] })
    },
    
    // Загрузка товаров
    loadProducts: async () => {
        try {
        const response = await getProducts()
        const data = await response.json()
        
        if (data.success) {
            // Адаптируем структуру товаров под фронтенд
            const adaptedProducts = data.data.map(product => ({
            id: product.id,
            title: product.name, // name -> title для совместимости
            name: product.name,
            price: product.price,
            description: product.description,
            image_url: product.image_url,
            category: product.category,
            stock: 10, // Временное значение, пока нет в API
            brand: product.category, // Временное значение
            color: 'Various', // Временное значение
            sizes: 'S,M,L,XL', // Временное значение
            created_at: product.created_at
            }))
            
            set({ products: adaptedProducts })
            return { success: true, products: adaptedProducts }
        } else {
            return { success: false, error: data.error }
        }
        } catch (error) {
        console.error('Load products error:', error)
        return { success: false, error: 'Failed to load products' }
        }
    },
    
    // Загрузка конкретного товара
    loadProduct: async (id) => {
        try {
        const response = await getProductById(id)
        const data = await response.json()
        
        if (data.success) {
            // Адаптируем структуру товара
            const adaptedProduct = {
            id: data.data.id,
            title: data.data.name,
            name: data.data.name,
            price: data.data.price,
            description: data.data.description,
            image_url: data.data.image_url,
            category: data.data.category,
            stock: 10, // Временное значение
            brand: data.data.category,
            color: 'Various',
            sizes: 'S,M,L,XL',
            created_at: data.data.created_at
            }
            
            set({ product: adaptedProduct })
            return { success: true, product: adaptedProduct }
        } else {
            return { success: false, error: data.error }
        }
        } catch (error) {
        console.error('Load product error:', error)
        return { success: false, error: 'Failed to load product' }
        }
    },
    
    // Методы корзины (пока локальные, без бекенда)
    addToCart: (product) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.id === product.id && item.selectedSize === product.selectedSize)
        
        let newCart
        if (existingItem) {
        newCart = cart.map(item =>
            item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
        } else {
        newCart = [...cart, { ...product, quantity: product.quantity || 1 }]
        }
        
        localStorage.setItem('cart', JSON.stringify(newCart))
        set({ cart: newCart })
    },
    
    removeFromCart: (productId) => {
        const { cart } = get()
        const newCart = cart.filter(item => item.id !== productId)
        
        localStorage.setItem('cart', JSON.stringify(newCart))
        set({ cart: newCart })
    },
    
    updateCartQuantity: (productId, quantity) => {
        const { cart } = get()
        const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0)
        
        localStorage.setItem('cart', JSON.stringify(newCart))
        set({ cart: newCart })
    },
    
    clearCart: () => {
        localStorage.removeItem('cart')
        set({ cart: [] })
    },
    
    setProducts: (products) => set({ products }),
    setProduct: (product) => set({ product }),
    }))

    export default useStore