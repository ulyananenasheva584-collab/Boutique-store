    import { useState } from 'react'
    import { Link } from 'react-router-dom'
    import useStore from '../store/useStore'
    import { ordersAPI } from '../api'
    import toast from 'react-hot-toast'

    export default function Cart() {
    const { cart, removeFromCart, updateCartQuantity, clearCart, user, isAuthenticated } = useStore()
    const [checkoutData, setCheckoutData] = useState({
        address: '',
        phone: ''
    })
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    async function handleCheckout() {
        if (!isAuthenticated) {
        toast.error('Please login to checkout')
        return
        }

        if (!checkoutData.address || !checkoutData.phone) {
        toast.error('Please fill in all fields')
        return
        }

        setIsCheckingOut(true)
        
        try {
        const orderData = {
            userId: user.id,
            items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
            })),
            total: total,
            address: checkoutData.address,
            phone: checkoutData.phone
        }

        await ordersAPI.createOrder(orderData)
        clearCart()
        toast.success('Order placed successfully!')
        } catch (error) {
        toast.error('Failed to place order')
        console.error('Checkout error:', error)
        } finally {
        setIsCheckingOut(false)
        }
    }

    if (cart.length === 0) {
        return (
        <div className="container mx-auto px-6 py-20 text-center">
            <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-normal mb-4 tracking-wide">Your cart is empty</h2>
            <p className="text-sm tracking-wide mb-8">Add some products to your cart to see them here</p>
            <Link 
                to="/" 
                className="vogue-button inline-block"
            >
                Continue Shopping
            </Link>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-normal mb-12 text-center tracking-wide">Shopping Cart</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Список товаров в корзине */}
            <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
                <div key={item.id} className="border border-black p-6">
                <div className="flex items-start space-x-6">
                                {/* Изображение товара */}
                <div className="w-24 h-24 border border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                    e.target.src = '/images/placeholder.jpg'
                    e.target.className = 'w-full h-full object-cover bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'
                    }}
                    />
</div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-normal mb-2 tracking-wide">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-1 tracking-wider uppercase">{item.brand}</p>
                    {item.selectedSize && (
                        <p className="text-sm mb-3 tracking-wide">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-lg font-normal mb-4">${item.price}</p>
                    
                    {/* Управление количеством */}
                    <div className="flex items-center space-x-4 mb-4">
                        <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-black text-sm hover:bg-black hover:text-white transition-all duration-300"
                        >
                        -
                        </button>
                        <span className="text-sm tracking-wide min-w-8 text-center">{item.quantity}</span>
                        <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-black text-sm hover:bg-black hover:text-white transition-all duration-300"
                        >
                        +
                        </button>
                    </div>
                    </div>

                    {/* Общая стоимость и удаление */}
                    <div className="text-right">
                    <p className="text-lg font-normal mb-2">${(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm tracking-wider uppercase hover:text-gray-600 transition-colors duration-300"
                    >
                        Remove
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>

            {/* Панель оформления заказа */}
            <div className="border border-black p-8 h-fit">
            <h3 className="text-xl font-normal mb-8 tracking-wide text-center">Order Summary</h3>
            
            {!isAuthenticated ? (
                <div className="text-center">
                <div className="border border-black p-4 mb-6">
                    <p className="text-sm tracking-wide">Please log in to complete your purchase</p>
                </div>
                <Link 
                    to="/login"
                    className="vogue-button block w-full text-center"
                >
                    Login to Checkout
                </Link>
                </div>
            ) : (
                <>
                {/* Форма оформления заказа */}
                <div className="space-y-6 mb-8">
                    <div>
                    <label className="block text-sm mb-3 tracking-wider uppercase">Delivery Address</label>
                    <input
                        type="text"
                        placeholder="Enter your full address"
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm mb-3 tracking-wider uppercase">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    />
                    </div>
                </div>
                
                {/* Итоговая стоимость */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm tracking-wide">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm tracking-wide">
                    <span>Shipping:</span>
                    <span>$0.00</span>
                    </div>
                    <div className="border-t border-black pt-4">
                    <div className="flex justify-between text-lg font-normal">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    </div>
                </div>
                
                {/* Кнопка оформления заказа */}
                <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full py-4 text-sm tracking-widest uppercase mb-4 transition-all duration-300 ${
                    isCheckingOut
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                        : 'vogue-button'
                    }`}
                >
                    {isCheckingOut ? 'Processing...' : 'Place Order'}
                </button>

                {/* Кнопка очистки корзины */}
                <button 
                    onClick={clearCart}
                    className="vogue-button-secondary w-full py-3 text-sm tracking-widest uppercase"
                >
                    Clear Cart
                </button>
                </>
            )}
            </div>
        </div>
        </div>
    )
    }