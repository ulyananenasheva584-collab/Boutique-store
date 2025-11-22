const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 5001; // Явно указываем порт
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Boutique server running on port ${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api/products`);
  console.log(`✅ Network: http://0.0.0.0:${PORT}/api/products`);
});