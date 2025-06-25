// src/components/PremiumHabits.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Star } from 'lucide-react';
import { Header } from './Header';
import authService from '../services/authService';

export const PremiumHabits = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const subappId = authService.getSubappId();

    useEffect(() => {
        // Simulate loading habits
        setTimeout(() => {
            setHabits([]);
            setIsLoading(false);
        }, 500);
    }, []);

    const handleBackClick = () => {
        navigate('/dashboard');
    };

    const handleCreateHabit = () => {
        // Navigate to habit creation flow
        console.log('Create new premium habit');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-200">
                <Header />
                <div className="max-w-2xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="max-w-2xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBackClick}
                        className="mr-4 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex items-center">
                        <Star className="h-6 w-6 text-yellow-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Premium Habits</h1>
                    </div>
                </div>

                {/* Empty state */}
                {habits.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Star className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            No Premium Habits Yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start building premium lifestyle habits that will elevate your daily routine.
                        </p>
                        <button
                            onClick={handleCreateHabit}
                            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg
                                     hover:bg-yellow-700 transition-colors duration-200 font-medium"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Your First Premium Habit
                        </button>
                    </div>
                ) : (
                    /* Habits list - for when we have habits */
                    <div className="space-y-4">
                        {habits.map((habit) => (
                            <div
                                key={habit.id}
                                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                                        <p className="text-gray-600 text-sm">{habit.description}</p>
                                    </div>
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        ))}

                        {/* Add new habit button */}
                        <button
                            onClick={handleCreateHabit}
                            className="w-full py-4 border-2 border-dashed border-yellow-300 rounded-lg
                                     text-yellow-600 hover:border-yellow-400 hover:text-yellow-700
                                     transition-colors duration-200 flex items-center justify-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add New Premium Habit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumHabits;