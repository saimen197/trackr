import React from 'react';

function RecentMealIntake({ recentIntake, handleDeleteUserMealIntake }) {
    return (
        <div className="recent-meal-intake">
            <div className="list-group">
                {recentIntake.length ? (
                    recentIntake.map(entry => (
                        <div key={entry.id} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{entry.meal_name} </strong> at 
                                {new Date(`${entry.date}T${entry.time}`).toLocaleDateString()} -
                                {new Date(`${entry.date}T${entry.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUserMealIntake(entry.id)}>Delete</button>
                        </div>
                    ))
                ) : (
                    <div className="list-group-item bg-dark text-light">
                        No recent meals logged.
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentMealIntake;
