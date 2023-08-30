import React, { createContext, useContext, useState } from 'react';
import { getAllMeals } from '../api';

const MealContext = createContext();

export const useMeals = () => {
  return useContext(MealContext);
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [isMealCreationOpen, setIsMealCreationOpen] = useState(false);
  const [newMealId, setNewMealId] = useState(null); 
  const [createdIngredientId, setCreatedIngredientId] = useState(null); 
  const [createdIngredient, setCreatedIngredient] = useState(null); 

  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);

  const openMealCreationModal = () => setIsMealCreationOpen(true);
  const closeMealCreationModal = () => setIsMealCreationOpen(false);

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
        setIngredientModalOpen
      }}>
      {children}
    </MealContext.Provider>
  );
};