// src/components/journey/HabitJourney.wireframe - Following budget tracker blueprint exactly
import React, { useEffect, useMemo, useState } from 'react';
import { useSprings, useSpring, animated, config } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Header } from '../Header';
import { withMinimumDelay } from "../../utils/withDelay";
import { useToast } from '../../contexts/ToastContext';
import authService from '../../services/authService';

export const HabitJourney = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [showNewHabitForm, setShowNewHabitForm] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [deletingHabitId, setDeletingHabitId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [openingHabitId, setOpeningHabitId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fadingHabitId, setFadingHabitId] = useState(null);
    const [selectedHabitIds, setSelectedHabitIds] = useState([]); // Store just IDs
    const [showRestoreOptions, setShowRestoreOptions] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const userInfo = authService.getUserInfo();
    const { showToast } = useToast();

    // For now, we'll use empty habits array until we implement the habit hooks
    const habits = [];

    // Animation for the restore options panel (keeping identical to budget version)
    const restoreOptionsAnimation = useSpring({
        opacity: showRestoreOptions ? 1 : 0,
        height: showRestoreOptions ? 'auto' : 0,
        transform: showRestoreOptions ? 'translateY(0px)' : 'translateY(-20px)',
        config: {
            tension: 120,
            friction: 14,
            duration: 800 // Slow animation for visibility - identical to budget version
        }
    });

    // Animation for the restore toggle link (keeping identical to budget version)
    const restoreToggleAnimation = useSpring({
        scale: showRestoreOptions ? 1.1 : 1,
        color: showRestoreOptions ? '#2563EB' : '#3B82F6', // Same blue colors as budget version
        config: config.wobbly
    });

    const sortedHabits = useMemo(() =>
            [...habits].sort((a, b) => {
                const dateComparison = new Date(b.date) - new Date(a.date);
                if (dateComparison === 0) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return dateComparison;
            }),
        [habits]
    );

    // Get the complete habit objects for selected habit IDs
    const selectedHabitObjects = useMemo(() => {
        return sortedHabits.filter(habit => selectedHabitIds.includes(habit.id));
    }, [sortedHabits, selectedHabitIds]);

    const fadeAnimationProps = {
        from: { opacity: 1, transform: 'translateY(0px)' },
        config: { duration: 500 }
    };

    const [fadeAnimations] = useSprings(
        sortedHabits.length,
        index => ({
            ...fadeAnimationProps,
            to: {
                opacity: fadingHabitId === sortedHabits[index]?.id ? 0 : 1,
                transform: fadingHabitId === sortedHabits[index]?.id ? 'translateY(10px)' : 'translateY(0px)'
            }
        }),
        [fadingHabitId, sortedHabits]
    );

    useEffect(() => {
        if (!userInfo?.sub) {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const handleCreateClick = async () => {
        setIsCreating(true);
        try {
            await withMinimumDelay(async () => {});
            setShowNewHabitForm(true);
        } finally {
            setIsCreating(false);
        }
    };

    const handleFormClose = () => {
        setShowNewHabitForm(false);
        setIsCreating(false); // Reset creating state when form closes
    };

    const handleOpenHabit = async (habit) => {
        if (openingHabitId) return;

        setOpeningHabitId(habit.id);
        try {
            await withMinimumDelay(async () => {
                setSelectedHabit(habit);
            });
        } catch (error) {
            console.error('Error opening habit:', error);
        } finally {
            setOpeningHabitId(null);
        }
    };

    const handleDeleteHabit = async (e, habitId) => {
        e.stopPropagation();
        setConfirmingDeleteId(habitId);
        await withMinimumDelay(async () => {});
        setConfirmingDeleteId(null);
        setDeletingHabitId(habitId);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingHabitId(null);
    };

    const confirmDelete = async () => {
        if (deletingHabitId) {
            try {
                setFadingHabitId(deletingHabitId);
                await withMinimumDelay(async () => {
                    // await deleteHabit(deletingHabitId); // Will implement when we have habit hooks
                    setShowDeleteModal(false);
                });
                await withMinimumDelay(async () => {});
                setDeletingHabitId(null);
            } catch (error) {
                console.error('Error deleting habit:', error);
                setFadingHabitId(null);
            }
        }
    };

    const handleCreateHabit = async (habitData) => {
        try {
            // await createHabit(habitData); // Will implement when we have habit hooks
            showToast('success', 'New habit journey created successfully');
            handleFormClose();
        } catch (error) {
            console.error('Error creating habit:', error);
            showToast('error', 'Failed to create habit journey. Please try again.');
        }
    };

    const handleUpdateHabit = async (updatedHabit) => {
        try {
            // await updateHabit(updatedHabit); // Will implement when we have habit hooks
            setSelectedHabit(updatedHabit);
        } catch (error) {
            console.error('Error updating habit:', error);
        }
    };

    const handleSelectHabit = (habitId, isSelected) => {
        setSelectedHabitIds((prev) => {
            return isSelected ? [...prev, habitId] : prev.filter((id) => id !== habitId);
        });
    };

    const isHabitSelected = (habitId) => selectedHabitIds.includes(habitId);

    const handleDownloadCsv = async () => {
        if (selectedHabitIds.length === 0) {
            showToast('error', 'Please select at least one habit to generate a CSV');
            return;
        }

        try {
            // await downloadHabitCSV(selectedHabitObjects); // Will implement when we have CSV utils
            showToast('success', 'CSV downloaded successfully');
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showToast('error', 'Failed to download CSV');
        }
    };

    // Toggle function for restore options (keeping identical to budget version)
    const toggleRestoreOptions = () => {
        setShowRestoreOptions(!showRestoreOptions);
    };

    // This function ensures page reload after successful restore (keeping identical to budget version)
    const handleRestoreSuccess = () => {
        setIsRestoring(true);
        showToast('success', 'Restore complete! Refreshing to show your data...');
        localStorage.setItem('justRestored', 'true');
        console.log('Restore complete, page will reload in 2 seconds', new Date().toISOString());

        setTimeout(() => {
            console.log('Executing page reload now', new Date().toISOString());
            window.location.reload();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header
                showCreateButton
                onCreateClick={handleCreateClick}
                isCreatingHabit={isCreating}
                selectedHabits={selectedHabitObjects} // Pass complete habit objects
                onDownloadCsv={handleDownloadCsv}
                habitType="journey"
            />

            {/* Increased padding to ensure content is below header - identical to budget version */}
            <div className="pt-64 md:pt-40 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto pb-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="flex flex-col items-center justify-center p-5 sm:p-8 text-center">
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No Habit Journeys Yet
                                </h3>
                                <p className="text-gray-500 max-w-sm mb-4">
                                    Start tracking your daily habits and build lasting routines. Create your first habit journey.
                                </p>

                                {/* Create Habit Button - following exact pattern from budget version */}
                                <button
                                    onClick={handleCreateClick}
                                    disabled={isCreating || isRestoring}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-6"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Start New Habit
                                        </>
                                    )}
                                </button>

                                {/* Restore Options Section - keeping identical structure and animations */}
                                <div className="w-full max-w-md">
                                    <animated.div style={restoreToggleAnimation}>
                                        <button
                                            onClick={toggleRestoreOptions}
                                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 underline"
                                            disabled={isRestoring}
                                        >
                                            {showRestoreOptions ? 'Hide restore options' : 'Have a backup? Restore your habits'}
                                        </button>
                                    </animated.div>

                                    <animated.div style={restoreOptionsAnimation} className="overflow-hidden">
                                        {showRestoreOptions && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                {/* Restore functionality will be implemented later */}
                                                <p className="text-sm text-blue-800 mb-3">
                                                    Restore from a previous backup file to recover your habit data.
                                                </p>
                                                <div className="text-center">
                                                    <p className="text-sm text-blue-600">
                                                        Backup/Restore functionality coming soon
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </animated.div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Habits list will be implemented here when we have habit data */}
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Habit Journeys Coming Soon
                                </h3>
                                <p className="text-gray-600">
                                    Your habit tracking interface will appear here once you start creating habits.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal and Forms will be added here when implementing full functionality */}
        </div>
    );
};