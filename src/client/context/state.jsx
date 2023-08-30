export const initialState = {
  ingredients: [],
  mealIngredients: [],
  mealType: "",
  mealInfo: "",
  // Add other states if required
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_INGREDIENTS':
      return { ...state, ingredients: action.payload };
    case 'ADD_MEAL_INGREDIENT':
      return { ...state, mealIngredients: [...state.mealIngredients, action.payload] };
    case 'REMOVE_MEAL_INGREDIENT':
      const updatedMealIngredients = [...state.mealIngredients];
      updatedMealIngredients.splice(action.index, 1);
      return { ...state, mealIngredients: updatedMealIngredients };
    case 'SET_MEAL_TYPE':
      return { ...state, mealType: action.payload };
    case 'SET_MEAL_INFO':
      return { ...state, mealInfo: action.payload };
    // Add other cases if required
    default:
      return state;
  }
};
