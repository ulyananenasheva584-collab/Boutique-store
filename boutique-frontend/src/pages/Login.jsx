    import { useState } from 'react'
    import { NavLink } from 'react-router-dom'
    import useStore from '../store/useStore'
    import toast from 'react-hot-toast'

    export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const { login } = useStore()

    function handleChange(e) {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        const result = await login(formData)
        if (result.success) {
        toast.success('Login successful!')
        } else {
        toast.error(result.error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full">
            <div className="border border-black p-12">
            <h2 className="text-2xl font-normal text-center mb-12 tracking-wide">LOGIN</h2>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
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
                <label className="block text-sm mb-3 tracking-wider uppercase">Password</label>
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
                className="vogue-button w-full py-4 text-sm tracking-widest uppercase"
                >
                Login
                </button>

                <p className="text-center text-sm tracking-wide">
                Don't have an account?{' '}
                <NavLink 
                    to="/register" 
                    className="underline hover:no-underline"
                >
                    Register here
                </NavLink>
                </p>
            </form>
            </div>
        </div>
        </div>
    )
    }