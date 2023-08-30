const express = require('express');
const db = require('../db/database.js');

const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        const getIngredients = db.prepare('SELECT * FROM ingredients');
        const ingredients = getIngredients.all();
        res.json(ingredients);
    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});

router.post('/add', (req, res, next) => {
    const { name, calories, protein, carbs, fats } = req.body;

    try {
       
        const insertIngredient = db.prepare(`
            INSERT INTO ingredients (name, calories, protein, carbs, fats) 
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = db.transaction(() => {
            return insertIngredient.run(name, calories, protein, carbs, fats);
        })();

        const ingredientId = result.lastInsertRowid;

        res.status(201).json({ 
            message: 'Ingredient successfully created!', 
            ingredientId: ingredientId
        });  
        
    } catch (error) {
        console.error("Error:", error.message);

        if (error.message.includes("UNIQUE constraint failed: ingredients.name")) {
            return next({ status: 409, message: 'Ingredient already exists!' });        
        } else {
            // propagate to the middleware
            next(error);
        }
    }
});

router.put('/deactivate/:id', (req, res, next) => {
    const ingredientId = req.params.id;
    const timestamp = Date.now();

    try {
        const deactivateIngredient = db.prepare(`
            UPDATE ingredients 
            SET name = name || '_' || ?, is_active = 0 
            WHERE id = ? AND is_active = 1
        `);
        
        const result = db.transaction(() => {
            return deactivateIngredient.run(timestamp, ingredientId);
        })();

        if (result.changes === 0) {
            // No rows were updated, which likely means the ingredient was already inactive or not found.
            return res.status(404).json({ message: 'Ingredient not found or already deactivated' });
        }

        res.status(200).json({ message: 'Ingredient successfully deactivated' });
        
    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});


module.exports = router;
