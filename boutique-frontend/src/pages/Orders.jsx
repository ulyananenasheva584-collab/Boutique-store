import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import useStore from '../store/useStore'
import { getUserOrders } from '../api'

export default function Orders() {
    const { user } = useStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            loadOrders()
        } else {
            setLoading(false)
        }
    }, [user])

    async function loadOrders() {
        try {
            setLoading(true)
            setError(null)
            
            const response = await getUserOrders(user.id)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const result = await response.json()
            
            if (result.success) {
                setOrders(result.data || [])
            } else if (Array.isArray(result)) {
                setOrders(result)
            } else {
                setError(result.error || 'Неизвестная структура ответа')
                setOrders([])
            }
        } catch (error) {
            console.error('Error loading orders:', error)
            setError('Ошибка при загрузке заказов: ' + error.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} className="text-green-600" />
            case 'delivered': return <Truck size={16} className="text-blue-600" />
            case 'pending': return <Clock size={16} className="text-yellow-600" />
            case 'cancelled': return <XCircle size={16} className="text-red-600" />
            default: return <Package size={16} className="text-gray-600" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-800 border-green-200'
            case 'delivered': return 'bg-blue-50 text-blue-800 border-blue-200'
            case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
            case 'cancelled': return 'bg-red-50 text-red-800 border-red-200'
            default: return 'bg-gray-50 text-gray-800 border-gray-200'
        }
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <Package size={64} className="mx-auto mb-4 text-gray-400" />
                    <div className="text-xl font-normal text-gray-600 mb-4 tracking-wide">Необходима авторизация</div>
                    <p className="text-gray-500 tracking-wide">Войдите в систему, чтобы просмотреть свои заказы</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600 tracking-wide">Загрузка заказов...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <XCircle size={64} className="mx-auto mb-4 text-red-400" />
                    <div className="text-xl font-normal text-red-600 mb-4 tracking-wide">{error}</div>
                    <button 
                        onClick={loadOrders}
                        className="vogue-button px-8 py-3 tracking-widest uppercase"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Заголовок */}
            <div className="text-center mb-12">
                <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide">МОИ ЗАКАЗЫ</h1>
                <p className="text-sm tracking-widest uppercase text-gray-600">
                    {orders.length > 0 ? `${orders.length} заказ${orders.length === 1 ? '' : orders.length > 1 && orders.length < 5 ? 'а' : 'ов'}` : 'История ваших покупок'}
                </p>
            </div>
            
            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <Package size={80} className="mx-auto mb-6 text-gray-300" />
                    <div className="text-xl font-normal text-gray-600 mb-4 tracking-wide">Заказы не найдены</div>
                    <p className="text-gray-500 tracking-wide max-w-md mx-auto">
                        Начните покупать в нашем бутике, чтобы увидеть историю заказов здесь
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => (
                        <div key={order.id} className="border border-black rounded-lg overflow-hidden bg-white">
                            {/* Шапка заказа */}
                            <div className="border-b border-black p-6 bg-gray-50">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black text-white p-3 rounded">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-normal tracking-wide">Заказ #{order.id}</h3>
                                            <p className="text-sm text-gray-600 tracking-wide">
                                                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <p className="text-xl font-normal text-gray-900">
                                            ${order.total_amount?.toFixed(2) || order.total?.toFixed(2)}
                                        </p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status === 'completed' ? 'Завершен' : 
                                                order.status === 'pending' ? 'В обработке' :
                                                order.status === 'cancelled' ? 'Отменен' : 
                                                order.status === 'delivered' ? 'Доставлен' :
                                                order.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Товары в заказе */}
                            <div className="p-6">
                                <h4 className="font-normal text-sm tracking-widest uppercase text-gray-600 mb-4 flex items-center gap-2">
                                    <Package size={16} />
                                    Товары в заказе
                                </h4>
                                <div className="space-y-4">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-20 h-20 flex-shrink-0">
                                                    <img 
                                                        src={item.image_url || item.product?.image_url || '/images/placeholder.jpg'} 
                                                        alt={item.title || item.product?.title}
                                                        className="w-full h-full object-cover rounded border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyOC42ODYzIDIwIDI2IDIyLjY4NjMgMjYgMjZDMjYgMjkuMzEzNyAyOC42ODYzIDMyIDMyIDMyQzM1LjMxMzcgMzIgMzggMjkuMzEzNyAzOCAyNkMzOCAyMi42ODYzIDM1LjMxMzcgMjAgMzIgMjBaTTMyIDM2QzI2LjQ3NzIgMzYgMjIgNDAuNDc3MiAyMiA0NlY0OEg0MlY0NkM0MiA0MC40NzcyIDM3LjUyMjggMzYgMzIgMzZaIiBmaWxsPSIjOEU5MzlBIi8+Cjwvc3ZnPgo='
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-normal text-gray-900 mb-2 leading-tight">
                                                        {item.title || item.product?.title}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                        <span className="bg-gray-100 px-2 py-1 rounded">Кол-во: {item.quantity}</span>
                                                        <span className="bg-gray-100 px-2 py-1 rounded">${(item.price || item.product?.price)?.toFixed(2)}</span>
                                                        {item.size && (
                                                            <span className="bg-gray-100 px-2 py-1 rounded">Размер: {item.size}</span>
                                                        )}
                                                        {item.color && (
                                                            <span className="bg-gray-100 px-2 py-1 rounded">Цвет: {item.color}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="font-normal text-gray-900 text-lg whitespace-nowrap ml-4">
                                                ${((item.price || item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Информация о доставке */}
                            {(order.address || order.phone) && (
                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                    <h4 className="font-normal text-sm tracking-widest uppercase text-gray-600 mb-3 flex items-center gap-2">
                                        <Truck size={16} />
                                        Информация о доставке
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {order.address && (
                                            <div>
                                                <p className="text-gray-600 mb-1">Адрес доставки</p>
                                                <p className="font-normal text-gray-900">{order.address}</p>
                                            </div>
                                        )}
                                        {order.phone && (
                                            <div>
                                                <p className="text-gray-600 mb-1">Контактный телефон</p>
                                                <p className="font-normal text-gray-900">{order.phone}</p>
                                            </div>
                                        )}
                                        {order.shipping_method && (
                                            <div>
                                                <p className="text-gray-600 mb-1">Способ доставки</p>
                                                <p className="font-normal text-gray-900">{order.shipping_method}</p>
                                            </div>
                                        )}
                                        {order.payment_method && (
                                            <div>
                                                <p className="text-gray-600 mb-1">Способ оплаты</p>
                                                <p className="font-normal text-gray-900">{order.payment_method}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}