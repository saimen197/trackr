 ### GET /meals/all

**Description**: Retrieve all active meals.

**Headers**:
- Authorization: Bearer [token]

**Sample Response**:

HTTP/1.1 200 OK

```json
[   {      "id": 1,      "name": "Chicken Salad",      "ingredients": [         {            "ingredient_name": "Chicken",            "amount": 100,            "unit": "grams",            "calories": 165,            "protein": 31,            "carbs": 0,            "fats": 3.6         }         // ... More ingredients      ]
   }
   // ... More meals
]
