import React, { useState, useEffect } from 'react';
import { getMealById, fetchRecentUserMealIntake, deactivateMeal, updateMealName, updateMealInfo, updateMealType, updateMealServings } from '../api';
import MealCreation from './MealCreation'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMeals } from '../context/MealContext';
import '../../../css/app.css';


function MealsList() {
    const {
        meals,
        setMeals,
        isMealCreationOpen,
        openMealCreationModal,
        closeMealCreationModal,
        newMealId,
        setNewMealId,
        refreshMeals,        
        isDatePickerOpen,
        setDatePickerOpen,
        selectedMealId, 
        setSelectedMealId,
        addedMealName,
        setAddedMealName,
        addedMealInfo,
        setAddedMealInfo,
        addedMealIngredients,
        setAddedMealIngredients
    } = useMeals();

    const [expandedMealId, setExpandedMealId] = useState(null);
    const [isEditing, setIsEditing] = useState({ field: null, mealId: null });
    const [editedMealName, setEditedMealName] = useState('');
    const [editedMealInfo, setEditedMealInfo] = useState(''); 
    const [editedMealType, setEditedMealType] = useState(''); 
    const [editedMealServings, setEditedMealServings] = useState(''); 
    const [searchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); 

    useEffect(() => {        
        if(newMealId) {
            refreshMeals();
            console.log('refreshedmeals');
            setDatePickerOpen(true);
            //handleAddButtonClick(newMealId);
            setNewMealId(null);         
        }
    }, [newMealId]);

    useEffect(() => {
        // Fetch all meals when the component mounts
        refreshMeals();

    }, []);

    const handleAddButtonClick = (mealId, mealName, mealInfo, mealIngredients) => {
        setSelectedMealId(mealId);
        openMealCreationModal();
        setAddedMealName(mealName);
        setAddedMealInfo(mealInfo);
        setAddedMealIngredients(mealIngredients);
        console.log('addedMealIngredients: ', addedMealIngredients);
        //setDatePickerOpen(true);
    };

    const handleMealClick = (mealId) => {
        // Toggle expansion. If the meal is already expanded, collapse it
        if (expandedMealId === mealId) {
            setExpandedMealId(null);
        } else {
            setExpandedMealId(mealId);
        }
    };

    const handleDeleteMealPrompt = (mealId) => {
        toast.warning(
            <div>
                Are you sure you want to delete this meal?
                <button onClick={(e) => { 
                    e.stopPropagation(); 
                    handleDeleteMeal(mealId);
                    fetchRecentUserMealIntake();
                }}>
                    Confirm
                </button>
            </div>
        );
    };   

        async function handleDeleteMeal(mealId) {
        try {
            // Use the deleteMeal function from api.jsx
            await deactivateMeal(mealId);

            // Remove the meal from the state
            const updatedMeals = meals.filter(meal => meal.id !== mealId);
            setMeals(updatedMeals);
            fetchRecentUserMealIntake();

            toast.success("Meal deleted successfully!");

        } catch (error) {
            console.error('Error deleting meal:', error);
            toast.error("Error deleting meal!");
        }
    }       

    const startEditing = (mealId, field) => {
        setIsEditing({ field, mealId });
        const mealToEdit = meals.find(meal => meal.id === mealId);
        if (!mealToEdit) return;
        
        if (field === 'name') setEditedMealName(mealToEdit.name);
        else if (field === 'info') setEditedMealInfo(mealToEdit.info);
        else if (field === 'type') setEditedMealType(mealToEdit.meal_type);
        else if (field === 'servings') setEditedMealServings(mealToEdit.servings);
    };

    const saveChanges = async () => {
        try {
            const { field, mealId } = isEditing;

            switch (field) {
                case 'name':
                    await updateMealName(mealId, editedMealName);
                    break;
                case 'info':
                    await updateMealInfo(mealId, editedMealInfo);
                    break;
                case 'type':
                    await updateMealType(mealId, editedMealType);
                    break;
                case 'servings':
                    await updateMealServings(mealId, editedMealServings);
                    break;
                default:
                    throw new Error('Invalid field being edited');
            }

            const updatedMeal = await getMealById(mealId); 
            const updatedMeals = meals.map(meal => meal.id === mealId ? updatedMeal : meal);
            setMeals(updatedMeals);
            fetchRecentUserMealIntake();

            toast.success("Meal updated successfully!");
            
            // Reset editing state
            setIsEditing({ field: null, mealId: null });
            setEditedMealName('');
            setEditedMealInfo('');
            setEditedMealType('');
            setEditedMealServings('');
        } catch (error) {
            console.error('Error updating meal:', error);
            toast.error("Error updating meal!");
        }
    };

    const abortEditing = () => {
        setIsEditing({ field: null, mealId: null });
        setEditedMealName('');
        setEditedMealInfo('');
        setEditedMealType('');
    };    


    const filteredMeals = meals.filter(meal => {
        const isInSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = activeFilter === 'all' || meal.meal_type === activeFilter;
        return isInSearch && matchesType;
    });

    return (
        <>
            <div>
                {/* Render meals */}
                <button onClick={openMealCreationModal}>Create Meal</button>
                {/*{isMealCreationOpen && <MealCreation />}/*}
            </div>

            <div>
                {/* Search Input */}
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a meal..."
                />

                {/* Filter buttons */}
                <button className={activeFilter === 'all' ? 'active-filter' : ''} onClick={() => setActiveFilter('all')}>All</button>
                <button className={activeFilter === 'breakfast' ? 'active-filter' : ''} onClick={() => setActiveFilter('breakfast')}>Breakfast</button>
                <button className={activeFilter === 'lunch' ? 'active-filter' : ''} onClick={() => setActiveFilter('lunch')}>Lunch</button>
                <button className={activeFilter === 'dinner' ? 'active-filter' : ''} onClick={() => setActiveFilter('dinner')}>Dinner</button>
                <button className={activeFilter === 'snack' ? 'active-filter' : ''} onClick={() => setActiveFilter('snack')}>Snack</button>
            </div>         
  
        <ul>
            {filteredMeals.map(meal => (
                <div key={meal.id} className="meal-list-item">
                    {isEditing && isEditing.mealId === meal.id && isEditing.field === 'name' ? (
                        <>
                            <input 
                                type="text" 
                                value={editedMealName} 
                                onChange={(e) => setEditedMealName(e.target.value)}
                            />
                            <button onClick={saveChanges}>Save</button>
                            <button onClick={abortEditing}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <span 
                                onClick={() => handleMealClick(meal.id)}
                                onDoubleClick={() => startEditing(meal.id, 'name', meal.name)}
                                className={selectedMealId === meal.id ? 'selected' : ''}
                            >
                                {meal.name}
                            </span>

                            {isEditing && isEditing.mealId === meal.id && isEditing.field === 'servings' ? (
                                <>
                                    <input 
                                        type="number"
                                        className="input-number"
                                        min="1"
                                        value={editedMealServings}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val > 0 && Number.isInteger(val)) {
                                                setEditedMealServings(val);
                                            }
                                        }}                                            
                                    />
                                        servings
                                    <button onClick={saveChanges}>Save</button>
                                    <button onClick={abortEditing}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span 
                                        onClick={() => handleMealClick(meal.id)}
                                        onDoubleClick={() => startEditing(meal.id, 'servings', meal.servings)}
                                        className={selectedMealId === meal.id ? 'selected' : ''}
                                    >
                                        , {meal.servings} servings
                                    </span> 
                                    
                                    {/* Only render these buttons if neither 'name' nor 'servings' are being edited */}
                                    {!isEditing || (isEditing.mealId !== meal.id || (isEditing.field !== 'name' && isEditing.field !== 'servings')) ? (
                                        <>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddButtonClick(meal.id, meal.name, meal.info, meal.ingredients);
                                                }}
                                            >
                                                Add to daily intake
                                            </button>

                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMealPrompt(meal.id);
                                            }}>Delete</button>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </>
                    )}

                    {expandedMealId === meal.id && (
                        <div className="meal-details">
                            {isEditing && isEditing.mealId === meal.id && isEditing.field === 'info' ? (
                                <>
                                    <textarea 
                                        value={editedMealInfo} 
                                        onChange={(e) => setEditedMealInfo(e.target.value)}
                                        placeholder="Info about the meal"
                                    />
                                    <button onClick={saveChanges}>Save</button>
                                    <button onClick={abortEditing}>Cancel</button>
                                </>
                            ) : (
                                <p onDoubleClick={() => startEditing(meal.id, 'info', meal.info)}> Description: {meal.info} </p>
                            )}

                            {isEditing && isEditing.mealId === meal.id && isEditing.field === 'type' ? (
                                <>
                                    <select 
                                        value={editedMealType} 
                                        onChange={(e) => setEditedMealType(e.target.value)}
                                    >
                                        <option value="" disabled>Select meal type...</option>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                    <button onClick={saveChanges}>Save</button>
                                    <button onClick={abortEditing}>Cancel</button>
                                </>
                            ) : (
                                <p onDoubleClick={() => startEditing(meal.id, 'type', meal.meal_type)}>Type: {meal.meal_type}</p>
                            )}

                            <ul>
                                Ingredients:
                                {meal.ingredients.map(ingredient => (
                                    <li key={ingredient.ingredient_name}>
                                        {ingredient.ingredient_name} - {ingredient.amount} {ingredient.unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </ul>
            {isMealCreationOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => closeMealCreationModal()}>Close</button>
                            <MealCreation 
                                initialMealName={addedMealName}
                                initialDescription={addedMealInfo}
                                initialMealIngredients={addedMealIngredients}
                            />
                    </div>
                </div>
            )}
      </>       
    );
}

export default MealsList;