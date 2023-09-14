const express = require('express');
const db = require('../db/database.js');
const router = express.Router();
const { validateMeal} = require('../middleware/validationMiddleware');


router.get('/all', (req, res, next) => {
    try {
        const mealsStmt = db.prepare('SELECT * FROM meals WHERE is_active = 1;');
        const meals = mealsStmt.all();

        const ingredientsStmt = db.prepare(`
            SELECT 
                mi.meal_id, 
                i.name as ingredient_name, 
                mi.amount,
                m.meal_type,
                u.name as unit,
                i.calories, 
                i.protein, 
                i.carbs, 
                i.fats
            FROM meal_ingredients mi
            JOIN ingredients i ON mi.ingredient_id = i.id
            JOIN units u ON mi.unit_id = u.id
            JOIN meals m ON mi.meal_id = m.id
        `);

        const allIngredients = ingredientsStmt.all();
        
        // Assign ingredients to their respective meals
        meals.forEach(meal => {
            meal.ingredients = allIngredients.filter(ing => ing.meal_id === meal.id);
        });

        res.json(meals);

    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});


// Fetch a specific meal by its ID
router.get('/:id', (req, res, next) => {
    const mealId = req.params.id;

    try {
        const mealStmt = db.prepare('SELECT * FROM meals WHERE id = ?');
        const meal = mealStmt.get(mealId);

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        const ingredientsStmt = db.prepare(`
            SELECT 
                mi.meal_id, 
                i.name as ingredient_name, 
                mi.amount, 
                u.name as unit,
                i.calories, 
                i.protein, 
                i.carbs, 
                i.fats
            FROM meal_ingredients mi
            JOIN ingredients i ON mi.ingredient_id = i.id
            JOIN units u ON mi.unit_id = u.id
            WHERE mi.meal_id = ?
        `);

        const mealIngredients = ingredientsStmt.all(mealId);

        // Attach ingredients to the meal
        meal.ingredients = mealIngredients;

        res.json(meal);

    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});


// Add a new meal
router.post('/add', validateMeal, (req, res, next) => {
    const { name, info, ingredients, meal_type, servings } = req.body;
    console.log(req.body);

    const insertMeal = 'INSERT INTO meals (name, info, meal_type, servings) VALUES (?, ?, ?, ?)';
    const insertMealIngredient = `
        INSERT INTO meal_ingredients (meal_id, ingredient_id, amount, unit_id)
        VALUES (?, ?, ?, ?)
    `;

    try {
        // Begin a transaction
        db.exec('BEGIN TRANSACTION');

        // Insert into meals table
        const stmtMeal = db.prepare(insertMeal);
        const mealResult = stmtMeal.run(name, info, meal_type, servings);

        const mealId = mealResult.lastInsertRowid;

        // Insert each ingredient into meal_ingredients table
        ingredients.forEach(ingredient => {
            const { ingredientId, amount, unitId } = ingredient;
            const stmtMealIngredient = db.prepare(insertMealIngredient);
            stmtMealIngredient.run(mealId, ingredientId, amount, unitId);
        });

        // If everything went well, commit the transaction
        db.exec('COMMIT');

        res.status(201).send({ message: 'Meal successfully created!', mealId: mealId });

    } catch (error) {
        console.error("Error:", error.message);

        // If anything goes wrong, rollback the entire transaction
        db.exec('ROLLBACK');

        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(409).send({ error: 'There was a unique constraint violation!' });
        } else {
            // For any other unexpected error, propagate it to the middleware
            next(error);
        }
    }
});

router.delete('/deactivate/:id', (req, res, next) => {
    const mealId = req.params.id;

    try {
        const currentTimestamp = new Date().toISOString();
        const updateMeal = db.prepare(`
            UPDATE meals 
            SET is_active = 0, name = name || '_' || ?
            WHERE id = ?
        `);
        updateMeal.run(currentTimestamp, mealId);

        res.json({ message: 'Meal marked as inactive successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});


// Update a meal's name, info, or mealType
router.put('/update/:id', (req, res, next) => {
    const mealId = req.params.id;
    const { name, info, mealType, servings } = req.body;

    // Fields for updating
    const updates = [];
    const values = [];

    if (name) {
        updates.push("name = ?");
        values.push(name);
    }

    if (info) {
        updates.push("info = ?");
        values.push(info);
    }

    if (mealType) {
        updates.push("meal_type = ?");
        values.push(mealType);
    }

    if (servings) {
        updates.push("servings = ?");
        values.push(servings);
    }

    // If nothing to update
    if (!updates.length) {
        return res.status(400).send({ error: "No fields provided for update!" });
    }

    // Prepare the SQL statement dynamically
    const sql = `UPDATE meals SET ${updates.join(", ")} WHERE id = ?`;
    values.push(mealId);

    try {
        const stmt = db.prepare(sql);
        const result = stmt.run(...values);

        if (result.changes > 0) {
            res.json({ message: 'Meal details updated successfully' });
        } else {
            res.status(404).json({ message: 'Meal not found' });
        }

    } catch (error) {
        console.error("Error:", error.message);
        next(error);
    }
});



module.exports = router;