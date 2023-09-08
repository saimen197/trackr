 import React, { useState } from 'react';
 
 function AddIntakeModal({ isOpen, onConfirm, onCancel }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [intakeType, setIntakeType] = useState(''); 
    const [served, setServed] = useState('1'); 

    const handleConfirm = () => {
        onConfirm(selectedDate, intakeType, served);
    }

    return (
        <div>
            <h3>Add Meal to daily intake</h3>
            <input type="datetime-local" value={selectedDate.toISOString().substr(0, 16)} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
            
            <div>
                <select 
                    id="intakeType" 
                    value={intakeType} 
                    onChange={(e) => setIntakeType(e.target.value)}
                >
                    <option value="" disabled>Select intake type...</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
            </div>

            <div>
                <label htmlFor="served">Number of servings:</label>
                <input 
                    id="served"
                    type="number" 
                    min="1"
                    value={served}
                    onChange={(e) => setServed(e.target.value)} 
                />
            </div>

            <button onClick={handleConfirm} disabled={!intakeType}>Add to intake</button>  {/* Button is disabled if intakeType is not selected */}
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
}

export default AddIntakeModal;