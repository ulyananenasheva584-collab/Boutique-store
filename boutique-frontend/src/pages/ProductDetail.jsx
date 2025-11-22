    import { useEffect, useState } from 'react'
    import { useParams, Link } from 'react-router-dom'
    import useStore from '../store/useStore'
    import { productsAPI } from '../api'
    import toast from 'react-hot-toast'

    export default function ProductDetail() {
    const { id } = useParams()
    const { product, setProduct, addToCart } = useStore()
    const [selectedSize, setSelectedSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadProduct()
    }, [id])

    async function loadProduct() {
        try {
        setError('')
        const response = await productsAPI.getProduct(id)
        setProduct(response.data)
        } catch (error) {
        console.error('Error loading product:', error)
        setError('Product not found')
        } finally {
        setLoading(false)
        }
    }

    function handleAddToCart() {
        if (!selectedSize && product.sizes) {
        toast.error('Please select a size')
        return
        }

        addToCart({
        ...product,
        selectedSize,
        quantity
        })
        toast.success('Added to cart!')
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Loading product...</div>
        </div>
        )
    }

    if (error || !product) {
        return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="border border-black p-6 max-w-md mx-auto mb-6">
            <p className="text-sm">{error || 'Product not found'}</p>
            </div>
            <Link 
            to="/"
            className="vogue-button"
            >
            Back to Products
            </Link>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Изображение товара */}
            <div className="border border-black">
            <div className="w-full h-[600px] relative overflow-hidden">
                <img 
                src={product.image_url} 
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = '/images/placeholder.jpg'
                    e.target.className = 'w-full h-full object-cover bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'
                }}
                />
            </div>
            </div>
            
            {/* Информация о товаре */}
            <div className="py-8">
            <h1 className="text-3xl font-normal mb-4 tracking-wide leading-tight">{product.title}</h1>
            <p className="text-sm text-gray-600 mb-2 tracking-wider uppercase">{product.brand}</p>
            <p className="text-2xl font-normal mb-8">${product.price}</p>
            
            <p className="text-sm mb-8 leading-relaxed tracking-wide">{product.description}</p>
            
            {/* Выбор размера */}
            {product.sizes && (
                <div className="mb-8">
                <label className="block text-sm mb-4 tracking-wider uppercase">Size</label>
                <div className="flex flex-wrap gap-2">
                    {product.sizes.split(',').map(size => (
                    <button
                        key={size.trim()}
                        className={`px-6 py-3 border text-sm tracking-wider uppercase transition-all duration-300 ${
                        selectedSize === size.trim()
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-black hover:bg-black hover:text-white'
                        }`}
                        onClick={() => setSelectedSize(size.trim())}
                    >
                        {size.trim()}
                    </button>
                    ))}
                </div>
                </div>
            )}

            {/* Выбор количества */}
            <div className="mb-8">
                <label className="block text-sm mb-4 tracking-wider uppercase">Quantity</label>
                <select 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
                </select>
            </div>

            {/* Кнопка добавления в корзину */}
            <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 text-sm tracking-widest uppercase mb-12 transition-all duration-300 ${
                product.stock > 0
                    ? 'vogue-button'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                }`}
            >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Дополнительная информация о товаре */}
            <div className="border-t border-black pt-8">
                <h3 className="text-sm font-normal mb-6 tracking-widest uppercase">Product Details</h3>
                <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Category</span>
                    <span className="tracking-wide capitalize">{product.category}</span>
                    </div>
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Color</span>
                    <span className="tracking-wide">{product.color}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Stock</span>
                    <span className={`tracking-wide ${
                        product.stock > 5 ? '' : 
                        product.stock > 0 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                        {product.stock} items
                    </span>
                    </div>
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Brand</span>
                    <span className="tracking-wide">{product.brand}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }