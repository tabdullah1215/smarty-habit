// src/components/Home.js - Habit Tracker version following budget blueprint exactly
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Header } from './Header';
import { withMinimumDelay } from '../utils/withDelay';
import { getAvailableHabitTypes } from '../utils/helpers';
import authService from '../services/authService';

const ICONS = {
    TrendingUp: TrendingUp
};

const Home = () => {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const [availableHabitTypes, setAvailableHabitTypes] = useState([]);

    // Get the subappId from auth service
    const subappId = authService.getSubappId();

    // Load available habit types based on the subappId
    useEffect(() => {
        const types = getAvailableHabitTypes(subappId);

        const filteredTypes = types.filter(type =>
            type.id !== 'placeholder' && type.enabled === true
        );

        setAvailableHabitTypes(filteredTypes);
    }, [subappId]);

    const handleTileClick = async (habitType) => {
        if (!habitType.enabled || isNavigating) return;

        setIsNavigating(true);
        const tileElement = document.getElementById(habitType.id);
        const iconElement = tileElement?.querySelector('.tile-icon');

        if (iconElement) {
            iconElement.classList.add('animate-spin');
            await withMinimumDelay(async () => {
                await navigate(habitType.route);
            }, 1000);
        }
        setIsNavigating(false);
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="max-w-2xl mx-auto pt-44 md:pt-32 lg:pt-28 px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {availableHabitTypes.map((habitType) => {
                        const IconComponent = ICONS[habitType.icon];

                        return (
                            <div
                                id={habitType.id}
                                key={habitType.id}
                                onClick={() => handleTileClick(habitType)}
                                className={`bg-white shadow-md rounded-lg p-6 border-2
                                    hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer
                                    ${habitType.borderColor}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className={`text-xl font-semibold ${habitType.color}`}>
                                        {habitType.title}
                                    </h2>
                                    <div className={`${habitType.color} tile-icon transition-transform duration-500`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="text-gray-600">{habitType.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;