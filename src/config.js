// src/config.js
//export const API_ENDPOINT = 'https://vsisvetgu5.execute-api.us-east-1.amazonaws.com/prod';

export const API_ENDPOINT = 'https://tkdjfvpqjk.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'budget-tracker';
export const HABIT_TRACKER_APP_ID = 'habit-tracker';
export const DEFAULT_BUDGET_TYPE = 'paycheck';
export const DEFAULT_HABIT_TYPE = 'premium';

export const DB_CONFIG = {
    name: 'BudgetTrackerDB',
    version: 14, // Increment version number for schema change
    stores: {
        customBudgets: 'customBudgets',
        paycheckBudgets: 'paycheckBudgets',
        businessBudgets: 'businessBudgets',
        paycheckCategories: 'paycheckCategories',
        businessCategories: 'businessCategories',
        customCategories: 'customCategories',
        backupInfo: 'backupInfo',
        habitTrackers: 'habitTrackers',
        habitCategories: 'habitCategories',
    },
};