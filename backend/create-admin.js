// create-admin.js
const Database = require('./database');

async function createAdmin() {
    const db = new Database();
    
    try {
        // Создаем администратора
        await db.register({
            name: 'Admin User',
            email: 'admin@boutique.com',
            password: 'admin123'
        });
        
        console.log('Admin user created: admin@boutique.com / admin123');
    } catch (error) {
        console.log('Admin might already exist:', error.message);
    } finally {
        await db.close();
    }
}

createAdmin();