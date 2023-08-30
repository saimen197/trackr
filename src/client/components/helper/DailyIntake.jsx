import React, { useEffect, useState } from 'react';
import { getUserNutritionalIntake } from '../../api';
import NutritionalBar from './NutritionalBar';

const DailyIntake = ({ date, recentIntake }) => {  // Removed the token prop
    const [data, setData] = useState({});
    
    const DAILY_GOALS = {
        total_calories: 2000,
        total_protein: 50,
        total_carbs: 250,
        total_fats: 70
    };

    useEffect(() => {
        const fetchData = async () => {
            try {                
                const intakeData = await getUserNutritionalIntake(date);  // Only passing the date
                setData(intakeData);
                console.log("intakeData: ", intakeData);
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, [date, recentIntake]);

    return (
        <div>
            <NutritionalBar label="Calories" value={data.total_calories || 0} max={DAILY_GOALS.total_calories} />
            <NutritionalBar label="Protein" value={data.total_protein || 0} max={DAILY_GOALS.total_protein} />
            <NutritionalBar label="Carbs" value={data.total_carbs || 0} max={DAILY_GOALS.total_carbs} />
            <NutritionalBar label="Fats" value={data.total_fats || 0} max={DAILY_GOALS.total_fats} />
        </div>
    );
};

export default DailyIntake;
