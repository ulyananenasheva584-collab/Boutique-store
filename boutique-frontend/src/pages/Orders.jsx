import { useEffect, useState } from 'react'
import useStore from '../store/useStore'
import { ordersAPI } from '../api'

export default function Orders() {
    const { user } = useStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
        loadOrders()
        }
    }, [user])

    async function loadOrders() {
        const response = await ordersAPI.getOrders(user.id)
        setOrders(response.data)
        setLoading(false)
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg text-gray-600">Loading...</div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h2>
        
        {orders.length === 0 ? (
            <div className="text-center py-12">
            <div className="text-xl text-gray-600 mb-4">No orders found</div>
            <p className="text-gray-500">Start shopping to see your orders here!</p>
            </div>
        ) : (
            <div className="space-y-6">
            {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <p className="text-gray-600 text-sm">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    </div>
                    <div className="text-right">
                    <p className="text-lg font-bold text-primary">${order.total}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-black text-white' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {order.status}
                    </span>
                    </div>
                </div>
                
                <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <img 
                            src={item.image_url || '/placeholder-clothing.jpg'} 
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold">${item.price}</p>
                        </div>
                    ))}
                    </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                    <strong>Delivery Address:</strong> {order.address}
                    </p>
                    <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {order.phone}
                    </p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    )
}