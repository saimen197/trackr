import React, { useState, useEffect, useRef } from 'react';
import { getMealById, saveUserMealIntake, deleteUserMealIntake, fetchRecentUserMealIntake, deactivateMeal, updateMealName, updateMealInfo, updateMealType, updateMealServings } from '../api';
import MealCreation from './MealCreation';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMeals } from '../context/MealContext';
import '../../../css/app.css';
import DailyIntake from './helper/DailyIntake';
import RecentMealIntake from './helper/RecentMealIntake';
import AddIntakeModal from './helper/AddIntakeModal';
import MealsList from './MealsList';


function MainComponent() {
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
        selectedMealId
    } = useMeals();

    const { userId } = useAuth();
    const [expandedMealId, setExpandedMealId] = useState(null);
    const [isEditing, setIsEditing] = useState({ field: null, mealId: null });
    const [editedMealName, setEditedMealName] = useState('');
    const [editedMealInfo, setEditedMealInfo] = useState(''); 
    const [editedMealType, setEditedMealType] = useState(''); 
    const [editedMealServings, setEditedMealServings] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');  
    const isMounted = useRef(true);   
    const [showNutritionDate, setShowNutritionDate] = useState(new Date().toISOString().split('T')[0]);
    const [recentIntake, setRecentIntake] = useState([]);


    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const updateRecentIntake = async () => {
        try {
            const data = await fetchRecentUserMealIntake();
            if (isMounted.current) { // Ensure that the component is still mounted when updating the state
                setRecentIntake(data);
            }
        } catch (error) {
            console.error("Error fetching recent meals intake in component:", error);
        }
    };

    useEffect(() => {
        updateRecentIntake(); // Call the function
    }, []);



    const handleDateConfirm = async (selectedDate, intakeType, served) => {
        setDatePickerOpen(false);

        const date = selectedDate.toISOString().split('T')[0];
        const time = selectedDate.toTimeString().split(' ')[0];

        const userMealIntakeData = {
            user_id: userId,
            meal_id: selectedMealId,
            date,
            time,
            intake_type: intakeType,
            served: served 
        };

        try {
            console.log(userMealIntakeData);
            await saveUserMealIntake(userMealIntakeData);
            updateRecentIntake();
            toast.success("Meal added to daily intake successfully!");  // <-- This line adds the success toast

        } catch (error) {
            console.error('Error saving user meal intake:', error);
            toast.error("Error adding meal to daily intake!");
        }
    };

    async function handleDeleteUserMealIntake(entryId) {
        try {
            // Assuming you have a delete function in api.jsx named deleteUserMealIntake
            await deleteUserMealIntake(entryId);
            
            // Update the recentIntake state
            const updatedIntake = recentIntake.filter(entry => entry.id !== entryId);
            setRecentIntake(updatedIntake);

            toast.success("Meal intake entry deleted successfully!");

        } catch (error) {
            console.error('Error deleting meal intake entry:', error);
            toast.error("Error deleting meal intake entry!");
        }
    }

    return (
        <div className="main-component">
            <div>
                <h2>Nutritional Intake</h2> 
                <input 
                    type="date" 
                    value={showNutritionDate} 
                    onChange={(e) => setShowNutritionDate(e.target.value)}
                />

                <DailyIntake date={showNutritionDate} recentIntake={recentIntake} />

            </div>

            <div>
                <h2>Recent Meals logged</h2>     
            
                <RecentMealIntake recentIntake={recentIntake} handleDeleteUserMealIntake={handleDeleteUserMealIntake} />
            </div> 
            <h2>Log Meals</h2>           

            <MealsList/>
 
            {isDatePickerOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AddIntakeModal 
                            isOpen={isDatePickerOpen} 
                            onConfirm={handleDateConfirm}
                            onCancel={() => setDatePickerOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );

}

export default MainComponent;