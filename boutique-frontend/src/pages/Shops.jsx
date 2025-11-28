import { useEffect, useState, useRef } from 'react'
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react'
import { getShops } from '../api'
import useStore from '../store/useStore'

// Тестовые данные магазинов с координатами
const TEST_SHOPS = [
    {
        id: 1,
        address: "Москва, ул. Тверская, д. 10",
        phone: "+7 (495) 123-45-67",
        latitude: 55.761665,
        longitude: 37.608966
    },
    {
        id: 2,
        address: "Санкт-Петербург, Невский проспект, д. 25",
        phone: "+7 (812) 234-56-78",
        latitude: 59.935834,
        longitude: 30.325894
    },
    {
        id: 3,
        address: "Казань, ул. Баумана, д. 15",
        phone: "+7 (843) 345-67-89",
        latitude: 55.790441,
        longitude: 49.107431
    },
    {
        id: 4,
        address: "Екатеринбург, ул. Вайнера, д. 8",
        phone: "+7 (343) 456-78-90",
        latitude: 56.838002,
        longitude: 60.597295
    },
    {
        id: 5,
        address: "Новосибирск, Красный проспект, д. 30",
        phone: "+7 (383) 567-89-01",
        latitude: 55.030199,
        longitude: 82.920430
    }
];

