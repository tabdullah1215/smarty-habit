// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Briefcase, Calculator, PiggyBank } from 'lucide-react';
import { Header } from './Header';
import { withMinimumDelay } from '../utils/withDelay';
import { getAvailableBudgetTypes } from '../utils/helpers';
import authService from '../services/authService';

const ICONS = {
    Calculator: Calculator,
    Wallet: Wallet,
    Briefcase: Briefcase,
    PiggyBank: PiggyBank
};

export const Home = () => {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const [availableBudgetTypes, setAvailableBudgetTypes] = useState([]);

    // Get the subappId from auth service
    const subappId = authService.getSubappId();

    // Load available budget types based on the subappId
    useEffect(() => {
        const types = getAvailableBudgetTypes(subappId);

        const filteredTypes = types.filter(type =>
            type.id !== 'placeholder' && type.enabled === true
        );

        setAvailableBudgetTypes(filteredTypes);
    }, [subappId]);

    const handleTileClick = async (budgetType) => {
        if (!budgetType.enabled || isNavigating) return;

        setIsNavigating(true);
        const tileElement = document.getElementById(budgetType.id);
        const iconElement = tileElement?.querySelector('.tile-icon');

        if (iconElement) {
            iconElement.classList.add('animate-spin');
            await withMinimumDelay(async () => {
                await navigate(budgetType.route);
            }, 1000);
        }
        setIsNavigating(false);
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="max-w-2xl mx-auto pt-44 md:pt-32 lg:pt-28 px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {availableBudgetTypes.map((budgetType) => {
                        const IconComponent = ICONS[budgetType.icon];

                        return (
                            <div
                                id={budgetType.id}
                                key={budgetType.id}
                                onClick={() => handleTileClick(budgetType)}
                                className={`bg-white shadow-md rounded-lg p-6 border-2
                                    hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer
                                    ${budgetType.borderColor}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className={`text-xl font-semibold ${budgetType.color}`}>
                                        {budgetType.title}
                                    </h2>
                                    <div className={`${budgetType.color} tile-icon transition-transform duration-500`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="text-gray-600">{budgetType.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;