import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getIngredients, createMeal, getUnits, deactivateIngredient, getIngredientIdByName, getUnitIdByName } from '../api';
import IngredientCreation from './IngredientCreation';
import { useTable, useSortBy } from 'react-table';
//import '../../../css/NutritionalBar.css';
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
                headerClassName: 'dark-table thead',
            },
            {
                Header: 'Calories (kcal) / 100g',
                accessor: 'calories',
                headerClassName: 'dark-table thead',
            },
            {
                Header: 'Protein / 100g',
                accessor: 'protein',
                headerClassName: 'dark-table thead',
            },
            {
                Header: 'Carbs / 100g',
                accessor: 'carbs',
                headerClassName: 'dark-table thead',
            },
            {
                Header: 'Fats / 100g',
                accessor: 'fats',
                headerClassName: 'dark-table thead',
            },
            {
                accessor: 'id',
                headerClassName: 'dark-table thead',
                Cell: ({ value }) => {
                    const isIngredientAdded = mealIngredients.some(ing => ing.ingredientId === value);

                    return (
                        <div>
                            {!isIngredientAdded ? (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => openModal(ingredients.find(ing => ing.id === value))}
                                >
                                    Add 
                                </button>
                            ) : (
                                <button className="btn btn-secondary" disabled>Added</button>
                            )}
                            <button 
                                className="btn btn-danger" 
                                onClick={() => handleDeleteIngredient(value)}
                            >
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
        <div className="dark-bg">
            {/* 1. Inputs and Textareas */}
            <input
                type="text"
                className="form-control dark-input mb-2"
                placeholder="Meal Name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
            />

            <textarea 
                className="form-control dark-input mb-2"
                placeholder="Description or Additional Information"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {/* 2. Ingredients List */}
            {mealIngredients.map((ing, index) => (
                <div key={`${ing.ingredient_name || ing.name}-${index}`} className="ingredient-item d-flex justify-content-between align-items-center mb-2">
                    <span>{ing.amount} {ing.unit || units.find(u => u.id === ing.unitId)?.name} {ing.ingredient_name || ing.name}</span>
                    <button className="btn btn-sm btn-danger" onClick={() => removeIngredientFromMeal(index)}>Remove</button>
                </div>
            ))}

            {/* 3. Totals and Buttons */}
            <div className="mb-2">
                <strong>Total Calories:</strong> {Math.round(totals.calories)}
                <strong>Total Protein:</strong> {Math.round(totals.protein)}g
                <strong>Total Carbs:</strong> {Math.round(totals.carbs)}g
                <strong>Total Fats:</strong> {Math.round(totals.fats)}g
            </div>

            {hasChanged ? (                
                <button onClick={openSaveModal} className="btn btn-primary mb-2" disabled={!isValid}> Save and Log Meal</button>
            ) : (
                <button onClick={setDatePickerOpen} className="btn btn-primary mb-2" disabled={!isValid}>Log Meal</button>
            )}

            {/* 4. Search Field */}
            <input
                className="form-control mb-2"
                value={filterInput}
                onChange={e => setFilterInput(e.target.value)}
                placeholder="Search for an ingredient..."
            />

            <button className="btn btn-secondary mb-2" onClick={() => setIngredientModalOpen(true)}>Create New Ingredient</button>

            {/* 5. Table */}
            <div className="table-responsive">
            <table {...getTableProps()} className="dark-table table-responsive">
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
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            </div>  
            
            {/* 6. Modals */}

            {/* Ingredient Addition Modal */}
            {isModalOpen && (
                <div className="modal-overlay modal show d-block dark-modal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add {currentIngredient?.name} to Meal</h5>
                                <button type="button" className="close" onClick={closeModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <input type="number" className="form-control mb-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
                                <select className="form-control mb-2" value={unit} onChange={(e) => setUnit(e.target.value)}>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button onClick={addIngredientToMeal} className="btn btn-primary" disabled={!isAmountValid}>Add to Meal</button>
                                <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Meal Modal */}
            {isSaveModalOpen && (
                <div className="modal-overlay modal show d-block dark-modal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Save Meal</h5>
                                <button type="button" className="close" onClick={() => setIsSaveModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="servings" className="mb-2">Number of Servings:</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control mb-2"
                                    value={servings}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > 0 && Number.isInteger(val)) {
                                            setServings(val);
                                        }
                                    }}
                                />

                                <label htmlFor="modalMealType" className="mb-2">Meal Type:</label>
                                <select 
                                    id="modalMealType"
                                    className="form-control mb-2"
                                    value={mealType} 
                                    onChange={(e) => setMealType(e.target.value)}
                                >
                                    <option value="" disabled>Select meal type...</option>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button onClick={confirmSaveMeal} className="btn btn-primary" disabled={!isSaveValid} >Save Meal</button>
                                <button onClick={() => setIsSaveModalOpen(false)} className="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ingredient Creation Modal */}
            {isIngredientModalOpen && (
                <div className="modal-overlay modal show d-block dark-modal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ingredient Creation</h5>
                                <button type="button" className="btn-close" onClick={() => setIngredientModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <IngredientCreation />
                            </div>
                        </div>
                    </div>
                </div>
            )}
                
        </div>
    );

}

export default MealCreation;