export default function Shops() {
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedShop, setSelectedShop] = useState(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const { user } = useStore()

    useEffect(() => {
        loadShops()
    }, [])

    // Автоматически выбираем первый магазин при загрузке
    useEffect(() => {
        if (shops.length > 0 && !selectedShop) {
            setSelectedShop(shops[0])
        }
    }, [shops, selectedShop])

    // Загрузка Яндекс Карт
    useEffect(() => {
        if (shops.length > 0 && selectedShop && !window.ymaps) {
            const script = document.createElement('script')
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=b96dd83e-b2e7-4a77-a981-d135734705f0&lang=ru_RU'
            script.onload = () => {
                window.ymaps.ready(() => {
                    setMapLoaded(true)
                    initMap()
                })
            }
            script.onerror = () => {
                console.error('Ошибка загрузки Яндекс.Карт')
                setMapLoaded(true)
            }
            document.head.appendChild(script)
        } else if (window.ymaps && selectedShop && shops.length > 0) {
            initMap()
        }

        // Очистка при размонтировании
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy()
                mapInstanceRef.current = null
            }
        }
    }, [selectedShop, shops])

    // Инициализация карты
    const initMap = () => {
        if (!window.ymaps || !selectedShop || !mapRef.current || shops.length === 0) {
            console.log('Условия не выполнены для инициализации карты')
            return
        }

        console.log('Инициализация карты для магазина:', selectedShop)

        // Уничтожаем предыдущую карту если она существует
        if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy()
            mapInstanceRef.current = null
        }

        try {
            // Определяем центр карты
            let center = [55.7558, 37.6173] // Москва по умолчанию
            let zoom = 10

            if (selectedShop.latitude && selectedShop.longitude) {
                center = [selectedShop.latitude, selectedShop.longitude]
                zoom = 15
                console.log('Используем координаты магазина:', center)
            } else {
                console.log('Используем координаты по умолчанию')
            }

            const map = new window.ymaps.Map(mapRef.current, {
                center: center,
                zoom: zoom,
                controls: ['zoomControl', 'fullscreenControl']
            })

            mapInstanceRef.current = map

            // Очищаем все предыдущие метки
            map.geoObjects.removeAll()

            // Добавляем метки для всех магазинов
            shops.forEach(shop => {
                if (shop.latitude && shop.longitude) {
                    const isSelected = shop.id === selectedShop.id;
                    
                    const placemark = new window.ymaps.Placemark(
                        [shop.latitude, shop.longitude],
                        {
                            hintContent: `Бутик #${shop.id}`,
                            balloonContent: `
                                <div style="padding: 10px; font-family: Arial, sans-serif; max-width: 250px;">
                                    <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #000;">Бутик #${shop.id}</h3>
                                    <p style="margin: 0 0 5px 0; color: #333;">${shop.address}</p>
                                    ${shop.phone ? `<p style="margin: 0 0 5px 0; color: #333;">📞 ${shop.phone}</p>` : ''}
                                    <p style="margin: 0; color: #666;">🕐 Пн-Вс: 10:00 - 22:00</p>
                                    ${isSelected ? '<p style="margin: 5px 0 0 0; color: #000; font-weight: bold;">✓ Выбран</p>' : ''}
                                </div>
                            `
                        },
                        {
                            preset: isSelected ? 'islands#blackIcon' : 'islands#grayIcon',
                            iconColor: isSelected ? '#000000' : '#666666'
                        }
                    )

                    // Обработчик клика по метке магазина
                    placemark.events.add('click', () => {
                        console.log('Клик по метке магазина:', shop.id)
                        setSelectedShop(shop)
                    })

                    map.geoObjects.add(placemark)
                }
            })

            console.log('Всего меток на карте:', map.geoObjects.getLength())

        } catch (error) {
            console.error('Ошибка инициализации карты:', error)
        }
    }

    // Ссылка для открытия в полной версии карты
    const getFullMapUrl = (shop) => {
        if (shop.latitude && shop.longitude) {
            return `https://yandex.ru/maps/?pt=${shop.longitude},${shop.latitude}&z=15&l=map`
        } else if (shop.address) {
            return `https://yandex.ru/maps/?text=${encodeURIComponent(shop.address)}`
        }
        return 'https://yandex.ru/maps'
    }

    // Ссылка для построения маршрута
    const getRouteUrl = (shop) => {
        if (shop.latitude && shop.longitude) {
            return `https://yandex.ru/maps/?rtext=~${shop.latitude},${shop.longitude}&rtt=auto`
        } else if (shop.address) {
            return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(shop.address)}&rtt=auto`
        }
        return 'https://yandex.ru/maps'
    }

    async function loadShops() {
        try {
            setError('')
            const response = await getShops()
            const data = await response.json()
            
            if (data.success && data.data && data.data.length > 0) {
                console.log('Загружены магазины с сервера:', data.data)
                setShops(data.data)
            } else {
                // Если нет магазинов с сервера, используем тестовые данные
                console.log('Используем тестовые данные магазинов')
                setShops(TEST_SHOPS)
            }
        } catch (error) {
            console.error('Ошибка загрузки магазинов, используем тестовые данные:', error)
            setShops(TEST_SHOPS)
            setError('Не удалось загрузить магазины с сервера, показаны демо-данные')
        } finally {
            setLoading(false)
        }
    }

    // Функция для проверки координат магазина
    const hasValidCoordinates = (shop) => {
        return shop.latitude && shop.longitude && 
               !isNaN(parseFloat(shop.latitude)) && 
               !isNaN(parseFloat(shop.longitude))
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Загрузка магазинов...</div>
                </div>
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

            {/* Основной контент */}
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
                                onClick={() => {
                                    console.log('Выбран магазин:', shop)
                                    setSelectedShop(shop)
                                }}
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

                                    {hasValidCoordinates(shop) ? (
                                        <div className="flex items-center gap-3 text-xs text-green-600">
                                            <MapPin size={12} />
                                            <span>Есть координаты на карте</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-xs text-yellow-600">
                                            <MapPin size={12} />
                                            <span>Нет координат для карты</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        !error && (
                            <div className="border border-black p-8 text-center">
                                <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 mb-2">Магазины не найдены</p>
                                <p className="text-sm text-gray-500">Добавьте магазины через панель администратора</p>
                            </div>
                        )
                    )}
                </div>

                {/* Карта и детали выбранного магазина */}
                <div className="space-y-6">
                    <h2 className="text-xl font-normal mb-6 tracking-wider uppercase">
                        {selectedShop ? `Бутик #${selectedShop.id}` : 'Выберите магазин'}
                    </h2>
                    
                    {selectedShop ? (
                        <div className="space-y-6">
                            {/* Интерактивная карта */}
                            <div className="border border-black">
                                <div className="bg-black text-white p-4 flex items-center justify-between">
                                    <h3 className="text-lg font-normal tracking-wide">Карта расположения</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} />
                                        <span>Яндекс.Карты</span>
                                    </div>
                                </div>
                                <div 
                                    ref={mapRef}
                                    className="w-full h-80 bg-gray-100 relative"
                                >
                                    {!mapLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-sm text-gray-600">Загрузка карты...</p>
                                            </div>
                                        </div>
                                    )}
                                    {mapLoaded && !hasValidCoordinates(selectedShop) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                                                <p className="text-gray-600">Нет координат для отображения на карте</p>
                                                <p className="text-sm text-gray-500 mt-2">Используйте кнопку ниже для открытия в Яндекс.Картах</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Детальная информация */}
                            <div className="border border-black p-6">
                                <h3 className="text-lg font-normal mb-4 tracking-wide">Информация о магазине</h3>
                                
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-2 tracking-wide">Адрес</h4>
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                            <span className="tracking-wide leading-relaxed">{selectedShop.address}</span>
                                        </div>
                                    </div>

                                    {selectedShop.phone && (
                                        <div>
                                            <h4 className="font-medium mb-2 tracking-wide">Телефон</h4>
                                            <div className="flex items-center gap-3">
                                                <Phone size={16} className="flex-shrink-0" />
                                                <span className="tracking-wide">{selectedShop.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-medium mb-2 tracking-wide">Часы работы</h4>
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="flex-shrink-0" />
                                            <span className="tracking-wide">Пн-Вс: 10:00 - 22:00</span>
                                        </div>
                                    </div>

                                    {hasValidCoordinates(selectedShop) && (
                                        <div>
                                            <h4 className="font-medium mb-2 tracking-wide">Координаты</h4>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <MapPin size={14} />
                                                <span>{selectedShop.latitude.toFixed(6)}, {selectedShop.longitude.toFixed(6)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <a 
                                        href={getFullMapUrl(selectedShop)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 vogue-button text-sm px-6 py-3 flex-1"
                                    >
                                        <ExternalLink size={16} />
                                        Открыть в Яндекс.Картах
                                    </a>
                                    <a 
                                        href={getRouteUrl(selectedShop)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 border border-black text-sm px-6 py-3 hover:bg-black hover:text-white transition-all duration-300 flex-1"
                                    >
                                        <Navigation size={16} />
                                        Построить маршрут
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-black p-12 text-center">
                            <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">Выберите магазин из списка</p>
                            <p className="text-sm text-gray-500 mt-2">для просмотра подробной информации</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Информация о всех магазинах */}
            {shops.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <div className="text-center">
                        <h3 className="text-lg font-normal mb-6 tracking-wide">ВСЕ МАГАЗИНЫ СЕТИ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map(shop => (
                                <div key={shop.id} className="border border-gray-200 p-4 text-center hover:border-black transition-colors">
                                    <MapPin size={24} className="mx-auto mb-2 text-gray-600" />
                                    <h4 className="font-medium mb-2">Бутик #{shop.id}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{shop.address}</p>
                                    {shop.phone && (
                                        <p className="text-xs text-gray-500">Тел: {shop.phone}</p>
                                    )}
                                    {hasValidCoordinates(shop) ? (
                                        <p className="text-xs text-green-600">✓ Есть на карте</p>
                                    ) : (
                                        <p className="text-xs text-yellow-600">⚠ Нет координат</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Футер */}
            <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="text-center text-sm text-gray-600">
                    <p>Посетите наши бутики и откройте для себя мир моды</p>
                    <p className="mt-2">Работаем для вас ежедневно с 10:00 до 22:00</p>
                </div>
            </div>
        </div>
    )
}