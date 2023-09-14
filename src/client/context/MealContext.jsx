import React, { createContext, useContext, useState } from 'react';
import { getAllMeals } from '../api';

const MealContext = createContext();

export const useMeals = () => {
  return useContext(MealContext);
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [newMealId, setNewMealId] = useState(null); 
  const [createdIngredientId, setCreatedIngredientId] = useState(null); 
  const [createdIngredient, setCreatedIngredient] = useState(false); 
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [amount, setAmount] = useState('');

  const [addedMealName, setAddedMealName] = useState('');
  const [addedMealIngredients, setAddedMealIngredients] = useState([]); 
  const [addedMealType, setAddedMealType] = useState(''); 

  const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealCreationOpen, setIsMealCreationOpen] = useState(false);  
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState(null);
 
  const openMealCreationModal = () => setIsMealCreationOpen(true);
  const closeMealCreationModal = () => {
    setAddedMealName('');
    setAddedMealIngredients([]);
    setIsMealCreationOpen(false);
  }   

  const closeModal = () => {
    setCurrentIngredient(null);
    setAmount('');
    setIsModalOpen(false);
  }  

  const refreshMeals = () => {
    getAllMeals()
      .then((newMeals) => {
        setMeals(newMeals);
      })
      .catch((error) => {
        console.error("Error fetching meals:", error);
      });
  };

  return (
    <MealContext.Provider value={{ 
        meals, 
        setMeals,
        isMealCreationOpen, 
        openMealCreationModal, 
        closeMealCreationModal, 
        refreshMeals,
        newMealId,
        setNewMealId,
        createdIngredientId,
        setCreatedIngredientId,
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
        isDatePickerOpen,
        setDatePickerOpen,
        selectedMealId,
        setSelectedMealId,
        addedMealName,
        setAddedMealName,
        addedMealIngredients,
        setAddedMealIngredients,
        addedMealType, 
        setAddedMealType      
        }}>
      {children}
    </MealContext.Provider>
  );
};