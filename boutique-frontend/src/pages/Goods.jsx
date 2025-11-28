    import { useEffect, useState } from 'react'
    import { Link } from 'react-router-dom'
    import useStore from '../store/useStore'
    import toast from 'react-hot-toast'
    import { Filter, X } from 'lucide-react'

    export default function Goods() {
    const { products, loadProducts, addToCart } = useStore()
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [priceFilter, setPriceFilter] = useState('all')
    const [brandFilter, setBrandFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadInitialData()
    }, [])

    // В функции handleAddToCart обновите названия полей:
function handleAddToCart(product, e) {
    e.preventDefault()
    e.stopPropagation()
    
    const cartProduct = {
        ...product,
        title: product.name || product.title, // Поддержка обоих названий
        selectedSize: product.sizes ? product.sizes.split(',')[0].trim() : '',
        quantity: 1
    }
    
    addToCart(cartProduct)
    toast.success(`${cartProduct.title} добавлен в корзину!`)
}

    async function loadInitialData() {
        try {
        setError('')
        const result = await loadProducts()
        
        if (result.success) {
            // Получаем уникальные категории из товаров
            const uniqueCategories = [...new Set(result.products.map(p => p.category))].filter(Boolean)
            setCategories(uniqueCategories)
        } else {
            setError(result.error)
        }
        } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        setError('Не удалось загрузить товары')
        } finally {
        setLoading(false)
        }
    }

    // Фильтрация и сортировка товаров
    const filteredProducts = products
        .filter(product => {
        const categoryMatch = !selectedCategory || product.category === selectedCategory
        const priceMatch = priceFilter === 'all' || 
            (priceFilter === 'under50' && product.price < 50) ||
            (priceFilter === '50-100' && product.price >= 50 && product.price <= 100) ||
            (priceFilter === '100-200' && product.price >= 100 && product.price <= 200) ||
            (priceFilter === 'over200' && product.price > 200)
        const brandMatch = brandFilter === 'all' || 
            product.brand?.toLowerCase().includes(brandFilter.toLowerCase())
        
        return categoryMatch && priceMatch && brandMatch
        })
        .sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
            return a.price - b.price
            case 'price-high':
            return b.price - a.price
            case 'name':
            return a.title.localeCompare(b.title)
            case 'newest':
            default:
            return new Date(b.created_at) - new Date(a.created_at)
        }
        })

    // Получаем уникальные бренды для фильтра
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]

    // Сброс всех фильтров
    function clearAllFilters() {
        setSelectedCategory('')
        setPriceFilter('all')
        setBrandFilter('all')
        setSortBy('newest')
    }

    // Проверяем, есть ли активные фильтры
    const hasActiveFilters = selectedCategory || priceFilter !== 'all' || brandFilter !== 'all'

    function handleAddToCart(product, e) {
        e.preventDefault()
        e.stopPropagation()
        
        const cartProduct = {
        ...product,
        selectedSize: product.sizes ? product.sizes.split(',')[0].trim() : '',
        quantity: 1
        }
        
        addToCart(cartProduct)
        toast.success(`${product.title} добавлен в корзину!`)
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Загрузка товаров...</div>
        </div>
        )
    }

    if (error) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="border border-black p-4 mb-4">
            <p className="text-sm">{error}</p>
            </div>
            <div className="text-center">
            <button 
                onClick={loadInitialData}
                className="vogue-button"
            >
                Попробовать снова
            </button>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Заголовок */}
        <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-normal mb-4 tracking-wide">BOUTIQUE</h1>
            <p className="text-sm tracking-widest uppercase">Весенняя коллекция 2026</p>
        </div>

        {/* Кнопка мобильных фильтров */}
        <div className="md:hidden flex justify-center mb-6">
            <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 vogue-button text-sm px-6 py-3"
            >
            <Filter size={16} />
            Фильтры {hasActiveFilters && `(${filteredProducts.length})`}
            </button>
        </div>

        {/* Фильтры и сортировка */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-12 space-y-6`}>
            {/* Основные фильтры */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Фильтр по категориям */}
            <div className="flex flex-wrap gap-2">
                <button
                className={`px-4 sm:px-6 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                    !selectedCategory 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
                onClick={() => setSelectedCategory('')}
                >
                Все
                </button>
                {categories.map(category => (
                <button
                    key={category}
                    className={`px-4 sm:px-6 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                    selectedCategory === category 
                        ? 'bg-black text-white' 
                        : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                >
                    {category}
                </button>
                ))}
            </div>

            {/* Сортировка */}
            <div className="flex items-center gap-3">
                <span className="text-sm tracking-wider uppercase hidden sm:block">Сортировка:</span>
                <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-black px-4 py-2 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                <option value="newest">Сначала новые</option>
                <option value="price-low">Цена: по возрастанию</option>
                <option value="price-high">Цена: по убыванию</option>
                <option value="name">Название: А-Я</option>
                </select>
            </div>
            </div>

            {/* Расширенные фильтры */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Фильтр по цене */}
            <div className="flex items-center gap-3">
                <span className="text-sm tracking-wider uppercase whitespace-nowrap">Цена:</span>
                <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="border border-black px-4 py-2 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                <option value="all">Все цены</option>
                <option value="under50">До $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="over200">Более $200</option>
                </select>
            </div>

            {/* Фильтр по бренду */}
            <div className="flex items-center gap-3">
                <span className="text-sm tracking-wider uppercase whitespace-nowrap">Бренд:</span>
                <select 
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="border border-black px-4 py-2 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                <option value="all">Все бренды</option>
                {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
                </select>
            </div>

            {/* Кнопка сброса фильтров */}
            {hasActiveFilters && (
                <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-sm tracking-widest uppercase border border-black px-4 py-2 hover:bg-gray-100 transition-all duration-300"
                >
                <X size={16} />
                Сбросить все
                </button>
            )}
            </div>

            {/* Информация о результатах */}
            <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
                Показано {filteredProducts.length} из {products.length} товаров
            </span>
            {hasActiveFilters && (
                <button
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-black transition-colors"
                >
                Сбросить фильтры
                </button>
            )}
            </div>
        </div>

        {/* Кнопка закрытия мобильных фильтров */}
        {showFilters && (
            <div className="md:hidden text-center mb-6">
            <button
                onClick={() => setShowFilters(false)}
                className="text-sm tracking-widest uppercase border border-black px-6 py-2 hover:bg-black hover:text-white transition-all duration-300"
            >
                Показать товары
            </button>
            </div>
        )}

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
            <div key={product.id} className="vogue-card group">
                <Link to={`/product/${product.id}`} className="block">
                {/* Изображение товара */}
                <div className="w-full h-64 sm:h-80 relative overflow-hidden">
                    <img 
                    src={product.image_url || '/images/placeholder.jpg'} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = '/images/placeholder.jpg'
                    }}
                    />
                </div>
                
                <div className="p-4 sm:p-6">
                    <div className="mb-4">
                    <h3 className="text-lg font-normal mb-2 tracking-wide leading-tight">
                        {product.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 tracking-wider uppercase">{product.brand}</p>
                    <p className="text-sm font-normal mb-3">${product.price}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                    <span className="text-xs tracking-wider uppercase text-green-600">
                        В наличии
                    </span>
                    <span className="text-xs text-gray-600 tracking-wider uppercase">
                        {product.category}
                    </span>
                    </div>

                    {/* Кнопка добавления в корзину */}
                    <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="vogue-button w-full py-3 text-xs tracking-widest uppercase transition-all duration-300"
                    >
                    В корзину
                    </button>
                </div>
                </Link>
            </div>
            ))}
        </div>

        {/* Сообщение если нет товаров */}
        {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
            <div className="text-xl mb-4">Товары не найдены</div>
            <p className="text-sm tracking-wide mb-6">Попробуйте выбрать другие фильтры</p>
            {hasActiveFilters && (
                <button
                onClick={clearAllFilters}
                className="vogue-button"
                >
                Сбросить все фильтры
                </button>
            )}
            </div>
        )}
        </div>
    )
    }