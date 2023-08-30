const db = require('./database.js');

function initializeDatabase() {
    try {
        db.exec(`
                
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS refreshTokens (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                token TEXT UNIQUE NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS user_meal_intake (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                meal_id INTEGER,
                intake_type TEXT,
                served FLOAT,
                date DATE,                
                time TIME,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(meal_id) REFERENCES meals(id)
            );

            CREATE TABLE IF NOT EXISTS meals (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                info TEXT,
                meal_type TEXT,
                servings INTEGER,
                is_active INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS ingredients (
                id INTEGER PRIMARY KEY,
                calories FLOAT, 
                protein FLOAT, 
                carbs FLOAT, 
                fats FLOAT, 
                name TEXT UNIQUE,
                is_active INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS units (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                conversion_factor_to_gram FLOAT
            );

            CREATE TABLE IF NOT EXISTS meal_ingredients (
                meal_id INTEGER, 
                ingredient_id INTEGER, 
                amount FLOAT, 
                unit_id INTEGER,
                PRIMARY KEY(meal_id, ingredient_id),
                FOREIGN KEY(meal_id) REFERENCES meals(id),
                FOREIGN KEY(ingredient_id) REFERENCES ingredients(id),
                FOREIGN KEY(unit_id) REFERENCES units(id)
            );

            INSERT OR IGNORE INTO units (name, conversion_factor_to_gram) VALUES 
            ('g', 1), ('ml', 1), ('oz', 28.35), ('lb', 453.59), ('TL', 5), ('EL', 10);
        `);

        console.log("Database initialization complete.");
    } catch (error) {
        console.error("Error initializing database:", error.message);
    }
}

module.exports = initializeDatabase;
