// src/components/Header.js - Habit Tracker version following budget blueprint exactly

import React, { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import authService from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { withMinimumDelay } from "../utils/withDelay";
import { Loader2, ArrowLeft, LogOut, X, FileDown, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import BackupButton from './BackupButton';
import { generatePdfReport } from '../utils/directPdfGenerator';
import { habitTypes } from '../utils/helpers';

export const Header = ({
                           showCreateButton = false,
                           onCreateClick,
                           isCreatingHabit = false,
                           onDownloadCsv = () => {},
                           selectedHabits = [],
                           habitType = 'journey'
                       }) => {
    const { handleLogout } = useLogin();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const userInfo = authService.getUserInfo();
    const navigate = useNavigate();
    const location = useLocation();
    const showBackButton = location.pathname !== '/dashboard';
    const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';
    const { showToast } = useToast();

    // Normalize habitType to lowercase to avoid case sensitivity issues
    const normalizedHabitType = habitType?.toLowerCase() || 'journey';

    const currentHabitType = habitTypes[normalizedHabitType] || habitTypes.journey;

    const createButtonText = currentHabitType.buttonText || 'Start New Habit';

    // IMPORTANT: Define fixed button classes instead of using dynamic classes
    // This ensures Tailwind won't purge these classes during build
    const getButtonClasses = () => {
        // Include all possible color variations directly in the code
        // This ensures Tailwind preserves all these classes during build
        if (normalizedHabitType === 'journey') {
            return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
        } else {
            return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
        }
    };

    const onLogout = async () => {
        setIsLoggingOut(true);
        try {
            await withMinimumDelay(async () => {
                const logoutIcon = document.querySelector('.logout-icon');
                if (logoutIcon) {
                    logoutIcon.classList.add('animate-spin');
                }
                await handleLogout();
            }, 2000);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleBack = async () => {
        const backButton = document.querySelector('.back-button');
        backButton?.classList.add('animate-spin');
        await withMinimumDelay(async () => {
            await navigate('/dashboard');
        }, 1000);
    };

    // Direct PDF generation without React components
    const handleDirectPdfGeneration = async () => {
        // Validate we have habits selected
        if (selectedHabits.length === 0) {
            showToast('error', 'Please select at least one habit to generate a report');
            return;
        }

        // Don't allow starting another generation if one is in progress
        if (isGeneratingPdf) {
            showToast('info', 'PDF generation is already in progress');
            return;
        }

        try {
            // Show visual feedback that the process has started
            const button = document.querySelector('.report-button');
            if (button) button.classList.add('animate-spin');

            // Update state to disable the button
            setIsGeneratingPdf(true);

            // Generate the PDF directly with the selected habits
            await generatePdfReport(
                selectedHabits,
                showToast,
                (isLoading) => setIsGeneratingPdf(isLoading)
            );
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('error', `Failed to generate PDF report: ${error.message || 'Unknown error'}`);
        } finally {
            // Always reset state and visual indicators
            setIsGeneratingPdf(false);
            const button = document.querySelector('.report-button');
            if (button) button.classList.remove('animate-spin');
        }
    };

    const getHabitType = () => {
        const path = location.pathname;

        // Check each habit type's route
        for (const key in habitTypes) {
            const habitType = habitTypes[key];
            if (path.includes(habitType.route)) {
                return habitType.title;
            }
        }

        // Default return for dashboard or unknown paths
        if (path === '/' || path === '/dashboard') {
            return '';
        }

        return '';
    };

    // For debugging - you can remove this in production
    console.log("Current habit type:", normalizedHabitType);
    console.log("Button classes:", getButtonClasses());

    return (
        <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-lg">
            <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                    {/* Title and User Info */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                            {showBackButton ? (
                                <button
                                    onClick={handleBack}
                                    className="back-button text-gray-600 hover:text-gray-900 transition-all duration-500 transform hover:-translate-x-1"
                                >
                                    <ArrowLeft className="h-6 w-6"/>
                                </button>
                            ) : (
                                <div className="w-6 flex items-center justify-center">
                                    {isHomePage && <BackupButton />}
                                </div>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left flex-grow md:flex-grow-0">
                                SmartyApps Habit Tracker
                            </h1>
                        </div>
                        <span className="text-sm text-gray-600 text-center md:text-left">{userInfo?.sub}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={onLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center justify-center px-4 py-2
                                bg-blue-500 text-white rounded hover:bg-blue-600
                                disabled:bg-blue-300 transition-all duration-300"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="logout-icon h-5 w-5 mr-2 animate-spin"/>
                            ) : (
                                <LogOut className="logout-icon h-5 w-5 mr-2"/>
                            )}
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                        {showCreateButton && (
                            <button
                                onClick={onCreateClick}
                                disabled={isCreatingHabit}
                                className={`inline-flex items-center justify-center px-4 py-2
            border border-transparent text-sm font-medium rounded-md
            shadow-sm text-white ${habitType === 'journey' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${habitType === 'journey' ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isCreatingHabit ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                ) : (
                                    <FileDown className="h-5 w-5 mr-2"/>
                                )}
                                {createButtonText}
                            </button>
                        )}

                        {/* Export buttons - following budget blueprint exactly */}
                        {selectedHabits.length > 0 && (
                            <>
                                <button
                                    onClick={onDownloadCsv}
                                    className="inline-flex items-center justify-center px-4 py-2
                                        bg-gray-600 text-white rounded hover:bg-gray-700
                                        transition-all duration-300"
                                >
                                    <FileSpreadsheet className="h-5 w-5 mr-2"/>
                                    Export CSV
                                </button>

                                <button
                                    onClick={handleDirectPdfGeneration}
                                    disabled={isGeneratingPdf}
                                    className="report-button inline-flex items-center justify-center px-4 py-2
                                        bg-red-600 text-white rounded hover:bg-red-700
                                        disabled:bg-red-300 transition-all duration-300"
                                >
                                    {isGeneratingPdf ? (
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                    ) : (
                                        <FileDown className="h-5 w-5 mr-2"/>
                                    )}
                                    {isGeneratingPdf ? 'Generating...' : 'Export PDF'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};