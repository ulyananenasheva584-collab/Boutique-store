import { useEffect, useState } from 'react'
import { Plus, Users, ShoppingBag, Star, TrendingUp, Package, MapPin, BarChart3, Trash2, Edit, Filter, Download } from 'lucide-react'
import useStore from '../store/useStore'
import BarChart from '../components/Charts/BarChart'
import PieChart from '../components/Charts/PieChart';
import LineChart from '../components/Charts/LineChart';
import { getProducts, createProduct, deleteProduct, updateProduct, getShops, createShop } from '../api'
import toast from 'react-hot-toast'

// Mock данные для графиков
const данныеПродаж = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
        {
            label: 'Выручка',
            data: [125000, 148000, 132000, 165000, 152000, 188000],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
        },
    ],
    onBarClick: (data) => {
        console.log('Клик по столбцу:', data);
        toast.success(`Выбрано: ${data.label} - ₽${data.value.toLocaleString()}`);
    }
};

const данныеРоста = {
    labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
    datasets: [
        {
            label: 'Новые пользователи',
            data: [324, 587, 892, 1245],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        {
            label: 'Просмотры',
            data: [2845, 3921, 4567, 5321],
            backgroundColor: 'rgba(102, 102, 102, 0.8)',
        },
    ],
    onBarClick: (data) => {
        toast.success(`${data.dataset}: ${data.label} - ${data.value} пользователей`);
    }
};

const данныеПродажРегионы = {
    labels: ['Москва', 'СПб', 'Регионы', 'Онлайн'],
    datasets: [
        {
            label: 'Продажи по регионам',
            data: [45, 25, 20, 10],
            backgroundColor: [
                '#000000',
                '#333333',
                '#666666', 
                '#999999'
            ],
        },
    ],
    onBarClick: (data) => {
        toast.success(`Регион "${data.label}": ${data.value}% продаж`);
    }
};

export default function Admin() {
    const { user, products, loadProducts } = useStore()
    const [shops, setShops] = useState([])
    const [activeTab, setActiveTab] = useState('дашборд')
    const [loading, setLoading] = useState(false)
    const [deletingProducts, setDeletingProducts] = useState({})
    const [editingProduct, setEditingProduct] = useState(null)
    const [dateRange, setDateRange] = useState('month')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('все')

    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        image_url: '',
        category: ''
    })
    const [shopForm, setShopForm] = useState({
        address: '',
        phone: '',
        latitude: '',
        longitude: ''
    })

    // Динамические данные для категорий
    const категории = [...new Set(products.map(p => p.category))].filter(Boolean)
    const динамическиеДанныеКатегорий = {
        labels: категории.length > 0 ? категории : ['Нет категорий'],
        datasets: [
            {
                label: 'Товары по категориям',
                data: категории.length > 0 
                    ? категории.map(category => 
                        products.filter(p => p.category === category).length
                    )
                    : [1],
                backgroundColor: [
                    'rgba(0, 0, 0, 0.8)',
                    'rgba(50, 50, 50, 0.8)',
                    'rgba(100, 100, 100, 0.8)',
                    'rgba(150, 150, 150, 0.8)',
                    'rgba(200, 200, 200, 0.8)',
                ],
                borderWidth: 1,
            },
        ],
        onBarClick: (data) => {
            if (категории.length > 0) {
                toast.success(`Категория "${data.label}": ${data.value} товаров`);
            }
        }
    }

    // Фильтрация продуктов
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'все' || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    useEffect(() => {
        loadAdminData()
    }, [])

    async function loadAdminData() {
        try {
            await loadProducts()
            await loadShops()
        } catch (error) {
            console.error('Ошибка загрузки данных админки:', error)
        }
    }

    async function loadShops() {
        try {
            const response = await getShops()
            const data = await response.json()
            if (data.success) {
                setShops(data.data)
            }
        } catch (error) {
            console.error('Ошибка загрузки магазинов:', error)
        }
    }

    async function handleCreateProduct(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await createProduct({
                ...productForm,
                price: parseFloat(productForm.price)
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Товар успешно создан!')
                setProductForm({
                    name: '',
                    price: '',
                    description: '',
                    image_url: '',
                    category: ''
                })
                await loadProducts()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Ошибка создания товара')
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateProduct(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await updateProduct(editingProduct.id, {
                ...productForm,
                price: parseFloat(productForm.price)
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Товар успешно обновлен!')
                setEditingProduct(null)
                setProductForm({
                    name: '',
                    price: '',
                    description: '',
                    image_url: '',
                    category: ''
                })
                await loadProducts()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Ошибка обновления товара')
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteProduct(productId) {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.')) {
            return;
        }

        setDeletingProducts(prev => ({ ...prev, [productId]: true }));

        try {
            const response = await deleteProduct(productId);
            const data = await response.json();

            if (data.success) {
                toast.success('Товар успешно удален!');
                await loadProducts();
            } else {
                toast.error(data.error || 'Ошибка при удалении товара');
            }
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            toast.error('Ошибка при удалении товара');
        } finally {
            setDeletingProducts(prev => ({ ...prev, [productId]: false }));
        }
    }

    function handleEditProduct(product) {
        setEditingProduct(product)
        setProductForm({
            name: product.name || product.title || '',
            price: product.price || '',
            description: product.description || '',
            image_url: product.image_url || '',
            category: product.category || ''
        })
    }

    function cancelEdit() {
        setEditingProduct(null)
        setProductForm({
            name: '',
            price: '',
            description: '',
            image_url: '',
            category: ''
        })
    }

    async function handleCreateShop(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await createShop({
                ...shopForm,
                latitude: shopForm.latitude ? parseFloat(shopForm.latitude) : null,
                longitude: shopForm.longitude ? parseFloat(shopForm.longitude) : null
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Магазин успешно создан!')
                setShopForm({
                    address: '',
                    phone: '',
                    latitude: '',
                    longitude: ''
                })
                await loadShops()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Ошибка создания магазина')
        } finally {
            setLoading(false)
        }
    }

    const статистика = [
        { 
            icon: Users, 
            label: 'Всего пользователей', 
            value: '1,234', 
            change: '+12%' 
        },
        { 
            icon: ShoppingBag, 
            label: 'Всего товаров', 
            value: products.length.toString(), 
            change: '+5%' 
        },
        { 
            icon: Star, 
            label: 'Всего отзывов', 
            value: '89', 
            change: '+8%' 
        },
        { 
            icon: TrendingUp, 
            label: 'Общая выручка', 
            value: '₽1,234,567', 
            change: '+15%' 
        },
    ]

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="border border-black p-6 max-w-md mx-auto">
                    <p className="text-sm mb-4">Войдите в систему для доступа к панели администратора</p>
                    <p className="text-xs text-gray-600">Необходима авторизация для просмотра этой страницы.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Заголовок */}
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide">ПАНЕЛЬ АДМИНИСТРАТОРА</h1>
                <p className="text-sm tracking-widest uppercase">Управление вашим бутиком</p>
            </div>

            {/* Навигация */}
            <div className="border-b border-black mb-8">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'дашборд', label: 'Дашборд' },
                        { id: 'товары', label: 'Товары' },
                        { id: 'магазины', label: 'Магазины' },
                        { id: 'аналитика', label: 'Аналитика' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`px-6 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                                activeTab === tab.id
                                ? 'bg-black text-white border border-black'
                                : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Дашборд */}
            {activeTab === 'дашборд' && (
                <div className="space-y-8">
                    {/* Статистические карточки */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {статистика.map((стат, index) => (
                            <div key={index} className="border border-black p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <стат.icon size={24} className="text-gray-600" />
                                    <span className={`text-sm font-medium ${
                                        стат.change.includes('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {стат.change}
                                    </span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-normal mb-1">{стат.value}</p>
                                <p className="text-xs tracking-wider uppercase text-gray-600">{стат.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Графики */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-black p-6">
                            <h3 className="text-lg font-normal mb-4 tracking-wide">Динамика продаж</h3>
                            <div className="h-80">
                                <LineChart 
                                    data={данныеПродаж} 
                                />
                            </div>
                        </div>
                        
                        <div className="bg-white border border-black p-6">
                            <h3 className="text-lg font-normal mb-4 tracking-wide">Продажи по регионам</h3>
                            <div className="h-80">
                                <PieChart 
                                    data={данныеПродажРегионы}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Управление товарами */}
            {activeTab === 'товары' && (
                <div className="space-y-6">
                    {/* Фильтры и поиск */}
                    <div className="bg-white border border-black p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h3 className="text-lg font-normal tracking-wide">
                                Управление товарами ({filteredProducts.length})
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Поиск товаров..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border border-black px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="border border-black px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="все">Все категории</option>
                                    {категории.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>

                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Форма создания/редактирования товара */}
                        <div className="border border-black p-6">
                            <h3 className="text-lg font-normal mb-6 tracking-wide flex items-center gap-3">
                                <Plus size={20} />
                                {editingProduct ? 'Редактировать товар' : 'Создать новый товар'}
                            </h3>
                            
                            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Название товара</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        required
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="Например: Платье вечернее"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Цена</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        required
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Категория</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="Например: Платья"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">URL изображения</label>
                                    <input
                                        type="url"
                                        value={productForm.image_url}
                                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Описание</label>
                                    <textarea
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        rows="3"
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="Подробное описание товара..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="vogue-button flex-1 py-4 text-sm tracking-widest uppercase disabled:opacity-50"
                                    >
                                        {loading ? 'Сохранение...' : (editingProduct ? 'Обновить товар' : 'Создать товар')}
                                    </button>
                                    {editingProduct && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="border border-black px-6 py-4 text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
                                        >
                                            Отмена
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Список товаров */}
                        <div className="border border-black p-6">
                            <h3 className="text-lg font-normal mb-6 tracking-wide flex items-center gap-3">
                                <Package size={20} />
                                Каталог товаров
                            </h3>
                            
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="border-b border-gray-200 pb-4 last:border-0 group">
                                        <div className="flex items-start gap-4">
                                            <img 
                                                src={product.image_url || '/images/placeholder.jpg'} 
                                                alt={product.name || product.title}
                                                className="w-16 h-16 object-cover border border-black flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyOC42ODYzIDIwIDI2IDIyLjY4NjMgMjYgMjZDMjYgMjkuMzEzNyAyOC42ODYzIDMyIDMyIDMyQzM1LjMxMzcgMzIgMzggMjkuMzEzNyAzOCAyNkMzOCAyMi42ODYzIDM1LjMxMzcgMjAgMzIgMjBaTTMyIDM2QzI2LjQ3NzIgMzYgMjIgNDAuNDc3MiAyMiA0NlY0OEg0MlY0NkM0MiA0MC40NzcyIDM3LjUyMjggMzYgMzIgMzZaIiBmaWxsPSIjOEU5MzlBIi8+Cjwvc3ZnPgo='
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-normal text-sm truncate">{product.name || product.title}</h4>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            className="p-1 text-gray-600 hover:text-black transition-colors"
                                                            title="Редактировать товар"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            disabled={deletingProducts[product.id]}
                                                            className="p-1 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                                                            title="Удалить товар"
                                                        >
                                                            {deletingProducts[product.id] ? (
                                                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Trash2 size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1">₽{product.price} • {product.category}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                                                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                                    <span>ID: {product.id}</span>
                                                    <span>
                                                        {product.created_at && new Date(product.created_at).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-8">
                                        <Package size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600">Товары не найдены</p>
                                        <p className="text-sm text-gray-500 mt-2">Используйте форму для добавления первого товара</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Управление магазинами */}
            {activeTab === 'магазины' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Форма создания магазина */}
                    <div className="border border-black p-6">
                        <h3 className="text-lg font-normal mb-6 tracking-wide flex items-center gap-3">
                            <Plus size={20} />
                            Добавить новый магазин
                        </h3>
                        
                        <form onSubmit={handleCreateShop} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2 tracking-wider uppercase">Адрес</label>
                                <textarea
                                    value={shopForm.address}
                                    onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                                    required
                                    rows="3"
                                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                    placeholder="Введите полный адрес магазина"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2 tracking-wider uppercase">Телефон</label>
                                <input
                                    type="tel"
                                    value={shopForm.phone}
                                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                    placeholder="+7 (XXX) XXX-XX-XX"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Широта</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={shopForm.latitude}
                                        onChange={(e) => setShopForm({ ...shopForm, latitude: e.target.value })}
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="55.755826"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 tracking-wider uppercase">Долгота</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={shopForm.longitude}
                                        onChange={(e) => setShopForm({ ...shopForm, longitude: e.target.value })}
                                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                                        placeholder="37.617300"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="vogue-button w-full py-4 text-sm tracking-widest uppercase disabled:opacity-50"
                            >
                                {loading ? 'Создание...' : 'Добавить магазин'}
                            </button>
                        </form>
                    </div>

                    {/* Список магазинов */}
                    <div className="border border-black p-6">
                        <h3 className="text-lg font-normal mb-6 tracking-wide flex items-center gap-3">
                            <MapPin size={20} />
                            Адреса магазинов ({shops.length})
                        </h3>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {shops.map(shop => (
                                <div key={shop.id} className="border-b border-gray-200 pb-4 last:border-0">
                                    <h4 className="font-normal text-sm mb-2">Бутик #{shop.id}</h4>
                                    <p className="text-xs text-gray-600 mb-2">{shop.address}</p>
                                    {shop.phone && (
                                        <p className="text-xs text-gray-500">Телефон: {shop.phone}</p>
                                    )}
                                    {shop.latitude && shop.longitude && (
                                        <p className="text-xs text-gray-500">
                                            Координаты: {shop.latitude}, {shop.longitude}
                                        </p>
                                    )}
                                </div>
                            ))}
                            
                            {shops.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-gray-600">Магазины не найдены</p>
                                    <p className="text-sm text-gray-500 mt-2">Добавьте первый магазин</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Аналитика */}
            {activeTab === 'аналитика' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="border border-black p-6">
                            <h3 className="text-lg font-normal mb-4 tracking-wide flex items-center gap-3">
                                <BarChart3 size={20} />
                                Распределение по категориям
                            </h3>
                            <div className="h-80">
                                <BarChart 
                                    data={динамическиеДанныеКатегорий} 
                                />
                            </div>
                        </div>

                        <div className="border border-black p-6">
                            <h3 className="text-lg font-normal mb-4 tracking-wide">Продажи по месяцам</h3>
                            <div className="h-80">
                                <BarChart 
                                    data={данныеПродаж} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border border-black p-6">
                        <h3 className="text-lg font-normal mb-4 tracking-wide">Динамика роста</h3>
                        <div className="h-80">
                            <BarChart 
                                data={данныеРоста}  
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}