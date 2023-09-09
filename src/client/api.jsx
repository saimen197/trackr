
const customFetch = async (url, options = {}) => {    

    let response = await fetch(url, { ...options, credentials: 'include' });

    if (response.status === 401) { // Token expired
        const refreshResponse = await fetch('/api/users/refreshToken', {
            method: 'POST',
            credentials: 'include'  // Ensure cookies are sent with the request.
        });
        console.log('Refresh response: ', refreshResponse)

        if (!refreshResponse.ok) {

            throw new Error('Session expired. Please login again.');
        }

        // Retry the API call
        response = await fetch(url, { ...options, credentials: 'include' });
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
    }

    return response;
}


//Ingredient routes

export const getUnits = () => {
    return customFetch('/api/ingredients/units')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error fetching units:", error);
            throw error;
        });
};

export const createIngredient = (ingredientData) => {
    return customFetch('/api/ingredients/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredientData)
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const responseData = await response.json();
        const { ingredientId } = responseData;
        console.log("Created ingredient with ID:", ingredientId);   
        return ingredientId;
    })
    .catch(error => {
        console.error("Error:", error);
        throw error;  
    });
};

export const getIngredients = async () => {
    try {
            const response=await customFetch('/api/ingredients');
            return await response.json();
        } catch(error) {
            console.error("Error:",error);
            throw error;
        }
};

export const deactivateIngredient = async (ingredientId) => {
    const response = await customFetch(`/api/ingredients/deactivate/${ingredientId}`, {
        method: 'PUT',
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete ingredient');
    }

    return response.json();
};

export const getIngredientIdByName = async (name) => {
    try {
        const response = await customFetch(`/api/ingredients/byName/${name}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching ingredient ID by name');
        }

        return data.ingredientId;
    } catch (error) {
        console.error("Error fetching ingredient ID by name:", error);
        throw error;
    }
};

export const getUnitIdByName = async (unitName) => {
    try {
        const response = await customFetch(`/api/ingredients/units/byName/${unitName}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const responseData = await response.json();
        const { unitId } = responseData;
        return unitId;
    } catch (error) {
        console.error("Error fetching unit ID by name:", error);
        throw error;
    }
};

//Meal routes

export const getAllMeals = () => {
    return customFetch('/api/meals/all')
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching all meals:", error);
            throw error;
        });
};

export const getMealById = async (mealId) => {
    const response = await customFetch(`/api/meals/${mealId}`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error fetching meal by ID');
    }

    return response.json();
};

export const createMeal = async (mealData) => {
    // Convert your frontend structure to match the backend expectation
    const response = await customFetch('/api/meals/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mealData)
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error creating meal');
    }

    const responseData = await response.json();
    const { mealId } = responseData;
    console.log("Created meal with ID:", mealId);

    return mealId;
};

export const deactivateMeal = async (mealId) => {
    const response = await customFetch(`/api/meals/deactivate/${mealId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete meal');
    }

    return response.json();
};


export const updateMealName = async (mealId, name) => {
    const response = await customFetch(`/api/meals/update/${mealId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error updating meal name');
    }

    return response.json();
};

export const updateMealInfo = async (mealId, info) => {
    const response = await customFetch(`/api/meals/update/${mealId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ info })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error updating meal info');
    }

    return response.json();
};

export const updateMealType = async (mealId, mealType) => {
    const response = await customFetch(`/api/meals/update/${mealId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mealType })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error updating meal type');
    }

    return response.json();
};

export const updateMealServings = async (mealId, servings) => {
    const response = await customFetch(`/api/meals/update/${mealId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ servings })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error updating meal servings');
    }

    return response.json();
};

//intake routes

export const saveUserMealIntake = (intakeData) => {
    return customFetch('/api/intake/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(intakeData),
        credentials: 'include'  // Ensure cookies are sent with the request
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .catch(error => {
        console.error("Error:", error);
        throw error;
    });
};

export const deleteUserMealIntake = async (id) => {
    const response = await customFetch(`/api/intake/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'  // Ensure cookies are sent with the request
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error deleting user meal intake');
    }

    return response.json();
};

export const fetchRecentUserMealIntake = async () => {
    try {
        const response = await customFetch("/api/intake/recent", {  

        });

        if (!response.ok) {
            throw new Error("Failed to fetch recent meals intake");
        }
        return await response.json(); // Return the fetched data
    } catch (error) {
        console.error("Error fetching recent meals intake:", error);
        throw error; // Rethrow the error for further handling by the caller.
    }
};

export const getUserNutritionalIntake = async (date) => {  
    const response = await customFetch(`/api/intake/${date}`, {  

    });
    console.log("response from server: ", response);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error fetching user nutritional intake');
    }

    return response.json();
};

//user routes

export const registerUser = (userData) => {
    return customFetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'  
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error:", error);
            throw error;  // Re-throw the error so that it can be caught and handled in the calling function/component
        });
};

export const loginUser = async (credentials) => {
    console.log(credentials);
    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'  
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error logging in');
    }

    return response.json();
};

export const logoutUser = async (refreshToken) => {
    const response = await customFetch('/api/users/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'  
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error logging out');
    }

    return response.json();
};

export const checkAuthStatus = async () => {
   try {
       const response = await customFetch('/api/users/checkAuthStatus');
       if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || 'Server error during auth check.');
       }
       return await response.json();
   } catch (error) {
       console.error("Error checking auth status:", error);
       throw error;
   }
};
