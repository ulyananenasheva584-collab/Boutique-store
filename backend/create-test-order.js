    const API_BASE = 'http://localhost:3000/api';

    async function createTestOrder() {
    const testOrder = {
        user_id: 1,
        total_amount: 459.98,
        address: "ул. Тестовая, д. 123, кв. 45",
        phone: "+7 (999) 123-45-67",
        items: [
        {
            product_id: 1,
            quantity: 1,
            price: 299.99,
            size: "M",
            color: "Black"
        },
        {
            product_id: 2, 
            quantity: 1,
            price: 159.99,
            size: "L",
            color: "White"
        }
        ]
    };

    try {
        console.log('Creating test order...');
        const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrder)
        });

        const result = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', result);
        
    } catch (error) {
        console.error('Error creating test order:', error);
    }
    }

    createTestOrder();