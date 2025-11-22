    import { NavLink } from 'react-router-dom'
    import useStore from '../store/useStore'

    export default function Header() {
    const { user, isAuthenticated, cart, logout } = useStore()
    const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

    const getNavLinkClass = ({ isActive }) => 
        `px-4 py-2 text-sm tracking-widest uppercase transition-all duration-300 ${
        isActive 
            ? 'border-b-2 border-white text-white' 
            : 'text-gray-300 hover:border-b-2 hover:border-white hover:text-white'
        }`

    return (
        <header className="bg-black border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6">
            <div className="flex justify-between items-center h-20">
            <NavLink to="/" className="text-2xl font-normal tracking-widest text-white">
                BOUTIQUE
            </NavLink>
            
            <nav className="flex items-center space-x-8">
                <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
                <NavLink to="/cart" className={getNavLinkClass}>Cart ({cartItemsCount})</NavLink>

                {isAuthenticated ? (
                <>
                    <NavLink to="/orders" className={getNavLinkClass}>Orders</NavLink>
                    <span className="text-sm tracking-wide text-white">{user?.name}</span>
                    <button onClick={logout} className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                    Logout
                    </button>
                </>
                ) : (
                <>
                    <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
                    <NavLink to="/register" className={getNavLinkClass}>Register</NavLink>
                </>
                )}
            </nav>
            </div>
        </div>
        </header>
    )
    }