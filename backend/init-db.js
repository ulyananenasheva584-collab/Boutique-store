const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

console.log('Initializing database...');

function runSQLSequentially(statements, index = 0) {
    if (index >= statements.length) {
        console.log('✅ Database initialized successfully!');
        console.log('📊 Sample data inserted');
        console.log('🔑 Admin user: admin@boutique.com / admin123');
        db.close();
        return;
    }

    const statement = statements[index].trim();
    
    if (!statement || statement.startsWith('--')) {

        runSQLSequentially(statements, index + 1);
        return;
    }

    console.log(`Executing: ${statement.substring(0, 50)}...`);

    db.run(statement, function(err) {
        if (err) {
        console.error('Error executing statement:', err.message);
        console.error('Statement:', statement);
        db.close();
        return;
        }

        console.log(`Progress: ${index + 1}/${statements.length}`);
        runSQLSequentially(statements, index + 1);
    });
}

const schema = fs.readFileSync(path.join(__dirname, 'database-schema.sql'), 'utf8');

const statements = schema.split(';').filter(stmt => stmt.trim());

runSQLSequentially(statements);