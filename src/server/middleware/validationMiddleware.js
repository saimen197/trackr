const { check, validationResult } = require('express-validator');

const validateIngredient = [
    check('name').notEmpty().withMessage('Name is required'),
    check('calories').isFloat({ min: 0 }).withMessage('Valid calories are required'),
    check('protein').isFloat({ min: 0 }).withMessage('Valid protein amount is required'),
    check('carbs').isFloat({ min: 0 }).withMessage('Valid carbs amount is required'),
    check('fats').isFloat({ min: 0 }).withMessage('Valid fats amount is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateMealIntake = [
    check('meal_id').isInt().withMessage('Valid meal_id is required'),
    check('date').isISO8601().withMessage('Valid date is required'),
    check('time').matches(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).withMessage('Valid time format (HH:mm:ss) is required'),
    check('intake_type').notEmpty().withMessage('Intake type is required'),
    check('served').isFloat({ min: 0 }).withMessage('Valid served amount is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateDate = [
    check('date').isISO8601().withMessage('Valid date is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateIntakeId = [
    check('id').isInt().withMessage('Valid intake ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateMeal = [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('info').optional().isString().withMessage('Info should be a string'),
    check('meal_type').isIn(["breakfast", "lunch", "dinner", "snack"]).withMessage('Invalid meal type'),
    check('servings').isInt({ min: 1 }).withMessage('Servings should be an integer greater than 0'),
    check('ingredients')
        .isArray()
        .withMessage('Ingredients should be an array')
        .notEmpty()
        .withMessage('At least one ingredient is required'),
    check('ingredients.*.ingredientId').isInt({ min: 1 }).withMessage('Invalid ingredient ID'),
    check('ingredients.*.amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 0 })
        .withMessage('Amount should be a positive number'),
    check('ingredients.*.unitId')
        .notEmpty()
        .withMessage('Unit ID is required')
        .isInt({ min: 1 })
        .withMessage('Invalid unit ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];



module.exports = {
    validateIngredient,
    validateMealIntake,
    validateDate,
    validateIntakeId,
    validateMeal
};
