import { NavLink } from "react-router-dom";

export default function Home() {
    return (
        <div 
            className="min-h-screen  bg-center bg-fixed flex items-center justify-center"
            style={{
                backgroundImage: `url('/images/back.jpg')`
            }}
        >
            <div className="text-center bg-black bg-opacity-50 p-8 rounded-lg max-w-2xl mx-4">
                <h1 className="text-4xl md:text-6xl font-normal text-white mb-6 tracking-wide">
                    Откройте мир моды в BOUTIQUE
                </h1>
                <p className="text-xl text-white mb-6 tracking-wide opacity-90 leading-relaxed">
                    Здесь вдохновение встречается с возможностью — 
                    не просто восхищайтесь образами, а воплощайте их
                </p>
                <p className="text-lg text-white mb-8 tracking-wide opacity-80 italic">
                    Ваша образ мечты уже ждет вас
                </p>
                <NavLink to="/goods">
                <button className="rounded-lg bg-white text-black px-8 py-4 text-lg tracking-widest uppercase hover:bg-opacity-90 transition-all duration-300">
                    Перейти к покупкам
                </button>
                </NavLink>
            </div>
        </div>
    )
}