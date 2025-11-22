import { create } from 'zustand'
import { authAPI } from '../api'

const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    products: [],
    product: null,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    
    login: async (credentials) => {
    const response = await authAPI.login(credentials)
    const { accessToken, user } = response.data
    
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    
    set({ user, isAuthenticated: true })
    return { success: true }
    },
    
    register: async (userData) => {
        const response = await authAPI.register(userData)
        return { success: true, data: response.data }
    },
    
    logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
        set({ user: null, isAuthenticated: false, cart: [] })
    },
    
    addToCart: (product) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.id === product.id)
        
        let newCart
        if (existingItem) {
        newCart = cart.map(item =>
            item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        } else {
        newCart = [...cart, { ...product, quantity: 1 }]
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