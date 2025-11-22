const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ПРАВИЛЬНЫЙ абсолютный путь
const dbPath = path.join(process.cwd(), 'boutique.db');
console.log('✅ Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

db.run('PRAGMA foreign_keys = ON');

module.exports = db;