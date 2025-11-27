// add-sample-products.js
const Database = require('./database');

async function addSampleProducts() {
    const db = new Database();
    
    const sampleProducts = [
        {
            name: "Prada Silk Dress",
            price: 299.99,
            description: "Elegant silk dress for special occasions",
            image_url: "/images/dress1.jpg",
            category: "dresses"
        },
        {
            name: "Prada Cashmere Sweater",
            price: 189.99,
            description: "Soft cashmere sweater for winter",
            image_url: "/images/sweater1.jpg",
            category: "tops"
        },
        {
            name: "Prada Trousers",
            price: 159.99,
            description: "High-waisted designer trousers",
            image_url: "/images/trousers1.jpg",
            category: "bottoms"
        },
        {
            name: "Prada Handbag",
            price: 399.99,
            description: "Genuine leather handbag",
            image_url: "/images/bag1.jpg",
            category: "accessories"
        },
        {
            name: "Gucci Blouse",
            price: 229.99,
            description: "Elegant silk blouse",
            image_url: "/images/blouse1.jpg",
            category: "tops"
        },
        {
            name: "Chanel Skirt",
            price: 179.99,
            description: "Classic A-line skirt",
            image_url: "/images/skirt1.jpg",
            category: "bottoms"
        }
    ];

    try {
        console.log('Adding sample products...');
        
        for (const product of sampleProducts) {
            await db.createProduct(product);
            console.log(`Added: ${product.name}`);
        }
        
        console.log('All sample products added successfully!');
    } catch (error) {
        console.error('Error adding products:', error);
    } finally {
        await db.close();
    }
}

addSampleProducts();