    import { useEffect, useState } from 'react'
    import { Link } from 'react-router-dom'
    import { Star, Trash2, Edit, Eye, Search } from 'lucide-react'
    import useStore from '../store/useStore'
    import { getUserReviews, getProductReviews, createReview, deleteReview } from '../api'
    import toast from 'react-hot-toast'

    export default function Reviews() {
    const { user, isAuthenticated } = useStore()
    const [userReviews, setUserReviews] = useState([])
    const [allReviews, setAllReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('my-reviews')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        if (isAuthenticated) {
        loadReviews()
        }
    }, [isAuthenticated, activeTab])

    async function loadReviews() {
        try {
        setLoading(true)
        
        if (activeTab === 'my-reviews' && user) {
            // Загружаем отзывы пользователя
            const response = await getUserReviews(user.id)
            const data = await response.json()
            
            if (data.success) {
            setUserReviews(data.data)
            }
        } else if (activeTab === 'all-reviews') {
            // Загружаем все отзывы (для демонстрации - первые 20)
            // В реальном приложении нужен endpoint для всех отзывов
            const sampleReviews = await loadSampleReviews()
            setAllReviews(sampleReviews)
        }
        } catch (error) {
        console.error('Ошибка загрузки отзывов:', error)
        toast.error('Не удалось загрузить отзывы')
        } finally {
        setLoading(false)
        }
    }

    // Временная функция для демонстрации всех отзывов
    async function loadSampleReviews() {
        // В реальном приложении здесь будет запрос к API
        return []
    }

    async function handleDeleteReview(reviewId) {
        if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        return
        }

        try {
        // В реальном приложении здесь будет вызов API
        // await deleteReview(reviewId)
        
        // Временно удаляем из состояния
        setUserReviews(prev => prev.filter(review => review.id !== reviewId))
        toast.success('Отзыв успешно удален')
        } catch (error) {
        toast.error('Не удалось удалить отзыв')
        }
    }

    // Фильтрация и сортировка отзывов
    const filteredReviews = (activeTab === 'my-reviews' ? userReviews : allReviews)
        .filter(review => {
        const searchLower = searchTerm.toLowerCase()
        return (
            review.review?.toLowerCase().includes(searchLower) ||
            review.product_name?.toLowerCase().includes(searchLower) ||
            review.user_name?.toLowerCase().includes(searchLower)
        )
        })
        .sort((a, b) => {
        switch (sortBy) {
            case 'newest':
            return new Date(b.created_at) - new Date(a.created_at)
            case 'oldest':
            return new Date(a.created_at) - new Date(b.created_at)
            case 'rating-high':
            return b.stars - a.stars
            case 'rating-low':
            return a.stars - b.stars
            default:
            return 0
        }
        })

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

    if (!isAuthenticated) {
        return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="border border-black p-6 max-w-md mx-auto">
            <p className="text-sm mb-4">Пожалуйста, войдите в систему, чтобы просмотреть свои отзывы</p>
            <Link to="/login" className="vogue-button text-sm px-6 py-2">
                Войти
            </Link>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide">ОТЗЫВЫ О ТОВАРАХ</h1>
            <p className="text-sm tracking-widest uppercase">Поделитесь своим опытом</p>
        </div>

        {/* Табы и фильтры */}
        <div className="border border-black p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Табы */}
            <div className="flex gap-2">
                <button
                className={`px-4 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                    activeTab === 'my-reviews'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
                onClick={() => setActiveTab('my-reviews')}
                >
                Мои отзывы
                </button>
                <button
                className={`px-4 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
                    activeTab === 'all-reviews'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
                onClick={() => setActiveTab('all-reviews')}
                >
                Все отзывы
                </button>
            </div>

            {/* Поиск и сортировка */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Поиск */}
                <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Поиск отзывов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-black pl-10 pr-4 py-2 text-sm tracking-wide focus:outline-none focus:ring-0 w-full sm:w-64"
                />
                </div>

                {/* Сортировка */}
                <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-black px-4 py-2 text-sm tracking-wide focus:outline-none focus:ring-0"
                >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="rating-high">Высокий рейтинг</option>
                <option value="rating-low">Низкий рейтинг</option>
                </select>
            </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="border border-black p-4 text-center">
                <p className="text-2xl font-normal mb-1">{userReviews.length}</p>
                <p className="text-xs tracking-wider uppercase">Всего отзывов</p>
            </div>
            <div className="border border-black p-4 text-center">
                <p className="text-2xl font-normal mb-1">
                {userReviews.length > 0 
                    ? (userReviews.reduce((sum, review) => sum + review.stars, 0) / userReviews.length).toFixed(1)
                    : '0.0'
                }
                </p>
                <p className="text-xs tracking-wider uppercase">Средний рейтинг</p>
            </div>
            <div className="border border-black p-4 text-center">
                <p className="text-2xl font-normal mb-1">
                {userReviews.filter(review => review.stars === 5).length}
                </p>
                <p className="text-xs tracking-wider uppercase">5-звездочных отзывов</p>
            </div>
            <div className="border border-black p-4 text-center">
                <p className="text-2xl font-normal mb-1">
                {new Set(userReviews.map(review => review.product_id)).size}
                </p>
                <p className="text-xs tracking-wider uppercase">Оценено товаров</p>
            </div>
            </div>
        </div>

        {/* Список отзывов */}
        <div className="space-y-6">
            {loading ? (
            <div className="text-center py-12">
                <div className="text-lg">Загрузка отзывов...</div>
            </div>
            ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
                <div key={review.id} className="border border-black p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star size={20} className="text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-normal mb-1">
                        {review.product_name || `Товар #${review.product_id}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>От {review.user_name || 'Вас'}</span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                    </div>

                    <div className="flex items-center gap-2">
                    {renderStars(review.stars)}
                    {activeTab === 'my-reviews' && (
                        <div className="flex gap-2">
                        <Link
                            to={`/product/${review.product_id}`}
                            className="p-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                            title="Посмотреть товар"
                        >
                            <Eye size={16} />
                        </Link>
                        <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 border border-black hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300"
                            title="Удалить отзыв"
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>
                    )}
                    </div>
                </div>

                <p className="text-sm text-gray-800 leading-relaxed mb-4">{review.review}</p>

                {/* Действия */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>ID отзыва: {review.id}</span>
                    <span>•</span>
                    <span>ID товара: {review.product_id}</span>
                    </div>
                    
                    {activeTab === 'all-reviews' && (
                    <Link
                        to={`/product/${review.product_id}`}
                        className="text-xs tracking-widest uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-300"
                    >
                        Посмотреть товар
                    </Link>
                    )}
                </div>
                </div>
            ))
            ) : (
            <div className="border border-black p-12 text-center">
                <Star size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-normal mb-2">Отзывы не найдены</h3>
                <p className="text-sm text-gray-600 mb-6">
                {activeTab === 'my-reviews' 
                    ? "Вы еще не написали ни одного отзыва."
                    : "Нет отзывов, соответствующих вашему запросу."
                }
                </p>
                {activeTab === 'my-reviews' && (
                <Link
                    to="/"
                    className="vogue-button text-sm px-6 py-2"
                >
                    Смотреть товары
                </Link>
                )}
            </div>
            )}
        </div>

        {/* Подсказки для написания отзывов */}
        {activeTab === 'my-reviews' && userReviews.length === 0 && (
            <div className="border border-black p-6 mt-8">
            <h3 className="text-lg font-normal mb-4 tracking-wide">Как писать полезные отзывы</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                <h4 className="font-medium mb-2">Что включить в отзыв:</h4>
                <ul className="space-y-1 text-gray-600">
                    <li>• Качество товара и материалы</li>
                    <li>• Посадка и соответствие размеру</li>
                    <li>• Соответствие фотографиям</li>
                    <li>• Соотношение цены и качества</li>
                </ul>
                </div>
                <div>
                <h4 className="font-medium mb-2">Советы для хороших отзывов:</h4>
                <ul className="space-y-1 text-gray-600">
                    <li>• Будьте конкретны и подробны</li>
                    <li>• Добавляйте фото, если возможно</li>
                    <li>• Укажите, как используете товар</li>
                    <li>• Будьте честны и конструктивны</li>
                </ul>
                </div>
            </div>
            </div>
        )}
        </div>
    )
    }