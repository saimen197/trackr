import React, { useState, useEffect } from 'react';
import { getMealById, fetchRecentUserMealIntake, deactivateMeal, updateMealName, updateMealInfo, updateMealType } from '../api';
import MealCreation from './MealCreation'; 
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
        setDatePickerOpen,
        selectedMealId, 
        setSelectedMealId,
        addedMealName,
        setAddedMealName,
        addedMealIngredients,
        setAddedMealIngredients,
        addedMealType,
        setAddedMealType
    } = useMeals();

    const [expandedMealId, setExpandedMealId] = useState(null);
    const [isEditing, setIsEditing] = useState({ field: null, mealId: null });
    const [editedMealName, setEditedMealName] = useState('');
    const [editedMealInfo, setEditedMealInfo] = useState(''); 
    const [editedMealType, setEditedMealType] = useState(''); 
    const [editedMealServings, setEditedMealServings] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); 

    // Refresh meals and open dialog to log the newly created meal when a new meal was created 
    useEffect(() => {        
        if(newMealId) {
            refreshMeals();
            setDatePickerOpen(true);
            setNewMealId(null);         
        }
    }, [newMealId]);
    
    // Fetch all meals when the component mounts
    useEffect(() => {
        refreshMeals();
    }, []);

    //Log meal with the possibility to change it first
    const handleAddButtonClick = (mealId, mealName, mealIngredients, mealType) => {
        setSelectedMealId(mealId);
        openMealCreationModal();
        setAddedMealName(mealName);
        setAddedMealIngredients(mealIngredients);
        setAddedMealType(mealType);
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
        if (window.confirm('Are you sure you want to permanently delete this meal?')) {
            handleDeleteMeal(mealId);
            fetchRecentUserMealIntake();
        }
    };

    async function handleDeleteMeal(mealId) {
        try {
            await deactivateMeal(mealId);

            // Remove the meal from the meals list
            const updatedMeals = meals.filter(meal => meal.id !== mealId);
            setMeals(updatedMeals);
            //fetchRecentUserMealIntake();

            toast.success("Meal deleted successfully!");

        } catch (error) {
            console.error('Error deleting meal:', error);
            toast.error("Error deleting meal!");
        }
    }       

    //Editing state of field
    const startEditing = (mealId, field) => {
        setIsEditing({ field, mealId });
        const mealToEdit = meals.find(meal => meal.id === mealId);
        if (!mealToEdit) return;
        
        if (field === 'name') setEditedMealName(mealToEdit.name);
        else if (field === 'info') setEditedMealInfo(mealToEdit.info);
        else if (field === 'type') setEditedMealType(mealToEdit.meal_type);
    };

    //Save changes of editing fields
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

                {/* Search Input */}
                <input 
                    type="text"
                    className="form-control me-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a meal..."
                />

                {/* Create new meal */}
                <button className="btn btn-secondary" onClick={openMealCreationModal}>Create New Meal</button>

            </div>

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

             {/* Meals List */}  
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
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            {/* Expand meal with single click */}
                            <button 
                                className="btn-outline-info me-2" 
                                onClick={() => handleMealClick(meal.id)}
                            >
                                {expandedMealId === meal.id ? '-' : '...'}
                            </button>
                           {/* Edit with double click */}  
                            <span                                     
                                onDoubleClick={() => startEditing(meal.id, 'name', meal.name)}
                                className={`me-2 ${selectedMealId === meal.id ? 'font-weight-bold' : ''}`}
                            >
                                {meal.name}
                            </span>
                        </div>
                        <div>
                        {!isEditing || (isEditing.mealId !== meal.id || (isEditing.field !== 'name' && isEditing.field !== 'servings')) ? (
                            <button 
                            className="btn btn-primary me-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddButtonClick(meal.id, meal.name, meal.ingredients, meal.meal_type);
                            }}
                            >
                            Add
                            </button>
                        ) : null}
                        {!isEditing || (isEditing.mealId !== meal.id || (isEditing.field !== 'name' && isEditing.field !== 'servings')) ? (
                            <button 
                            className="btn btn-danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMealPrompt(meal.id);
                            }}
                            >
                            Delete
                            </button>
                        ) : null}
                        </div>
                    </div>

                    {/* Rest of the expanded content */}
                    {expandedMealId === meal.id && (
                        <div className="mt-2">

                        {/* Servings */}
                        <div className="mt-2">
                            Serves: {meal.servings}
                        </div>

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

                        {/* Type */}
                        <p 
                            onDoubleClick={(e) => {
                            e.stopPropagation();  
                            startEditing(meal.id, 'type', meal.meal_type);
                            }}
                        >
                            Type: {meal.meal_type}
                        </p>

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
                    </div>
                ))}
            </ul>


            {isMealCreationOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="card-header"><h3>Create New Meal</h3></div>
                                <button type="button" className="btn-close" onClick={closeMealCreationModal}></button>
                            </div>
                            <div className="modal-body">
                                <MealCreation 
                                    initialMealName={addedMealName}
                                    initialMealIngredients={addedMealIngredients}
                                    initialMealType={addedMealType}                                    
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