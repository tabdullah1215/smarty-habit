// src/services/backupService.js
import { indexdbService } from '../services/IndexDBService';
import { DB_CONFIG } from '../config';
import authService from './authService';

export const STATIC_BACKUP_FILENAME = 'habit-tracker-backup.json';

const backupService = {
    async createBackupObject() {
        const userEmail = authService.getUserInfo()?.sub;
        if (!userEmail) throw new Error('User not authenticated');

        try {
            if (!indexdbService.db) {
                await indexdbService.initDB();
            }

            const habits = await indexdbService.getHabitsByEmail(userEmail);
            const habitEntries = await indexdbService.getHabitEntriesByEmail(userEmail);
            const habitCategories = await indexdbService.getCategories('habits');
            const journeySettings = await indexdbService.getJourneySettings(userEmail);

            if (habits.length === 0) {
                throw new Error('No habit data to backup');
            }

            return {
                metadata: {
                    version: DB_CONFIG.version,
                    timestamp: new Date().toISOString(),
                    userEmail,
                    summary: {
                        habitsCount: habits.length,
                        habitEntriesCount: habitEntries.length,
                        habitCategoriesCount: habitCategories.length
                    }
                },
                data: {
                    habits,
                    habitEntries,
                    habitCategories,
                    journeySettings
                }
            };
            } catch (error) {
                console.error('Backup creation failed:', error);
                throw error;
            }
        },

        async downloadBackup() {
            try {
                const backupData = await this.createBackupObject();
                const jsonContent = JSON.stringify(backupData, null, 2);

                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = STATIC_BACKUP_FILENAME;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);

                return true;
            } catch (error) {
                console.error('Backup download failed:', error);
                throw error;
            }
        },

        async restoreFromBackup(file) {
            try {
                const text = await file.text();
                const backupData = JSON.parse(text);

                if (!backupData.metadata || !backupData.data) {
                    throw new Error('Invalid backup file format');
                }

                const userEmail = authService.getUserInfo()?.sub;
                if (!userEmail) throw new Error('User not authenticated');

                if (!indexdbService.db) {
                    await indexdbService.initDB();
                }

                // Restore habits
                if (backupData.data.habits) {
                    for (const habit of backupData.data.habits) {
                        await indexdbService.addHabit(habit);
                    }
                }

                // Restore habit entries
                if (backupData.data.habitEntries) {
                    for (const entry of backupData.data.habitEntries) {
                        await indexdbService.addHabitEntry(entry);
                    }
                }

                // Restore categories
                if (backupData.data.habitCategories) {
                    for (const category of backupData.data.habitCategories) {
                        await indexdbService.addCategory(category);
                    }
                }

                return {
                    success: true,
                    summary: backupData.metadata.summary
                };
            } catch (error) {
                console.error('Backup restore failed:', error);
                throw error;
            }
        }
    };
export default backupService;