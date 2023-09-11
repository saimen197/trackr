import React from 'react';

function RecentMealIntake({ recentIntake, handleDeleteUserMealIntake }) {
    return (
        <div className="recent-meal-intake">
            <div className="list-group">
                {recentIntake.map(entry => (
                    <div key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{entry.meal_name} at {entry.date} {entry.time}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUserMealIntake(entry.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentMealIntake;

