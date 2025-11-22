const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Create order
router.post('/', async (req, res) => {
    const { userId, items, total, address, phone } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Create order
        db.run(
        'INSERT INTO orders (user_id, total, address, phone) VALUES (?, ?, ?, ?)',
        [userId, total, address, phone],
        function(err) {
            if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
            }

            const orderId = this.lastID;

            // Insert order items and update stock
            let completed = 0;
            items.forEach(item => {
            db.run(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price],
                function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                // Update product stock
                db.run(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.productId],
                    function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    completed++;
                    if (completed === items.length) {
                        db.run('COMMIT', (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.status(201).json({ orderId: orderId, status: 'created' });
                        });
                    }
                    }
                );
                }
            );
            });
        }
        );
    });
    });

    // Get user orders
    router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        
        db.all(
        `SELECT o.* FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
        [userId],
        (err, orders) => {
            if (err) {
            return res.status(500).json({ error: err.message });
            }

            // For each order, get items
            let completed = 0;
            const ordersWithItems = [];
            
            if (orders.length === 0) {
            return res.json([]);
            }

            orders.forEach(order => {
            db.all(
                `SELECT oi.*, p.title, p.image_url 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?`,
                [order.id],
                (err, items) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                ordersWithItems.push({
                    ...order,
                    items: items
                });

                completed++;
                if (completed === orders.length) {
                    res.json(ordersWithItems);
                }
                }
            );
            });
        }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;