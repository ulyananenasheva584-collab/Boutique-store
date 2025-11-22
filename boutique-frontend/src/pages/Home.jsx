    import { useEffect, useState } from 'react'
    import { Link } from 'react-router-dom'
    import useStore from '../store/useStore'
    import { productsAPI } from '../api'
    import toast from 'react-hot-toast'

    export default function Home() {
    const { products, setProducts, addToCart } = useStore()
    const [categories] = useState(['dresses', 'tops', 'bottoms', 'accessories'])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadProducts()
    }, [selectedCategory])

    async function loadProducts() {
        try {
        setError('')
        const response = await productsAPI.getProducts({
            category: selectedCategory || undefined
        })
        setProducts(response.data.products)
        } catch (error) {
        console.error('Error loading products:', error)
        setError('Failed to load products. Please check if backend is running.')
        setProducts([])
        } finally {
        setLoading(false)
        }
    }

    function handleAddToCart(product, e) {
        e.preventDefault()
        e.stopPropagation()
        
        const cartProduct = {
        ...product,
        selectedSize: product.sizes ? product.sizes.split(',')[0].trim() : '',
        quantity: 1
        }
        
        addToCart(cartProduct)
        toast.success(`Added ${product.title} to cart!`)
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Loading products...</div>
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
                onClick={loadProducts}
                className="vogue-button"
            >
                Retry
            </button>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-16">
            <h1 className="text-4xl font-normal tracking-wide mb-4">BOUTIQUE</h1>
            <p className="text-sm tracking-widest uppercase">Spring Collection 2026</p>
        </div>

        {/* Фильтры по категориям */}
        <div className="flex flex-wrap gap-2 mb-16 justify-center">
            <button
            className={`px-6 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                !selectedCategory 
                ? 'bg-black text-white' 
                : 'bg-white text-black border border-black hover:bg-black hover:text-white'
            }`}
            onClick={() => setSelectedCategory('')}
            >
            All
            </button>
            {categories.map(category => (
            <button
                key={category}
                className={`px-6 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                selectedCategory === category 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
                onClick={() => setSelectedCategory(category)}
            >
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
            ))}
        </div>

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
            <div key={product.id} className="vogue-card group">
                <Link to={`/product/${product.id}`} className="block">
                {/* Изображение товара */}
                <div className="w-full h-80 relative overflow-hidden">
                    <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = '/images/placeholder.jpg'
                        e.target.className = 'w-full h-full object-cover bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'
                    }}
                    />
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500"></div>
                </div>
                
                <div className="p-6">
                    <div className="mb-4">
                    <h3 className="text-lg font-normal mb-2 tracking-wide leading-tight">
                        {product.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 tracking-wider uppercase">{product.brand}</p>
                    <p className="text-sm font-normal mb-3">${product.price}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                    {product.stock > 0 ? (
                        <span className="text-xs tracking-wider uppercase">
                        In Stock
                        </span>
                    ) : (
                        <span className="text-xs tracking-wider uppercase text-gray-500">
                        Out of Stock
                        </span>
                    )}
                    <span className="text-xs text-gray-600 tracking-wider uppercase">
                        {product.category}
                    </span>
                    </div>

                    {/* Кнопка добавления в корзину */}
                    <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 text-xs tracking-widest uppercase transition-all duration-300 ${
                        product.stock > 0
                        ? 'vogue-button'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                    }`}
                    >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
                </Link>
            </div>
            ))}
        </div>

        {/* Сообщение если нет товаров */}
        {products.length === 0 && !loading && (
            <div className="text-center py-20">
            <div className="text-xl mb-4">No products found</div>
            <p className="text-sm tracking-wide">Try selecting a different category</p>
            </div>
        )}
        </div>
    )
    }