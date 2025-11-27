    import { useNavigate } from 'react-router-dom'
    import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
    import useStore from '../store/useStore'
    import { createOrder } from '../api'
    import toast from 'react-hot-toast'

    export default function Cart() {
    const { cart, removeFromCart, updateCartQuantity, clearCart, user } = useStore()
    const navigate = useNavigate()

    function handleQuantityChange(productId, newQuantity) {
        if (newQuantity < 1) {
        removeFromCart(productId)
        } else {
        updateCartQuantity(productId, newQuantity)
        }
    }

async function handleCheckout() {
    if (!user) {
        toast.error('Пожалуйста, войдите в систему для оформления заказа')
        navigate('/login')
        return
    }

    if (cart.length === 0) {
        toast.error('Ваша корзина пуста')
        return
    }

    try {
        console.log('Cart items:', cart);
        
        const orderData = {
            userId: user.id,
            items: cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                size: item.selectedSize || "M",
                color: "Black"
            })),
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            address: 'Адрес по умолчанию',
            phone: 'Телефон по умолчанию'
        };

        console.log('Sending order data:', orderData);
        
        const result = await createOrder(orderData);
        
        // Проверяем успешность через result.ok или result.data.success
        if (result.ok || result.data?.success) {
            toast.success('Заказ успешно создан!')
            clearCart()
            navigate('/orders')
        } else {
            // Если заказ создался на сервере, но вернулась ошибка
            if (result.status === 201 || result.data?.id) {
                toast.success('Заказ успешно создан!')
                clearCart()
                navigate('/orders')
            } else {
                toast.error(result.data?.error || 'Ошибка при создании заказа')
            }
        }
    } catch (error) {
        console.error('Ошибка оформления заказа:', error)
        // Проверяем, возможно заказ все равно создался
        toast.error('Не удалось оформить заказ. Проверьте страницу заказов.')
    }
}

    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    if (cart.length === 0) {
        return (
        <div className="container mx-auto px-4 sm:px-6 py-12">
            <div className="text-center">
            <ShoppingBag size={64} className="mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-normal mb-4 tracking-wide">Ваша корзина пуста</h2>
            <p className="text-sm text-gray-600 mb-8 tracking-wide">
                Откройте нашу коллекцию и добавьте товары в корзину
            </p>
            <button
                onClick={() => navigate('/')}
                className="vogue-button"
            >
                Продолжить покупки
            </button>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-normal mb-8 tracking-wide">Корзина покупок</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="border border-black p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Изображение товара */}
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <img 
                        src={item.image_url || '/images/placeholder.jpg'} 
                        alt={item.title}
                        className="w-full h-full object-cover border border-black"
                        onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA0MEM1Ny4zNzI2IDQwIDUyIDQ1LjM3MjYgNTIgNTJDNTIgNTguNjI3NCA1Ny4zNzI2IDY0IDY0IDY0QzcwLjYyNzQgNjQgNzYgNTguNjI3NCA3NiA1MkM3NiA0NS4zNzI2IDcwLjYyNzQgNDAgNjQgNDBaTTY0IDcyQzUyLjk1NDMgNzIgNDQgODAuOTU0MyA0NCA5MlY5Nkg4NFY5MkM4NCA4MC45NTQzIDc1LjA0NTcgNzIgNjQgNzJaIiBmaWxsPSIjOEU5MzlBIi8+Cjwvc3ZnPgo='
                        }}
                    />
                    </div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-normal tracking-wide">{item.title}</h3>
                        <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-black transition-colors"
                        >
                        <Trash2 size={20} />
                        </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 tracking-wide">{item.brand}</p>
                    
                    {item.selectedSize && (
                        <p className="text-sm text-gray-600 mb-2">
                        Размер: <span className="font-medium">{item.selectedSize}</span>
                        </p>
                    )}
                    
                    <p className="text-lg font-normal mb-4">${item.price}</p>
                    
                    {/* Управление количеством */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-black">
                        <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-4 py-1 text-sm min-w-12 text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                        </div>
                        
                        <span className="text-lg font-normal">
                        ${(item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
            
            {/* Итоговая сумма */}
            <div className="border border-black p-6 h-fit">
            <h3 className="text-lg font-normal mb-6 tracking-wide">Сводка заказа</h3>
            
            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                <span>Промежуточный итог</span>
                <span>${calculateTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                <span>Доставка</span>
                <span>$0.00</span>
                </div>
                
                <div className="flex justify-between text-sm">
                <span>Налог</span>
                <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-black pt-4">
                <div className="flex justify-between text-lg font-normal">
                    <span>Итого</span>
                    <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                </div>
                </div>
            </div>
            
            <button
                onClick={handleCheckout}
                className="vogue-button w-full py-4 text-sm tracking-widest uppercase mb-4"
            >
                Перейти к оформлению
            </button>
            
            <button
                onClick={clearCart}
                className="w-full py-3 border border-black text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
            >
                Очистить корзину
            </button>
            
            <div className="mt-6 text-xs text-gray-600">
                <p>• Бесплатная доставка для заказов от $100</p>
                <p>• 30-дневная политика возврата</p>
                <p>• Безопасное оформление заказа</p>
            </div>
            </div>
        </div>
        </div>
    )
    }