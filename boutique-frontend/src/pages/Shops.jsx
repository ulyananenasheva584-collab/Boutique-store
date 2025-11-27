    import { useEffect, useState } from 'react'
    import { MapPin, Phone, Clock } from 'lucide-react'
    import { getShops } from '../api'
    import useStore from '../store/useStore'

    export default function Shops() {
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedShop, setSelectedShop] = useState(null)
    const { user } = useStore()

    useEffect(() => {
        loadShops()
    }, [])

    async function loadShops() {
        try {
        setError('')
        const response = await getShops()
        const data = await response.json()
        
        if (data.success) {
            setShops(data.data)
        } else {
            setError(data.error)
        }
        } catch (error) {
        console.error('Ошибка загрузки магазинов:', error)
        setError('Не удалось загрузить магазины')
        } finally {
        setLoading(false)
        }
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Загрузка магазинов...</div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide">НАШИ БУТИКИ</h1>
            <p className="text-sm tracking-widest uppercase">Посетите наши физические магазины</p>
        </div>

        {error && (
            <div className="border border-black p-4 mb-8 text-center">
            <p className="text-sm">{error}</p>
            <button 
                onClick={loadShops}
                className="vogue-button mt-4 text-sm px-6 py-2"
            >
                Попробовать снова
            </button>
            </div>
        )}

        {/* Сетка магазинов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Список магазинов */}
            <div className="space-y-6">
            <h2 className="text-xl font-normal mb-6 tracking-wider uppercase">Местоположения магазинов</h2>
            
            {shops.length > 0 ? (
                shops.map((shop) => (
                <div 
                    key={shop.id}
                    className={`border border-black p-6 cursor-pointer transition-all duration-300 ${
                    selectedShop?.id === shop.id ? 'bg-black text-white' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedShop(shop)}
                >
                    <h3 className="text-lg font-normal mb-4 tracking-wide">Бутик #{shop.id}</h3>
                    
                    <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="tracking-wide leading-relaxed">{shop.address}</span>
                    </div>
                    
                    {shop.phone && (
                        <div className="flex items-center gap-3">
                        <Phone size={16} className="flex-shrink-0" />
                        <span className="tracking-wide">{shop.phone}</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <Clock size={16} className="flex-shrink-0" />
                        <span className="tracking-wide">Пн-Вс: 10:00 - 22:00</span>
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="border border-black p-8 text-center">
                <p className="text-gray-600 mb-4">Магазины недоступны</p>
                </div>
            )}
            </div>

            {/* Информация о выбранном магазине */}
            <div className="border border-black p-6">
            <h2 className="text-xl font-normal mb-6 tracking-wider uppercase">
                {selectedShop ? `Бутик #${selectedShop.id}` : 'Информация о магазине'}
            </h2>
            
            {selectedShop ? (
                <div className="space-y-6">
                {/* Заглушка для карты */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                    <div className="text-center">
                    <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Интерактивная карта</p>
                    <p className="text-xs text-gray-500">
                        {selectedShop.address}
                    </p>
                    </div>
                </div>

                {/* Детальная информация */}
                <div className="space-y-4">
                    <h4 className="text-lg font-normal tracking-wide">Информация о магазине</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Адрес</span>
                        <p className="tracking-wide leading-relaxed">{selectedShop.address}</p>
                    </div>
                    
                    {selectedShop.phone && (
                        <div>
                        <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Телефон</span>
                        <p className="tracking-wide">{selectedShop.phone}</p>
                        </div>
                    )}
                    
                    <div>
                        <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Часы работы</span>
                        <p className="tracking-wide">Понедельник - Воскресенье: 10:00 - 22:00</p>
                    </div>
                    
                    <div>
                        <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Услуги</span>
                        <p className="tracking-wide">Персональный шопинг, Примерка, Доставка</p>
                    </div>
                    </div>
                </div>
                </div>
            ) : (
                <div className="text-center py-12">
                <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Выберите магазин для просмотра информации</p>
                <p className="text-sm text-gray-500">
                    Нажмите на любой бутик из списка, чтобы увидеть его местоположение и услуги
                </p>
                </div>
            )}
            </div>
        </div>
        </div>
    )
    }