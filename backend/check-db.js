const db = require('./src/config/database');

console.log('🔍 Checking database via config...');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error checking tables:', err.message);
        return;
    }
    
    console.log('📊 Tables in database:', tables.map(t => t.name));

    db.all('SELECT * FROM products', (err, products) => {
        if (err) {
        console.error('❌ Error checking products:', err.message);
        return;
        }
        
        console.log('📦 Products count:', products.length);
        console.log('📦 Products:');
        products.forEach(p => console.log(`   - ${p.id}: ${p.title} ($${p.price})`));

        db.all('SELECT * FROM users', (err, users) => {
        if (err) {
            console.error('❌ Error checking users:', err.message);
            return;
        }
        
        console.log('👥 Users count:', users.length);
        console.log('👥 Users:');
        users.forEach(u => console.log(`   - ${u.id}: ${u.email} (${u.role})`));
        
        db.close();
        });
    });
});