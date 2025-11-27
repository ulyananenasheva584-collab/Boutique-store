    import { useEffect, useState } from 'react'
    import { useParams, Link } from 'react-router-dom'
    import useStore from '../store/useStore'
    import { getProductReviews, createReview } from '../api'
    import toast from 'react-hot-toast'
    import { Star, User } from 'lucide-react'

    export default function ProductDetail() {
    const { id } = useParams()
    const { product, loadProduct, addToCart, user } = useStore()
    const [selectedSize, setSelectedSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [reviews, setReviews] = useState([])
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewData, setReviewData] = useState({
        stars: 5,
        review: ''
    })

    useEffect(() => {
        loadProductData()
    }, [id])

    async function loadProductData() {
        try {
        setError('')
        const productResult = await loadProduct(id)
        
        if (productResult.success) {
            // Загружаем отзывы
            const reviewsResponse = await getProductReviews(id)
            const reviewsData = await reviewsResponse.json()
            
            if (reviewsData.success) {
            setReviews(reviewsData.data)
            }
        } else {
            setError('Товар не найден')
        }
        } catch (error) {
        console.error('Ошибка загрузки товара:', error)
        setError('Товар не найден')
        } finally {
        setLoading(false)
        }
    }

    async function handleSubmitReview(e) {
        e.preventDefault()
        
        if (!user) {
        toast.error('Пожалуйста, войдите в систему, чтобы оставить отзыв')
        return
        }

        try {
        const response = await createReview({
            user_id: user.id,
            product_id: parseInt(id),
            review: reviewData.review,
            stars: reviewData.stars
        })
        
        const data = await response.json()
        
        if (data.success) {
            toast.success('Отзыв успешно добавлен!')
            setReviewData({ stars: 5, review: '' })
            setShowReviewForm(false)
            // Обновляем список отзывов
            loadProductData()
        } else {
            toast.error(data.error)
        }
        } catch (error) {
        toast.error('Не удалось отправить отзыв')
        }
    }

    function handleAddToCart() {
        if (!selectedSize && product.sizes) {
        toast.error('Пожалуйста, выберите размер')
        return
        }

        addToCart({
        ...product,
        selectedSize,
        quantity
        })
        toast.success('Добавлено в корзину!')
    }

    // Рендер звезд рейтинга
    function renderStars(rating) {
        return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={16}
                className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
            ))}
        </div>
        )
    }

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Загрузка товара...</div>
        </div>
        )
    }

    if (error || !product) {
        return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="border border-black p-6 max-w-md mx-auto mb-6">
            <p className="text-sm">{error || 'Товар не найден'}</p>
            </div>
            <Link 
            to="/"
            className="vogue-button"
            >
            Вернуться к товарам
            </Link>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
            {/* Изображение товара */}
            <div className="border border-black">
            <div className="w-full h-64 sm:h-96 lg:h-[500px] relative overflow-hidden">
                <img 
                src={product.image_url || '/images/placeholder.jpg'} 
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = '/images/placeholder.jpg'
                }}
                />
            </div>
            </div>
            
            {/* Информация о товаре */}
            <div className="py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide leading-tight">{product.title}</h1>
            <p className="text-sm text-gray-600 mb-2 tracking-wider uppercase">{product.brand}</p>
            <p className="text-xl sm:text-2xl font-normal mb-6 sm:mb-8">${product.price}</p>
            
            <p className="text-sm mb-6 sm:mb-8 leading-relaxed tracking-wide">{product.description}</p>
            
            {/* Выбор размера */}
            {product.sizes && (
                <div className="mb-6 sm:mb-8">
                <label className="block text-sm mb-4 tracking-wider uppercase">Размер</label>
                <div className="flex flex-wrap gap-2">
                    {product.sizes.split(',').map(size => (
                    <button
                        key={size.trim()}
                        className={`px-4 sm:px-6 py-2 sm:py-3 border text-sm tracking-wider uppercase transition-all duration-300 ${
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
            <div className="mb-6 sm:mb-8">
                <label className="block text-sm mb-4 tracking-wider uppercase">Количество</label>
                <select 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
                </select>
            </div>

            {/* Кнопка добавления в корзину */}
            <button
                onClick={handleAddToCart}
                className="vogue-button w-full py-4 text-sm tracking-widest uppercase mb-8 sm:mb-12 transition-all duration-300"
            >
                В корзину
            </button>

            {/* Дополнительная информация о товаре */}
            <div className="border-t border-black pt-6 sm:pt-8">
                <h3 className="text-sm font-normal mb-4 sm:mb-6 tracking-widest uppercase">О товаре</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-sm">
                <div className="space-y-3 sm:space-y-4">
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Категория</span>
                    <span className="tracking-wide capitalize">{product.category}</span>
                    </div>
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Цвет</span>
                    <span className="tracking-wide">{product.color}</span>
                    </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                    <span className="block text-xs tracking-wider uppercase text-gray-600 mb-1">Бренд</span>
                    <span className="tracking-wide">{product.brand}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Секция отзывов */}
        <div className="max-w-6xl mx-auto mt-12 sm:mt-16">
            <div className="border-t border-black pt-8 sm:pt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                <h3 className="text-xl font-normal mb-4 sm:mb-0 tracking-wide">Отзывы покупателей</h3>
                <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="vogue-button text-sm px-6 py-3"
                >
                {showReviewForm ? 'Отмена' : 'Написать отзыв'}
                </button>
            </div>

            {/* Форма отзыва */}
            {showReviewForm && (
                <div className="border border-black p-6 mb-8">
                <h4 className="text-lg font-normal mb-4">Напишите ваш отзыв</h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                    <label className="block text-sm mb-2 tracking-wider uppercase">Рейтинг</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, stars: star })}
                            className="p-1"
                        >
                            <Star
                            size={24}
                            className={star <= reviewData.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                        </button>
                        ))}
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm mb-2 tracking-wider uppercase">Отзыв</label>
                    <textarea
                        value={reviewData.review}
                        onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                        required
                        rows="4"
                        className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                        placeholder="Поделитесь вашим мнением об этом товаре..."
                    />
                    </div>
                    
                    <button type="submit" className="vogue-button text-sm px-6 py-3">
                    Отправить отзыв
                    </button>
                </form>
                </div>
            )}

            {/* Список отзывов */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{review.user_name || 'Анонимный пользователь'}</p>
                            <p className="text-xs text-gray-600">
                            {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                        </div>
                        {renderStars(review.stars)}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{review.review}</p>
                    </div>
                ))
                ) : (
                <div className="text-center py-8">
                    <p className="text-gray-600">Пока нет отзывов. Будьте первым, кто оставит отзыв об этом товаре!</p>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    )
    }