const express = require('express');
const db = require('../db/database.js');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/add', authenticateJWT,  (req, res, next) => {
    const userId = req.user.id; // Using this id as authenticateJWT will set this based on token payload
    const { meal_id, date, time, intake_type, served } = req.body;

    try {
        const insertIntake = db.prepare(`
            INSERT INTO user_meal_intake (user_id, meal_id, date, time, intake_type, served) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertIntake.run(userId, meal_id, date, time, intake_type, served); // Using userId here
        res.status(201).json({ message: 'Meal intake successfully recorded!' }); 
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: 'Error recording meal intake!' });
    }    
});

// Route to fetch the most recent meal intakes for a user
router.get('/recent', authenticateJWT, (req, res, next) => {
    const userId = req.user.id;

    // Set a limit for the number of recent records you want to fetch
    // Here, I'm assuming you want to get the 5 most recent records, but you can change this value.
    const limit = 5;

    // SQL request to fetch the recent user intake for a specific user
    const sql = `
    SELECT 
        umi.id, umi.date, umi.time, umi.intake_type, 
        m.name AS meal_name,
        SUM(ing.calories * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_calories,
        SUM(ing.protein * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_protein,
        SUM(ing.carbs * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_carbs,
        SUM(ing.fats * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_fats
    FROM 
        user_meal_intake umi 
    JOIN 
        meal_ingredients mi ON umi.meal_id = mi.meal_id
    JOIN 
        ingredients ing ON mi.ingredient_id = ing.id
    JOIN 
        units u ON mi.unit_id = u.id
    JOIN
        meals m ON umi.meal_id = m.id
    WHERE 
        umi.user_id = ? 
    GROUP BY
        umi.id, umi.date, umi.time, umi.intake_type
    ORDER BY
        umi.date DESC, umi.time DESC
    LIMIT ?;
    `;

    // Execute the query with the user ID and limit as parameters
    try {
        const stmt = db.prepare(sql);
        const results = stmt.all(userId, limit);
        res.status(200).json(results);  
    } catch (err) {
        console.error('Error fetching recent user intake:', err.message);
        res.status(500).json({ message: 'Error fetching recent user intake.' });
    }
});


router.get('/:date', authenticateJWT, (req, res, next) => {
    const userId = req.user.id; // This assumes authenticateJWT middleware adds the user object to req
    const date = req.params.date;

    // SQL request to fetch the user intake for a specific date
    const sql = `
    SELECT 
        SUM(ing.calories * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_calories,
        SUM(ing.protein * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_protein,
        SUM(ing.carbs * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_carbs,
        SUM(ing.fats * mi.amount * 1/100 * u.conversion_factor_to_gram * (umi.served/m.servings) ) AS total_fats
    FROM 
        user_meal_intake umi 
    JOIN 
        meal_ingredients mi ON umi.meal_id = mi.meal_id
    JOIN 
        ingredients ing ON mi.ingredient_id = ing.id
    JOIN 
        units u ON mi.unit_id = u.id
    JOIN
        meals m ON umi.meal_id = m.id    
    WHERE 
        umi.user_id = ? 
    AND
        umi.date = ?;
    `;

    // Execute the query with the user ID and date as parameters
    try {
        const stmt = db.prepare(sql);
        const result = stmt.all(userId, date);
        res.status(200).json(result[0]);  // Assuming the result is a single aggregate row
    } catch (err) {
        console.error('Error fetching user intake:', err.message);
        res.status(500).json({ message: 'Error fetching user intake.' });
    }
});

// Delete a specific user meal intake entry
router.delete('/delete/:id', authenticateJWT, (req, res, next) => {
    const userId = req.user.id;
    const id = req.params.id;

    try {
        // First, verify that the intake belongs to the authenticated user
        const verifyStmt = db.prepare('SELECT user_id FROM user_meal_intake WHERE id = ?');
        const intakeRecord = verifyStmt.get(id);

        if (!intakeRecord) {
            return res.status(404).json({ message: 'Intake record not found.' });
        }

        if (intakeRecord.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: This record does not belong to the authenticated user.' });
        }

        // Delete the record
        const deleteStmt = db.prepare('DELETE FROM user_meal_intake WHERE id = ?');
        deleteStmt.run(id);

        res.json({ message: 'Meal intake entry deleted successfully' });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: 'Error deleting meal intake entry.' });
    }
});



module.exports = router;
