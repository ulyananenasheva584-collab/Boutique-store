    import { useState } from 'react'
    import { NavLink } from 'react-router-dom'
    import useStore from '../store/useStore'
    import toast from 'react-hot-toast'

    export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const { register } = useStore()

    function handleChange(e) {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
        }

        const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
        })

        if (result.success) {
        toast.success('Registration successful! Please login.')
        } else {
        toast.error(result.error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full">
            <div className="border border-black p-12">
            <h2 className="text-2xl font-normal text-center mb-12 tracking-wide">REGISTER</h2>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                <label className="block text-sm mb-3 tracking-wider uppercase">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    autoComplete="name"
                />
                </div>

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
                    autoComplete="new-password"
                />
                </div>

                <div>
                <label className="block text-sm mb-3 tracking-wider uppercase">Confirm Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full border border-black px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-0"
                    autoComplete="new-password"
                />
                </div>

                <button 
                type="submit"
                className="vogue-button w-full py-4 text-sm tracking-widest uppercase"
                >
                Register
                </button>

                <p className="text-center text-sm tracking-wide">
                Already have an account?{' '}
                <NavLink 
                    to="/login" 
                    className="underline hover:no-underline"
                >
                    Login here
                </NavLink>
                </p>
            </form>
            </div>
        </div>
        </div>
    )
    }