import React, { useEffect, useState } from 'react';
import { getUserNutritionalIntake } from '../../api';
import NutritionalBar from './NutritionalBar';
import '../../../../css/NutritionalBar.css';

const DailyIntake = ({ date, recentIntake }) => {
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
                const intakeData = await getUserNutritionalIntake(date);
                setData(intakeData);
                console.log("intakeData: ", intakeData);
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, [date, recentIntake]);

    return (
        <div className="my-4 dark-theme">
            <NutritionalBar label="Calories" value={data.total_calories || 0} max={DAILY_GOALS.total_calories} className="mb-2"/>
            <NutritionalBar label="Protein" value={data.total_protein || 0} max={DAILY_GOALS.total_protein} className="mb-2"/>
            <NutritionalBar label="Carbs" value={data.total_carbs || 0} max={DAILY_GOALS.total_carbs} className="mb-2"/>
            <NutritionalBar label="Fats" value={data.total_fats || 0} max={DAILY_GOALS.total_fats} className="mb-2"/>
        </div>
    );
};

export default DailyIntake;
