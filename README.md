# BOUTIQUE - Интернет-магазин модной одежды

Веб-приложение модного журнала "BOUTIQUE", совмещённого со интернет-магазина  одежды и аксессуаров.

###  Основной функционал
- **Каталог товаров** с фильтрацией по категориям, цене и брендам
- **Система аутентификации** - регистрация и авторизация пользователей
- **Корзина покупок** с управлением количеством товаров
- **Система отзывов** и рейтингов для товаров
- **Личный кабинет** с историей активности
- **Административная панель** для управления контентом

###  Технические возможности
- **Адаптивный дизайн** - оптимизирован для всех устройств
- **Панель аналитики** с визуализацией данных
- **Управление магазинами** - информация о физических точках
- **Поиск и сортировка** товаров
- **Интуитивный интерфейс** с современным дизайном

##  Технологии

### Frontend
- **React** - современный фреймворк
- **React Router DOM** - навигация между страницами
- **Tailwind CSS** - утилитарные CSS-стили
- **Chart.js** + **React-ChartJS-2** - графики и аналитика
- **Lucide React** - иконки
- **Zustand** - управление состоянием
- **React Hot Toast** - уведомления

### Backend
- **Node.js** + **Express.js** - серверная часть
- **SQLite** - база данных
- **JWT** - аутентификация
- **REST API** - архитектура взаимодействия

##  Структура проекта

boutique-store/
├── boutique-frontend/
| ├── public/
| | ├──images/
| | | ├── back.jpg
| | | ├── bag1.jpg
| | | ├── dress1.jpg
| | | ├── jeans1.jpg
| | | ├── sweater1.jpg
| | | └── загрузка (1).jpg
│ ├── src/
│ │ ├── api/ 
| | └── index.js
│ │ ├── components/ 
│ │ │ ├── Charts/
| | | | ├── BarChart.jsx
| | | | ├── LineChart.jsx
| | | | └── PieChart.jsx
│ │ │ ├── Filter/
│ │ │ ├── ReviewList.jsx
│ │ │ └── Header.jsx 
│ │ ├── pages/ 
│ │ │ ├── Goods.jsx
│ │ │ ├── Orders.jsx
│ │ │ ├── Home.jsx 
│ │ │ ├── ProductDetail.jsx
│ │ │ ├── Cart.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── Profile.jsx
│ │ │ ├── Admin.jsx
│ │ │ ├── Reviews.jsx
│ │ │ └── Shops.jsx
│ │ ├── store/ 
│ │ │ └── useStore.js
│ │ ├── App.css
│ │ ├── App.jsx
│ │ ├── index.css
│ │ ├── main.jsx
│ │ └── router.jsx 
| ├── .env
| ├── .gitignore
| ├── eslint.config.js
| ├── index.html
| ├── package-lock.json
| ├── README.md
| ├── vite.config.js
│ └── package.json
└── backend/ 
|   ├── add-sample-products.js
|   ├── create-admin.js
|   ├── test_api.html
|   ├── package-lock.js
|   ├── server.js 
|   ├── database.js 
|   ├── README.md
|   └── package.json
├── .gitignore
├── boutique-store.code-workspace
├── README.md
└── test_api.html


##  Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- npm или yarn

### Запуск разработки

1. **Клонирование репозитория**

git clone <repository-url>
cd boutique-store

2. **Запуск backend**
cd backend
npm install
node server.js

Сервер запустится на http://localhost:3000

3. **Запуск frontend**
cd ../boutique-frontend
npm install
npm run dev

*Приложение будет доступно на http://localhost:5173*