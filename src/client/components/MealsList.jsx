import React, { useState, useEffect } from 'react';
import { getMealById, fetchRecentUserMealIntake, deactivateMeal, updateMealName, updateMealInfo, updateMealType, updateMealServings } from '../api';
import MealCreation from './MealCreation'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMeals } from '../context/MealContext';


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
    const [searchTerm, setSearchTerm] = useState('');
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                {/* Render meals */}
                <button className="btn btn-secondary" onClick={openMealCreationModal}>Create New Meal</button>
            </div>

            <div className="d-flex align-items-center mb-3">
                {/* Search Input */}
                <input 
                    type="text"
                    className="form-control me-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a meal..."
                />

                {/* Filter buttons */}
                <div className="btn-group">
                    {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(filter => (
                        <button
                            key={filter}
                            className={`btn ${activeFilter === filter ? 'btn-info' : 'btn-outline-info'}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <ul className="list-group">
                {filteredMeals.map(meal => (
                    <div 
                        key={meal.id} 
                        className="list-group-item"
                        onClick={(e) => {
                            if (e.currentTarget === e.target) {
                                handleMealClick(meal.id);
                            }
                        }}                        
                    >                 
                        {isEditing && isEditing.mealId === meal.id && isEditing.field === 'name' ? (
                            <div className="d-flex align-items-center">
                                <input 
                                    type="text"
                                    className="form-control me-2"
                                    value={editedMealName}
                                    onChange={(e) => setEditedMealName(e.target.value)}
                                />
                                <button className="btn btn-success me-2" onClick={saveChanges}>Save</button>
                                <button className="btn btn-secondary" onClick={abortEditing}>Cancel</button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <span                                     
                                    onDoubleClick={() => startEditing(meal.id, 'name', meal.name)}
                                    className={`me-2 ${selectedMealId === meal.id ? 'font-weight-bold' : ''}`}
                                >
                                    {meal.name}
                                </span>
                                {isEditing && isEditing.mealId === meal.id && isEditing.field === 'servings' ? (
                                    <div className="d-flex align-items-center">
                                        <input 
                                            type="number"
                                            className="form-control me-2"
                                            min="1"
                                            value={editedMealServings}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 0 && Number.isInteger(val)) {
                                                    setEditedMealServings(val);
                                                }
                                            }}                                            
                                        />
                                        <span className="me-2">servings</span>
                                        <button className="btn btn-success me-2" onClick={saveChanges}>Save</button>
                                        <button className="btn btn-secondary" onClick={abortEditing}>Cancel</button>
                                    </div>
                                ) : (
                                    <span 
                                        onClick={() => handleMealClick(meal.id)}
                                        onDoubleClick={() => startEditing(meal.id, 'servings', meal.servings)}
                                        className={selectedMealId === meal.id ? 'font-weight-bold' : ''}
                                    >
                                        , {meal.servings} servings
                                    </span>
                                )}
                            </div>
                        )}
                        <button 
                            className="btn-outline-info" 
                            onClick={() => handleMealClick(meal.id)}
                        >
                            {expandedMealId === meal.id ? '-' : '+'}
                        </button>     
                        {expandedMealId === meal.id && (
                            <div className="mt-2">
                                {isEditing && isEditing.mealId === meal.id && isEditing.field === 'info' ? (
                                    <div className="mb-2">
                                        <textarea 
                                            className="form-control"
                                            value={editedMealInfo}
                                            onChange={(e) => setEditedMealInfo(e.target.value)}
                                            placeholder="Info about the meal"
                                        ></textarea>
                                        <button className="btn btn-success mt-2" onClick={saveChanges}>Save</button>
                                        <button className="btn btn-secondary mt-2" onClick={abortEditing}>Cancel</button>
                                    </div>
                                ) : (
                                    <p 
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();  
                                            startEditing(meal.id, 'info', meal.info);
                                        }}
                                    >
                                        Description: {meal.info}
                                    </p>
                                )}

                                {isEditing && isEditing.mealId === meal.id && isEditing.field === 'type' ? (
                                    <div className="mb-2">
                                        <select 
                                            className="form-control"
                                            value={editedMealType}
                                            onChange={(e) => setEditedMealType(e.target.value)}
                                        >
                                            <option value="" disabled>Select meal type...</option>
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                        <button className="btn btn-success mt-2" onClick={saveChanges}>Save</button>
                                        <button className="btn btn-secondary mt-2" onClick={abortEditing}>Cancel</button>
                                    </div>
                                ) : (
                                    <p 
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();  
                                            startEditing(meal.id, 'type', meal.meal_type);
                                        }}
                                    >
                                        Type: {meal.meal_type}
                                    </p>                                
                                )}
                                <ul className="list-unstyled">
                                    <strong>Ingredients:</strong>
                                    {meal.ingredients.map(ingredient => (
                                        <li key={ingredient.ingredient_name}>
                                            {ingredient.ingredient_name} - {ingredient.amount} {ingredient.unit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-2 d-flex justify-content-end">
                            {/* Only render these buttons if neither 'name' nor 'servings' are being edited */}
                            {!isEditing || (isEditing.mealId !== meal.id || (isEditing.field !== 'name' && isEditing.field !== 'servings')) ? (
                                <>
                                    <button 
                                        className="btn btn-primary me-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddButtonClick(meal.id, meal.name, meal.info, meal.ingredients);
                                        }}
                                    >
                                        Add to daily intake
                                    </button>

                                    <button 
                                        className="btn btn-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMealPrompt(meal.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                ))}
            </ul>


            {isMealCreationOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Meal</h5>
                                <button type="button" className="btn-close" onClick={closeMealCreationModal}></button>
                            </div>
                            <div className="modal-body">
                                <MealCreation 
                                    initialMealName={addedMealName}
                                    initialDescription={addedMealInfo}
                                    initialMealIngredients={addedMealIngredients}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

}

export default MealsList;