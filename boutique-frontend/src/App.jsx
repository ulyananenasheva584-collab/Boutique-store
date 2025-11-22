import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'border border-black',
          style: {
            background: '#fff',
            color: '#000',
          },
        }}
      />
    </div>
  )
}