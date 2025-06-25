// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Briefcase, Calculator, PiggyBank, Star, Heart, Zap } from 'lucide-react';
import { Header } from './Header';
import { withMinimumDelay } from '../utils/withDelay';
import { getAvailableTypes } from '../utils/helpers';
import authService from '../services/authService';

const ICONS = {
    Calculator: Calculator,
    Wallet: Wallet,
    Briefcase: Briefcase,
    PiggyBank: PiggyBank,
    Star: Star,
    Heart: Heart,
    Zap: Zap
};

export const Home = () => {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const [availableTypes, setAvailableTypes] = useState([]);

    // Get the subappId from auth service
    const subappId = authService.getSubappId();
    // Get the appId from auth service
    const appId = authService.getAppId();

    // Load available budget types based on the subappId
    // Load available types based on the appId and subappId
    useEffect(() => {
        const types = getAvailableTypes(appId, subappId);

        const filteredTypes = types.filter(type =>
            type.id !== 'placeholder' && type.enabled === true
        );

        setAvailableTypes(filteredTypes);
    }, [appId, subappId]);

    const handleTileClick = async (type) => {
        if (!type.enabled || isNavigating) return;

        setIsNavigating(true);
        const tileElement = document.getElementById(type.id);
        const iconElement = tileElement?.querySelector('.tile-icon');

        if (iconElement) {
            iconElement.classList.add('animate-spin');
            await withMinimumDelay(async () => {
                await navigate(type.route);
            }, 1000);
        }
        setIsNavigating(false);
    };

    // Determine the app title based on appId
    const getAppTitle = () => {
        switch (appId) {
            case 'habit-tracker':
                return 'Habit Tracker';
            case 'budget-tracker':
            default:
                return 'Budget Tracker';
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="max-w-2xl mx-auto pt-44 md:pt-32 lg:pt-28 px-4 sm:px-6 lg:px-8">
                {/* Optional: Add app title indicator */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{getAppTitle()}</h1>
                    <p className="text-gray-600 mt-1">Choose a category to get started</p>
                </div>

                <div className="space-y-4">
                    {availableTypes.map((type) => {
                        const IconComponent = ICONS[type.icon];

                        return (
                            <div
                                id={type.id}
                                key={type.id}
                                onClick={() => handleTileClick(type)}
                                className={`bg-white shadow-md rounded-lg p-6 border-2
                hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer
                ${type.borderColor}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className={`text-xl font-semibold ${type.color}`}>
                                        {type.title}
                                    </h2>
                                    <div className={`${type.color} tile-icon transition-transform duration-500`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="text-gray-600">{type.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;