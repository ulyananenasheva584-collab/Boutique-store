import { useState } from 'react'
import useStore from '../store/useStore'
import { productsAPI } from '../api'
import toast from 'react-hot-toast'

export default function Admin() {
    const { user } = useStore()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        size: '',
        color: '',
        brand: '',
        image_url: ''
    })

    function handleChange(e) {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
        }

        await productsAPI.createProduct(productData)
        toast.success('Product created successfully!')
        setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        size: '',
        color: '',
        brand: '',
        image_url: ''
        })
    }

    if (!user || user.role !== 'admin') {
        return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="text-xl text-red-600">Admin access required</div>
        </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h2>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Create New Product</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Select Category</option>
                    <option value="dresses">Dresses</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="accessories">Accessories</option>
                </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="S,M,L,XL"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-secondary transition-colors duration-200 font-semibold"
            >
                Create Product
            </button>
            </form>
        </div>
        </div>
    )
}