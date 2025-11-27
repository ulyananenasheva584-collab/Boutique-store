    import { NavLink, useNavigate } from 'react-router-dom'
    import { ShoppingBag, User, MapPin, Star, Menu, X } from 'lucide-react'
    import useStore from '../store/useStore'
    import { useState } from 'react'

    export default function Header() {
    const { user, isAuthenticated, logout, cart } = useStore()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    function handleLogout() {
        logout()
        navigate('/')
        setMobileMenuOpen(false)
    }

    const navItems = [
        {path: '/', label: 'BOUTIQUE'},
        { path: '/goods', label: 'Товары' },
        { path: '/shops', label: 'Адрес', icon: MapPin },
        ...(isAuthenticated ? [
        { path: '/profile', label: 'Профиль', icon: User },
        { path: '/reviews', label: 'Мои отзывы', icon: Star },
        ] : []),
    ]

    return (
    <header className="border-b border-white sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
            {/* Логотип */}
            <NavLink 
                to="/" 
                className="text-xl font-normal tracking-widest uppercase hover:opacity-70 transition-opacity text-white"
                onClick={() => setMobileMenuOpen(false)}
            >
                BOUTIQUE
            </NavLink>

            {/* Десктопная навигация */}
            <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => {
                const Icon = item.icon
                return (
                    <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center gap-2 text-sm tracking-widest uppercase transition-opacity hover:opacity-70 text-white ${
                        isActive ? 'opacity-100' : 'opacity-60'
                        }`
                    }
                    >
                    {Icon && <Icon size={16} />}
                    {item.label}
                    </NavLink>
                )
                })}
            </nav>

            {/* Правая часть - авторизация/корзина */}
            <div className="flex items-center gap-4">
                {/* Корзина */}
                <NavLink
                to="/cart"
                className="flex items-center gap-2 text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity text-white"
                >
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">Корзина</span>
                {cart.length > 0 && (
                    <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                    </span>
                )}
                </NavLink>

                {/* Авторизация */}
                {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-sm tracking-wide text-white">Привет, {user?.name}</span>
                    <button
                    onClick={handleLogout}
                    className="text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity text-white"
                    >
                    Выйти
                    </button>
                </div>
                ) : (
                <div className="hidden md:flex items-center gap-4">
                    <NavLink
                    to="/login"
                    className="text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity text-white"
                    >
                    Войти
                    </NavLink>
                    <NavLink
                    to="/register"
                    className="text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity text-white"
                    >
                    Регистрация
                    </NavLink>
                </div>
                )}

                {/* Мобильное меню */}
                <button
                className="md:hidden p-2 text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
            </div>

            {/* Мобильное меню */}
            {mobileMenuOpen && (
            <div className="md:hidden border-t border-white py-4">
                <nav className="space-y-4">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                        `flex items-center gap-3 text-sm tracking-widest uppercase py-2 text-white ${
                            isActive ? 'opacity-100' : 'opacity-60'
                        }`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {Icon && <Icon size={18} />}
                        {item.label}
                    </NavLink>
                    )
                })}
                
                {/* Мобильная авторизация */}
                {isAuthenticated ? (
                    <div className="pt-4 border-t border-gray-400 space-y-3">
                    <div className="text-sm tracking-wide px-1 text-white">Hello, {user?.name}</div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-sm tracking-widest uppercase opacity-60 py-2 text-white"
                    >
                        Выйти
                    </button>
                    </div>
                ) : (
                    <div className="pt-4 border-t border-gray-400 space-y-3">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 text-sm tracking-widest uppercase opacity-60 py-2 text-white"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Войти
                    </NavLink>
                    <NavLink
                        to="/register"
                        className="flex items-center gap-3 text-sm tracking-widest uppercase opacity-60 py-2 text-white"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Регистрация
                    </NavLink>
                    </div>
                )}
                </nav>
            </div>
            )}
        </div>
    </header>
)
    }