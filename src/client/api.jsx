const SERVER_ERROR_MSG = 'An error occurred';
const SESSION_EXPIRED_MSG = 'Session expired. Please login again.';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

const handleTokenExpiry = async () => {
    if (!isRefreshing) {
        isRefreshing = true;

        const refreshResponse = await fetch('/api/users/refreshToken', {
            method: 'POST',
            credentials: 'include'
        });

        console.log('Refresh response: ', refreshResponse);

        if (!refreshResponse.ok) {
            const error = new Error(SESSION_EXPIRED_MSG);
            processQueue(error);
            throw error;
        }

        const data = await refreshResponse.json();
        const newToken = data.token; // Assuming the new token is returned in this manner.
        isRefreshing = false;
        processQueue(null, newToken);

        return newToken;
    }

    return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    });
}

const customFetch = async (url, options = {}) => {
    try {
        const response = await fetch(url, { ...options, credentials: 'include' });
        
        // If the response is unauthorized and there's no auth token, redirect to login
        if (response.status === 401 && !options.headers?.Authorization) {
            throw new Error(SESSION_EXPIRED_MSG);
        }

        // If the response is unauthorized and there's an auth token, try to refresh the token
        if (response.status === 401 && options.headers?.Authorization) {
            const newToken = await handleTokenExpiry();
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`
            };
            return fetch(url, options);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || SERVER_ERROR_MSG);
        }
        
        return response;
    } catch (error) {
        if (error.message === SESSION_EXPIRED_MSG) {
            //window.location.href = '/login';
        }
        throw error;
    }
}

const processResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || SERVER_ERROR_MSG);
    }
    return await response.json();
}

//Ingredient routes
export const getUnits = async () => {
    try {
        const response = await customFetch('/api/ingredients/units');
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
    }
};

export const createIngredient = async (ingredientData) => {
    try {
        const response = await customFetch('/api/ingredients/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ingredientData)
        });
        const responseData = await processResponse(response);
        const { ingredientId } = responseData;
        console.log("Created ingredient with ID:", ingredientId);
        return ingredientId;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};
export const getIngredients = async () => {
    try {
        const response = await customFetch('/api/ingredients');
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        throw error;
    }
};

export const deactivateIngredient = async (ingredientId) => {
    try {
        const response = await customFetch(`/api/ingredients/deactivate/${ingredientId}`, {
            method: 'PUT',
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error deactivating ingredient:", error);
        throw error;
    }
};

export const getIngredientIdByName = async (name) => {
    try {
        const encodedName = encodeURIComponent(name);
        const response = await customFetch(`/api/ingredients/byName/${encodedName}`);
        return (await processResponse(response)).ingredientId;
    } catch (error) {
        console.error("Error fetching ingredient ID by name:", error);
        throw error;
    }
};

export const getUnitIdByName = async (unitName) => {
    try {
        const encodedUnitName = encodeURIComponent(unitName);
        const response = await customFetch(`/api/ingredients/units/byName/${encodedUnitName}`);
        return (await processResponse(response)).unitId;
    } catch (error) {
        console.error("Error fetching unit ID by name:", error);
        throw error;
    }
};


//Meal routes

export const getAllMeals = async () => {
    try {
        const response = await customFetch('/api/meals/all');
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching all meals:", error);
        throw error;
    }
};

export const getMealById = async (mealId) => {
    try {
        const response = await customFetch(`/api/meals/${mealId}`);
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching meal by ID:", error);
        throw error;
    }
};

export const createMeal = async (mealData) => {
    try {
        const response = await customFetch('/api/meals/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mealData)
        });
        const { mealId } = await processResponse(response);
        console.log("Created meal with ID:", mealId);
        return mealId;
    } catch (error) {
        console.error("Error creating meal:", error);
        throw error;
    }
};

export const deactivateMeal = async (mealId) => {
    try {
        const response = await customFetch(`/api/meals/deactivate/${mealId}`, {
            method: 'DELETE',
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error deactivating meal:", error);
        throw error;
    }
};

const updateMeal = async (mealId, key, value) => {
    try {
        const response = await customFetch(`/api/meals/update/${mealId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ [key]: value })
        });
        return await processResponse(response);
    } catch (error) {
        console.error(`Error updating meal's ${key}:`, error);
        throw error;
    }
};

export const updateMealName = (mealId, name) => updateMeal(mealId, 'name', name);
export const updateMealInfo = (mealId, info) => updateMeal(mealId, 'info', info);
export const updateMealType = (mealId, mealType) => updateMeal(mealId, 'mealType', mealType);
export const updateMealServings = (mealId, servings) => updateMeal(mealId, 'servings', servings);

//intake routes
export const saveUserMealIntake = async (intakeData) => {
    try {
        const response = await customFetch('/api/intake/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(intakeData),
            credentials: 'include'
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const deleteUserMealIntake = async (id) => {
    try {
        const response = await customFetch(`/api/intake/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error deleting user meal intake:", error);
        throw error;
    }
};

export const fetchRecentUserMealIntake = async () => {
    try {
        const response = await customFetch("/api/intake/recent");
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching recent meals intake:", error);
        throw error;
    }
};

export const getUserNutritionalIntake = async (date) => {
    try {
        const response = await customFetch(`/api/intake/${date}`);
        return await processResponse(response);
    } catch (error) {
        console.error("Error fetching user nutritional intake:", error);
        throw error;
    }
};

// User Routes

export const registerUser = async (userData) => {
    try {
        const response = await customFetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await customFetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const logoutUser = async (refreshToken) => {
    try {
        const response = await customFetch('/api/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
        });
        return await processResponse(response);
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};

export const checkAuthStatus = async () => {
    try {
        const response = await customFetch('/api/users/checkAuthStatus');
        return await processResponse(response);
    } catch (error) {
        console.error("Error checking auth status:", error);
        throw error;
    }
};