const express = require('express');
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM products WHERE stock > 0';
        let countQuery = 'SELECT COUNT(*) as count FROM products WHERE stock > 0';
        const params = [];

        if (category) {
        query += ' AND category = ?';
        countQuery += ' AND category = ?';
        params.push(category);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        // Get products
        db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Get total count
        db.get(countQuery, category ? [category] : [], (err, countResult) => {
            if (err) {
            return res.status(500).json({ error: err.message });
            }

            const total = countResult.count;

            res.json({
            products: products,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
            });
        });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // Get single product
    router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // Create product (admin only)
    router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, price, stock, category, size, color, brand, image_url } = req.body;
        
        db.run(
        `INSERT INTO products (title, description, price, stock, category, size, color, brand, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, price, stock, category, size, color, brand, image_url],
        function(err) {
            if (err) {
            return res.status(500).json({ error: err.message });
            }

            // Get the inserted product
            db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json(product);
            });
        }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;