import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { createIngredient } from '../api';
import { useMeals } from '../context/MealContext';

function IngredientCreation() {
    const [ingredientName, setIngredientName] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [calories, setCalories] = useState('');

    const { 
        setIngredientModalOpen,
        setCurrentIngredient,
        setIsModalOpen, 
        setCreatedIngredient  
    } = useMeals();

    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const areFieldsValid = () => {
        return ingredientName && protein && carbs && fats;
    };

    const handleSubmit = async () => {
        if (!areFieldsValid()) {
            alert("All fields except calories must be filled!");
            return;
        }

        let finalCalories = calories;
        if (!calories) {
            finalCalories = (protein * 4) + (carbs * 4) + (fats * 9);
        }

        try {
            const ingredientId = await createIngredient({ name: ingredientName, calories: finalCalories, protein, carbs, fats });
            console.log("returned from api: ", ingredientId);
            if (!isMounted.current) return; 

            if (ingredientId) {
                toast.success("Ingredient successfully created!");

                const newIngredient = {
                    id: ingredientId,
                    name: ingredientName,
                    calories: finalCalories,
                    protein,
                    carbs,
                    fats
                };
                setCurrentIngredient(newIngredient);
                setIsModalOpen(true);                
                setIngredientModalOpen(false);
                setCreatedIngredient(true);
                
                // Reset the form
                setIngredientName('');
                setProtein('');
                setCarbs('');
                setFats('');
                setCalories('');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error creating ingredient: " + error.message);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Ingredient Name" 
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
            />
            <input 
                type="number"
                min="0"
                placeholder="Calories/100g"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
            />
            <input 
                type="number"
                min="0"
                placeholder="Protein/100g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
            />
            <input 
                type="number"
                min="0"
                placeholder="Carbs/100g"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
            />
            <input 
                type="number"
                min="0"
                placeholder="Fats/100g"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={!areFieldsValid()}>Save Ingredient</button>
        </div>
    );
}

export default IngredientCreation;
