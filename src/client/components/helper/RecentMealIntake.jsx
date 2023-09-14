import React from 'react';

function RecentMealIntake({ recentIntake, handleDeleteUserMealIntake }) {
    const handleDeleteConfirmation = (id) => {
        if (window.confirm('Are you sure you want to remove this meal from your record?')) {
            handleDeleteUserMealIntake(id);
        }
    };

    return (
        <div className="recent-meal-intake">
            <div className="list-group">
                {recentIntake.length ? (
                    recentIntake.map(entry => (
                        <div key={entry.id} className="card bg-dark text-light mb-3">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{entry.meal_name} </strong> 
                                        ({new Date(`${entry.date}T${entry.time}`).toLocaleDateString()} - {new Date(`${entry.date}T${entry.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                    </span>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteConfirmation(entry.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="list-group-item bg-dark text-light text-center">
                        No recent meals logged.
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentMealIntake;
