import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getIngredients, createMeal, getUnits, deactivateIngredient, getIngredientIdByName, getUnitIdByName } from '../api';
import IngredientCreation from './IngredientCreation';
import { useTable, useSortBy } from 'react-table';
import '../../../css/app.css';
import '../../../css/NutritionalBar.css';
import { useMeals } from '../context/MealContext';
import Modal from 'react-modal';

//Modal.setAppElement('#contents');


function MealCreation({ initialMealName = '', initialDescription = '', initialMealIngredients = [] }) {
    const isMounted = useRef(true);

    const [ingredients, setIngredients] = useState([]);
     
    const [mealIngredients, setMealIngredients] = useState([]);

    const [totals, setTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });
    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [mealType, setMealType] = useState('');     
    const [isValid, setIsValid] = useState(false);
    const [mealName, setMealName] = useState('');
    const [servings, setServings] = useState(1);
    
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const [isSaveValid, setIsSaveValid] = useState(false);
    const [isAmountValid, setIsAmountValid] = useState(false);
    const [filterInput, setFilterInput] = useState("");

    const [initialState, setInitialState] = useState([]);

    const [hasChanged, setHasChanged] = useState(false);
    const [normalized, setNormalized] = useState(false);
    const isInitializing = useRef(true);

    
    const { 
        closeMealCreationModal, 
        refreshMeals, 
        setNewMealId,
        createdIngredient,
        setCreatedIngredient,
        closeModal,
        currentIngredient,
        setCurrentIngredient,
        isModalOpen,
        setIsModalOpen,
        amount,
        setAmount,
        isIngredientModalOpen,
        setIngredientModalOpen,
        setDatePickerOpen,
        setSelectedMealId,
    } = useMeals();
    
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        loadIngredients();
        setCreatedIngredient(false);
    }, [createdIngredient]);

    useEffect(() => {
        setIsAmountValid(amount > 0);
    }, [amount]);

    useEffect(() => {
        setIsSaveValid(mealType);
    }, [mealType]);

    useEffect(() => {
        // The button is valid if there's a meal name and at least one ingredient added.
        setIsValid(mealName.trim() !== "" && mealIngredients.length > 0);
    }, [mealName, mealIngredients]);

    useEffect(() => {
        getUnits()
            .then(data => {
                if (isMounted.current) {
                    setUnits(data);

                    // Set the first unit's ID as default if units are available
                    if (data && data.length > 0) {
                        setUnit(data[0].id);
                    }
                }
            })
            .catch(error => {
                if (isMounted.current) {
                    console.error('Error fetching units:', error);
                }
            });
    }, []);

    useEffect(() => {
        isInitializing.current = true; // Start initializing

        async function initializeData() {
            setMealIngredients(initialMealIngredients);
            setDescription(initialDescription);
            setMealName(initialMealName);

            const { normalizedIngredients, initialTotals } = await normalizeInitialIngredients(initialMealIngredients);
            
            if (isMounted.current) {
                setMealIngredients(normalizedIngredients);
                setTotals(initialTotals);
                setNormalized(true);  // Set normalized to true after normalization
                isInitializing.current = false;
            }
        }
        
        initializeData();
        
        setInitialState({
            mealIngredients: initialMealIngredients,
            description: initialDescription,
            mealName: initialMealName
        });

    }, [initialMealName, initialDescription, initialMealIngredients]);

    useEffect(() => {
        const checkForChanges = () => {
            if (!isInitializing.current && normalized && (initialState.mealName !== mealName ||
                initialState.description !== description ||
                JSON.stringify(initialState.mealIngredients) !== JSON.stringify(mealIngredients))) {
                setHasChanged(true);
            } else {
                setHasChanged(false);
            }
        }

        checkForChanges();
    }, [mealName, description, mealIngredients]);

    const normalizeInitialIngredients = async (ingredients) => {
        let initialTotals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };

        const normalizedIngredients = await Promise.all(ingredients.map(async ingredient => {
            let ingredientId, unitId, conversionFactor = 1;

            try {
                ingredientId = await getIngredientIdByName(ingredient.ingredient_name);
                unitId = await getUnitIdByName(ingredient.unit);

                // Fetch the conversion factor for the unit
                const selectedUnit = units.find(u => u.id === unitId);
                if (selectedUnit) {
                    conversionFactor = selectedUnit.conversion_factor_to_gram;
                }

                // Convert the ingredient amount to grams
                const amountInGrams = ingredient.amount * conversionFactor;

                initialTotals.calories += ingredient.calories * (amountInGrams / 100);
                initialTotals.protein += ingredient.protein * (amountInGrams / 100);
                initialTotals.carbs += ingredient.carbs * (amountInGrams / 100);
                initialTotals.fats += ingredient.fats * (amountInGrams / 100);

            
            } catch (error) {
                console.error("Error fetching IDs:", error);
            }

            return {
                ingredientId: ingredientId,
                name: ingredient.ingredient_name,
                amount: ingredient.amount,
                unitId: unitId
            };
        }));

        return { normalizedIngredients, initialTotals };
    }


    const loadIngredients = async () => {
        try {
            const data = await getIngredients();
            if (isMounted.current) {
                setIngredients(data.filter(ingredient => ingredient.is_active === 1));
                return data;
            }
        } catch (error) {
            if (isMounted.current) {
                toast.error("Error loading ingredients: " + error.message);
            }
        }
    }

    const openModal = (ingredient) => {
        console.log(ingredient);
        setCurrentIngredient(ingredient);
        setIsModalOpen(true);
    }

    const addIngredientToMeal = () => {
        if (!currentIngredient) {
            console.error("Ingredient not available");
            return;
        }

        const isIngredientAlreadyAdded = mealIngredients.some(ing => ing.ingredientId === currentIngredient.id);
        if (isIngredientAlreadyAdded) {
            toast.warn("This ingredient is already added to the meal!");
            return;
        }        

        const selectedUnit = units.find(u => u.id === Number(unit));
        if (!selectedUnit) {
            console.error("No unit found with ID:", unit);
            return;
        }

        const newIngredient = {
            ingredientId: currentIngredient.id,
            name: currentIngredient.name,
            amount,
            unitId: selectedUnit.id
        };
        setMealIngredients(prev => [...prev, newIngredient]);

        // Convert the amount to grams
        const amountInGrams = amount * selectedUnit.conversion_factor_to_gram;

        // Update totals
        const newTotals = {
            calories: totals.calories + currentIngredient.calories * (amountInGrams / 100),
            protein: totals.protein + currentIngredient.protein * (amountInGrams / 100),
            carbs: totals.carbs + currentIngredient.carbs * (amountInGrams / 100),
            fats: totals.fats + currentIngredient.fats * (amountInGrams / 100)
        };
        setTotals(newTotals);

        // Close the modal and reset fields
        closeModal();
        toast.success(`${amount}${selectedUnit.name} ${currentIngredient.name} added`);
    };

    const removeIngredientFromMeal = (indexToRemove) => {
        // Remove the ingredient
        const newIngredients = mealIngredients.filter((_, index) => index !== indexToRemove);
        setMealIngredients(newIngredients);

        // Adjust totals
        let newTotals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };
        
        newIngredients.forEach(ing => {
            const baseIngredient = ingredients.find(baseIng => baseIng.id === ing.ingredientId);
            if (baseIngredient) {
                // Convert the amount to grams
                const unitForIngredient = units.find(u => u.id === ing.unitId);
                const amountInGrams = ing.amount * (unitForIngredient ? unitForIngredient.conversion_factor_to_gram : 1);
                
                newTotals.calories += baseIngredient.calories * (amountInGrams / 100);
                newTotals.protein += baseIngredient.protein * (amountInGrams / 100);
                newTotals.carbs += baseIngredient.carbs * (amountInGrams / 100);
                newTotals.fats += baseIngredient.fats * (amountInGrams / 100);
            }
        });

        setTotals(newTotals);
    };

    const handleDeleteIngredient = (ingredientId) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            deactivateIngredient(ingredientId)
                .then(() => {
                    if (isMounted.current) {
                        toast.success('Ingredient deleted successfully');
                        loadIngredients(); // This will refresh the ingredient list
                    }
                })
                .catch(err => {
                    if (isMounted.current) {
                        toast.error('Error deleting ingredient: ' + err.message);
                    }
                });
        }
    };
    const openSaveModal = () => {
        setIsSaveModalOpen(true);
    }

    const confirmSaveMeal = async () => {
        try {
            const mealData = {
                name: mealName,
                servings,  // Include servings here
                info: description,
                ingredients: mealIngredients,
                meal_type: mealType
            };
            console.log("Sending data:", mealData);

            const response = await createMeal(mealData);
            if (response && isMounted.current) {
                toast.success("Meal successfully created!");
                console.log(response);

                // Reset the form
                setMealIngredients([]);
                setTotals({
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fats: 0
                });
                setMealType('');
                setMealName('');

                setNewMealId(response);
                setSelectedMealId(response);

                closeMealCreationModal();
                //refreshMeals();
            }
        } catch (error) {
            if (isMounted.current) {
                toast.error("Error creating meal: " + error.message);
            }
        }
        if (isMounted.current) {
            setIsSaveModalOpen(false);
        }
    };

    const filteredRows = React.useMemo(() => {
        if (!filterInput) return ingredients;
        return ingredients.filter(row => {
            return row.name.toLowerCase().includes(filterInput.toLowerCase());
        });
    }, [filterInput, ingredients]);

    const data = React.useMemo(() => filteredRows, [filteredRows]);

    const columns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Calories (kcal)',
                accessor: 'calories',
            },
            {
                Header: 'Protein',
                accessor: 'protein',
            },
            {
                Header: 'Carbs',
                accessor: 'carbs',
            },
            {
                Header: 'Fats',
                accessor: 'fats',
            },
            {
                accessor: 'id',
                Cell: ({ value }) => {
                    const isIngredientAdded = mealIngredients.some(ing => ing.ingredientId === value);

                    return (
                        <div>
                            {!isIngredientAdded ? (
                                <button onClick={() => openModal(ingredients.find(ing => ing.id === value))}>
                                    Add to Meal
                                </button>
                            ) : (
                                <button disabled>Added</button>
                            )}
                            <button onClick={() => handleDeleteIngredient(value)}>
                                Delete
                            </button>
                        </div>
                    );
                }
            }

        ],
        [ingredients, mealIngredients]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <div>
            <input
                type="text"
                placeholder="Meal Name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
            />

            <textarea 
                placeholder="Description or Additional Information"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>


            {/* List of added ingredients */}
            {mealIngredients.map((ing, index) => {
                return (
                    <div key={`${ing.ingredient_name || ing.name}-${index}`}>
                        {ing.amount} {ing.unit || units.find(u => u.id === ing.unitId)?.name} {ing.ingredient_name || ing.name}
                        <button onClick={() => removeIngredientFromMeal(index)}>-</button>
                    </div>
                );
            })}

            {/* Totals */}
            <div>
                <strong>Total Calories:</strong> {totals.calories}
                <strong>Total Protein:</strong> {totals.protein}g
                <strong>Total Carbs:</strong> {totals.carbs}g
                <strong>Total Fats:</strong> {totals.fats}g
            </div>

            {hasChanged? (                
                <button onClick={openSaveModal} disabled={!isValid}> Save and Log Meal</button>
            ) : (
                <button onClick={setDatePickerOpen} disabled={!isValid}>Log Meal</button>
            )}           

            {/* Log button 
            <button onClick={setDatePickerOpen} disabled={!isValid}>Log Meal</button>

            {/* Save button
            <button onClick={openSaveModal} disabled={!isValid}> Save and Log Meal</button>*/}

            {/* Search Field */}
            <input
                value={filterInput}
                onChange={e => setFilterInput(e.target.value)}
                placeholder="Search for an ingredient..."
            />            

            <button onClick={() => setIngredientModalOpen(true)}>Create New Ingredient</button>


            {/* Ingredients List with Add button */}
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Ingredient Addition Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add {currentIngredient?.name} to Meal </h3>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
                        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={addIngredientToMeal} disabled={!isAmountValid}>Add to Meal</button>
                        <button onClick={closeModal}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Save Meal Modal */}
            {isSaveModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Save Meal</h3>
                        
                        {/* Servings Input */}
                        <label htmlFor="servings">Number of Servings:</label>
                        <input
                            type="number"
                            min="1"
                            value={servings}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > 0 && Number.isInteger(val)) {
                                    setServings(val);
                                }
                            }}
                        />

                        <label htmlFor="modalMealType">Meal Type:</label>
                        <select 
                            id="modalMealType"
                            value={mealType} 
                            onChange={(e) => setMealType(e.target.value)}
                        >
                            <option value="" disabled>Select meal type...</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                        </select>

                        <button onClick={confirmSaveMeal} disabled={!isSaveValid} >Save Meal</button>
                        <button onClick={() => setIsSaveModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {isIngredientModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => setIngredientModalOpen(false)}>Close</button>
                        <IngredientCreation />
                    </div>
                </div>
            )}
        </div>
    );
}

export default MealCreation;