import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Admin from './pages/Admin.jsx'
import Orders from './pages/Orders.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
        {
            index: true,
            element: <Home />
        },
        {
            path: 'product/:id',
            element: <ProductDetail />
        },
        {
            path: 'cart',
            element: <Cart />
        },
        {
            path: 'login',
            element: <Login />
        },
        {
            path: 'register',
            element: <Register />
        },
        {
            path: 'orders',
            element: <Orders />
        },
        {
            path: 'admin',
            element: <Admin />
        }
        ]
    }
])

export default router