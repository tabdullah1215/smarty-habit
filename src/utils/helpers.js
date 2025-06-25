// src/utils/helpers.js

import { DEFAULT_BUDGET_TYPE, DEFAULT_HABIT_TYPE } from '../config';
export const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Define budget types with their properties
export const budgetTypes = {
    custom: {
        id: 'custom',
        title: 'Custom Budgets',
        description: 'Create and manage custom budget plans',
        route: '/custom-budgets',
        icon: 'Calculator',
        color: 'text-purple-600',
        borderColor: 'border-purple-600',
        visible: false,
        enabled: false,
        buttonText: 'Create New Budget'
    },
    paycheck: {
        id: 'paycheck',
        title: 'Paycheck Budgets',
        description: 'Track and manage your paycheck spending',
        route: '/paycheck-budgets',
        icon: 'Wallet',
        color: 'text-blue-600',
        borderColor: 'border-blue-600',
        visible: true,
        enabled: true,
        buttonText: 'Create New Budget'
    },
    business: {
        id: 'business',
        title: 'Business Projects',
        description: 'Track expenses for Business Projects',
        route: '/business-budgets',
        icon: 'Briefcase',
        color: 'text-emerald-800',
        borderColor: 'border-emerald-800',
        visible: true,
        enabled: true,
        buttonText: 'Create New Project'
    },
    savings: {
        id: 'savings',
        title: 'Savings Goals',
        description: 'Set and track your savings goals',
        route: '/savings-budgets',
        icon: 'PiggyBank',
        color: 'text-orange-800',
        borderColor: 'border-orange-800',
        visible: true,
        enabled: false,
        buttonText: 'Create New Goal'
    }
};

// Define habit types with their properties
export const habitTypes = {
    premium: {
        id: 'premium',
        title: 'Premium Habits',
        description: 'Track and build premium lifestyle habits',
        route: '/premium-habits',
        icon: 'Star',
        color: 'text-yellow-600',
        borderColor: 'border-yellow-600',
        visible: true,
        enabled: true,
        buttonText: 'Create New Habit'
    },
    wellness: {
        id: 'wellness',
        title: 'Wellness Habits',
        description: 'Track health and wellness habits',
        route: '/wellness-habits',
        icon: 'Heart',
        color: 'text-red-600',
        borderColor: 'border-red-600',
        visible: true,
        enabled: false,
        buttonText: 'Create New Habit'
    },
    productivity: {
        id: 'productivity',
        title: 'Productivity Habits',
        description: 'Build habits for better productivity',
        route: '/productivity-habits',
        icon: 'Zap',
        color: 'text-purple-600',
        borderColor: 'border-purple-600',
        visible: true,
        enabled: false,
        buttonText: 'Create New Habit'
    }
};
// Define a placeholder budget type for visual balance
const placeholderType  = {
    id: 'placeholder',
    title: 'More Features Coming Soon',
    description: 'We\'re working on adding more features',
    route: '#',
    icon: 'Calculator',
    color: 'text-gray-600',
    borderColor: 'border-gray-300',
    visible: true,
    enabled: false
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

// Function to get available budget types based on subappId
export const getAvailableBudgetTypes = (subappId) => {

    if (!subappId) {
        return [{ ...budgetTypes[DEFAULT_BUDGET_TYPE], visible: true, enabled: true }];
    }

    // Direct subappId to budgetType mapping
    switch (subappId) {
        case 'paycheck':
            return [
                { ...budgetTypes.paycheck, visible: true, enabled: true },
                placeholderType
            ];

        case 'savings':
            return [
                { ...budgetTypes.savings, visible: true, enabled: true },
                placeholderType
            ];

        case 'custom':
            return [
                { ...budgetTypes.custom, visible: true, enabled: true },
                placeholderType
            ];

        case 'business':
            return [
                { ...budgetTypes.business, visible: true, enabled: true },
                placeholderType
            ];

        case 'all':
            // Enable all budget types when subappId is 'all'
            return Object.values(budgetTypes).map(type => ({
                ...type,
                visible: true,
                enabled: true
            }));

        default:
            // Unknown subappId - fallback to paycheck only
            return [{ ...budgetTypes[DEFAULT_BUDGET_TYPE], visible: true, enabled: true }];
    }
};

// Function to get available habit types based on subappId
export const getAvailableHabitTypes = (subappId) => {
    if (!subappId) {
        return [{ ...habitTypes[DEFAULT_HABIT_TYPE], visible: true, enabled: true }];
    }

    // Direct subappId to habitType mapping
    switch (subappId) {
        case 'premium':
            return [
                { ...habitTypes.premium, visible: true, enabled: true },
                { ...placeholderType, title: 'More Habit Features Coming Soon' }
            ];

        case 'wellness':
            return [
                { ...habitTypes.wellness, visible: true, enabled: true },
                { ...placeholderType, title: 'More Habit Features Coming Soon' }
            ];

        case 'productivity':
            return [
                { ...habitTypes.productivity, visible: true, enabled: true },
                { ...placeholderType, title: 'More Habit Features Coming Soon' }
            ];

        case 'all':
            // Enable all habit types when subappId is 'all'
            return Object.values(habitTypes).map(type => ({
                ...type,
                visible: true,
                enabled: true
            }));

        default:
            // Unknown subappId - fallback to premium only
            return [{ ...habitTypes[DEFAULT_HABIT_TYPE], visible: true, enabled: true }];
    }
};

export const getAvailableTypes = (appId, subappId) => {
    switch (appId) {
        case 'budget-tracker':
            return getAvailableBudgetTypes(subappId);
        case 'habit-tracker':
            return getAvailableHabitTypes(subappId);
        default:
            return getAvailableBudgetTypes(subappId);
    }
};