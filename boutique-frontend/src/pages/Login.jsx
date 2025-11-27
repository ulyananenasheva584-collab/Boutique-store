    import { useState } from 'react'
    import { NavLink, useNavigate } from 'react-router-dom'
    import useStore from '../store/useStore'
    import toast from 'react-hot-toast'

    export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const { login } = useStore()
    const navigate = useNavigate()

    function handleChange(e) {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        
        try {
        const result = await login(formData.email, formData.password)
        if (result.success) {
            toast.success('Вход выполнен успешно!')
            navigate('/')
        } else {
            toast.error(result.error)
        }
        } catch (error) {
        toast.error('Ошибка входа')
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full">
            <div className="border border-black p-8 sm:p-12">
            <h2 className="text-2xl font-normal text-center mb-8 sm:mb-12 tracking-wide">ВХОД</h2>
            
            <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                <div>
                <label className="block text-sm mb-3 tracking-wider uppercase">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    autoComplete="email"
                />
                </div>

                <div>
                <label className="block text-sm mb-3 tracking-wider uppercase">Пароль</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    autoComplete="current-password"
                />
                </div>

                <button 
                type="submit"
                disabled={loading}
                className="vogue-button w-full py-4 text-sm tracking-widest uppercase disabled:opacity-50"
                >
                {loading ? 'Вход...' : 'Войти'}
                </button>

                <p className="text-center text-sm tracking-wide">
                Нет аккаунта?{' '}
                <NavLink 
                    to="/register" 
                    className="underline hover:no-underline"
                >
                    Зарегистрируйтесь здесь
                </NavLink>
                </p>
            </form>
            </div>
        </div>
        </div>
    )
    }