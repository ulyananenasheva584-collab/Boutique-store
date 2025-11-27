import { useEffect, useState } from 'react'
import { User, Star, Package, TrendingUp, Eye, ShoppingBag } from 'lucide-react'
import useStore from '../store/useStore'
import { getUserReviews } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
    const { user, products } = useStore()
    const [userReviews, setUserReviews] = useState([])
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalReviews: 0,
        averageRating: 0
    })
    const navigate = useNavigate()

    useEffect(() => {
        loadUserData()
    }, [user])

    async function loadUserData() {
        if (user) {
        try {
            const reviewsResponse = await getUserReviews(user.id)
            const reviewsData = await reviewsResponse.json()
            
            if (reviewsData.success) {
            setUserReviews(reviewsData.data)
            
            const totalReviews = reviewsData.data.length
            const averageRating = totalReviews > 0 
                ? reviewsData.data.reduce((sum, review) => sum + review.stars, 0) / totalReviews 
                : 0

            setStats({
                totalProducts: products.length,
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10
            })
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error)
        }
        }
    }

    if (!user) {
        return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="border border-black p-6 max-w-md mx-auto">
            <p className="text-sm">Пожалуйста, войдите в систему, чтобы просмотреть свой профиль</p>
            </div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок и статистика */}
        <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-normal mb-4 tracking-wide">Личный кабинет</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="border border-black p-4 sm:p-6 text-center">
                <div className="flex justify-center mb-3">
                <Package size={24} className="text-gray-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-normal mb-2">{stats.totalProducts}</p>
                <p className="text-sm tracking-wider uppercase">Доступно товаров</p>
            </div>
            <div className="border border-black p-4 sm:p-6 text-center">
                <div className="flex justify-center mb-3">
                <Star size={24} className="text-gray-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-normal mb-2">{stats.totalReviews}</p>
                <p className="text-sm tracking-wider uppercase">Написано отзывов</p>
            </div>
            <div className="border border-black p-4 sm:p-6 text-center">
                <div className="flex justify-center mb-3">
                <TrendingUp size={24} className="text-gray-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-normal mb-2">{stats.averageRating}</p>
                <p className="text-sm tracking-wider uppercase">Средний рейтинг</p>
            </div>
            </div>
        </div>

        {/* Информация пользователя */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12">
            <div className="border border-black p-6">
            <h3 className="text-lg font-normal mb-4 tracking-wider uppercase flex items-center gap-3">
                <User size={20} />
                Личная информация
            </h3>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-xs tracking-wider uppercase text-gray-600">Имя</span>
                <span className="tracking-wide font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-xs tracking-wider uppercase text-gray-600">Email</span>
                <span className="tracking-wide font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                <span className="text-xs tracking-wider uppercase text-gray-600">Участник с</span>
                <span className="tracking-wide font-medium">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </span>
                </div>
                
                {/* Кнопка перехода к заказам */}
                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center justify-center gap-2 w-full py-3 border border-black text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
                    >
                        <ShoppingBag size={16} />
                        Мои заказы
                    </button>
                </div>
            </div>
            </div>

            <div className="border border-black p-6">
            <h3 className="text-lg font-normal mb-4 tracking-wider uppercase flex items-center gap-3">
                <Eye size={20} />
                Недавняя активность
            </h3>
            <div className="space-y-4">
                {userReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium flex-1">{review.product_name}</p>
                    <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{review.stars}</span>
                    </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">{review.review}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                    <span>Товар #{review.product_id}</span>
                    </div>
                </div>
                ))}
                {userReviews.length === 0 && (
                <div className="text-center py-8">
                    <Star size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 text-sm">Пока нет отзывов</p>
                    <p className="text-xs text-gray-500 mt-1">Начните оставлять отзывы, чтобы увидеть активность здесь</p>
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Статистика активности */}
        <div className="border border-black p-6 mb-8">
            <h3 className="text-lg font-normal mb-6 tracking-wider uppercase">Обзор активности</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">{userReviews.length}</span>
                </div>
                <p className="text-sm tracking-wider uppercase">Всего отзывов</p>
            </div>
            
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">
                    {userReviews.filter(r => r.stars === 5).length}
                </span>
                </div>
                <p className="text-sm tracking-wider uppercase">5-звездочных отзывов</p>
            </div>
            
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">
                    {new Set(userReviews.map(r => r.product_id)).size}
                </span>
                </div>
                <p className="text-sm tracking-wider uppercase">Оценено товаров</p>
            </div>
            
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">
                    {Math.round(stats.averageRating * 20)}%
                </span>
                </div>
                <p className="text-sm tracking-wider uppercase">Уровень удовлетворенности</p>
            </div>
            </div>
        </div>

        {/* Последние отзывы */}
        <div className="border border-black p-6">
            <h3 className="text-lg font-normal mb-6 tracking-wider uppercase">Ваши отзывы</h3>
            
            {userReviews.length > 0 ? (
            <div className="space-y-4">
                {userReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-medium text-sm mb-1">{review.product_name}</h4>
                        <p className="text-xs text-gray-600">
                        {new Date(review.created_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={16}
                            className={i < review.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                        ))}
                    </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{review.review}</p>
                </div>
                ))}
            </div>
            ) : (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-gray-400" />
                </div>
                <h4 className="text-lg font-normal mb-2">Пока нет отзывов</h4>
                <p className="text-sm text-gray-600 mb-6">
                Вы еще не написали ни одного отзыва. Поделитесь своими впечатлениями о купленных товарах!
                </p>
                <button 
                onClick={() => navigate('/')}
                className="vogue-button text-sm px-6 py-2"
                >
                Смотреть товары
                </button>
            </div>
            )}
        </div>
        </div>
    )
}