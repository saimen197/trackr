import React, { useReducer, createContext, useContext } from 'react';

export const initialState = {
    ingredients: [],
    amount: '',
    mealIngredients: [],
    totals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    },
    units: [],
    unit: '',
    description: '',
    mealType: '',
    isValid: false,
    mealName: '',
    isModalOpen: false,
    isSaveModalOpen: false,
    currentIngredient: null,
    isSaveValid: false,
    isAmountValid: false,
    filterInput: "",
    isIngredientModalOpen: false
};

export function mealReducer(state, action) {
    switch (action.type) {
        case 'SET_INGREDIENTS':
            return { ...state, ingredients: action.payload };
        case 'SET_AMOUNT':
            return { ...state, amount: action.payload, isAmountValid: action.payload > 0 };
        case 'SET_UNITS':
            return { ...state, units: action.payload };
        case 'SET_UNIT':
            return { ...state, unit: action.payload };
        case 'SET_DESCRIPTION':
            return { ...state, description: action.payload };
        case 'SET_MEAL_TYPE':
            return { ...state, mealType: action.payload };
        case 'TOGGLE_MODAL':
            return { ...state, isModalOpen: !state.isModalOpen };
        case 'TOGGLE_SAVE_MODAL':
            return { ...state, isSaveModalOpen: !state.isSaveModalOpen };
        case 'SET_CURRENT_INGREDIENT':
            return { ...state, currentIngredient: action.payload };
        case 'SET_VALIDATION':
            return { ...state, isValid: action.payload };
        case 'SET_MEAL_NAME':
            return { ...state, mealName: action.payload };
        case 'SET_SAVE_VALIDATION':
            return { ...state, isSaveValid: action.payload };
        case 'SET_FILTER_INPUT':
            return { ...state, filterInput: action.payload };
        case 'TOGGLE_INGREDIENT_MODAL':
            return { ...state, isIngredientModalOpen: !state.isIngredientModalOpen };
        case 'UPDATE_TOTALS':
            return { ...state, totals: action.payload };
        case 'UPDATE_MEAL_INGREDIENTS':
            return { ...state, mealIngredients: action.payload };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

const MealContext = createContext();

export const useMealContext = () => {
    const context = useContext(MealContext);
    if (!context) {
        throw new Error('useMealContext must be used within a MealProvider');
    }
    return context;
};

export const MealProvider = ({ children }) => {
    const [state, dispatch] = useReducer(mealReducer, initialState);
    return <MealContext.Provider value={[state, dispatch]}>{children}</MealContext.Provider>;
};
