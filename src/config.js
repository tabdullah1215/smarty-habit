export const API_ENDPOINT = 'https://tkdjfvpqjk.execute-api.us-east-1.amazonaws.com/prod';
export const APP_ID = 'habit-tracker';
export const DEFAULT_HABIT_TYPE = 'journey';

export const DB_CONFIG = {
    name: 'HabitTrackerDB',
    version: 1, // Start fresh for habit tracker
    stores: {
        habits: 'habits',
        habitEntries: 'habitEntries',
        journeySettings: 'journeySettings',
        habitCategories: 'habitCategories',
        backupInfo: 'backupInfo',
    },
};