const Database = require('better-sqlite3');

const db = new Database('w3s-dynamic-storage/database.db', { verbose: console.log });

module.exports = db;