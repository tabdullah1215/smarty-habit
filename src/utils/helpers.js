// src/utils/helpers.js

import { DEFAULT_HABIT_TYPE } from '../config';
export const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Define habit types with their properties
export const habitTypes = {
    journey: {
        id: 'journey',
        title: 'Habit Journey',
        description: 'Track your daily habits and build consistency',
        route: '/habit-journey',
        icon: 'TrendingUp',
        color: 'text-green-600',
        borderColor: 'border-green-600',
        visible: true,
        enabled: true,
        buttonText: 'Start New Habit'
    }
};

export const isLocalhost = () => {
    return process.env.REACT_APP_IS_LOCAL === 'true' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
};

export const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const shouldBypassMobileCheck = () => {
    return isLocalhost();
};

// Function to get available habit types based on subappId
export const getAvailableHabitTypes = (subappId) => {
    if (!subappId) {
        return [{ ...habitTypes[DEFAULT_HABIT_TYPE], visible: true, enabled: true }];
    }

    // Direct subappId to habitType mapping
    switch (subappId) {
        case 'journey':
            return [{ ...habitTypes.journey, visible: true, enabled: true }];

        default:
            // Unknown subappId - fallback to journey
            return [{ ...habitTypes[DEFAULT_HABIT_TYPE], visible: true, enabled: true }];
    }
};