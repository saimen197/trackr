import React from 'react';

function RecentMealIntake({ recentIntake, handleDeleteUserMealIntake }) {
    return (
        <div className="recent-meal-intake">
            
            <ul>
                {recentIntake.map(entry => (
                    <li key={entry.id}>
                        {entry.meal_name} at {entry.date} {entry.time}
                        <button onClick={() => handleDeleteUserMealIntake(entry.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RecentMealIntake;