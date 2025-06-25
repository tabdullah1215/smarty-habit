// src/components/Header.js - Fixed version with safeguards for color classes

import React, { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import authService from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { withMinimumDelay } from "../utils/withDelay";
import { Loader2, ArrowLeft, LogOut, X, FileDown, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import BackupButton from './BackupButton';
import { generatePdfReport } from '../utils/directPdfGenerator';
import { budgetTypes } from '../utils/helpers';

export const Header = ({
                           showCreateButton = false,
                           onCreateClick,
                           isCreatingBudget = false,
                           onDownloadCsv = () => {},
                           selectedBudgets = [],
                           budgetType = 'paycheck'
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

    // Normalize budgetType to lowercase to avoid case sensitivity issues
    const normalizedBudgetType = budgetType?.toLowerCase() || 'paycheck';

    const currentBudgetType = budgetTypes[normalizedBudgetType] || budgetTypes.paycheck;

    const createButtonText = currentBudgetType.buttonText || 'Create New Budget!';

    // IMPORTANT: Define fixed button classes instead of using dynamic classes
    // This ensures Tailwind won't purge these classes during build
    const getButtonClasses = () => {
        // Include all possible color variations directly in the code
        // This ensures Tailwind preserves all these classes during build
        if (normalizedBudgetType === 'custom') {
            return "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500";
        } else if (normalizedBudgetType === 'business') {
            return "bg-emerald-800 hover:bg-emerald-900 focus:ring-emerald-500";
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
        // Validate we have budgets selected
        if (selectedBudgets.length === 0) {
            showToast('error', 'Please select at least one budget to generate a report');
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

            // Generate the PDF directly with the selected budgets
            await generatePdfReport(
                selectedBudgets,
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

    const getBudgetType = () => {
        const path = location.pathname;

        // Check each budget type's route
        for (const key in budgetTypes) {
            const budgetType = budgetTypes[key];
            if (path.includes(budgetType.route)) {
                return budgetType.title;
            }
        }

        // Default return for dashboard or unknown paths
        if (path === '/' || path === '/dashboard') {
            return '';
        }

        return '';
    };

    // For debugging - you can remove this in production
    console.log("Current budget type:", normalizedBudgetType);
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
                                DigitalPhorm Budget Tracker
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
                                disabled={isCreatingBudget}
                                className={`inline-flex items-center justify-center px-4 py-2
            border border-transparent text-sm font-medium rounded-md
            shadow-sm text-white ${budgetType === 'custom' ? 'bg-purple-600 hover:bg-purple-700' :
                                    budgetType === 'business' ? 'bg-emerald-800 hover:bg-emerald-900' :
                                        'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${budgetType === 'custom' ? 'focus:ring-purple-500' :
                                    budgetType === 'business' ? 'focus:ring-emerald-500' :
                                        'focus:ring-blue-500'}
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isCreatingBudget ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        Creating...
                                    </>
                                ) : (
                                    createButtonText
                                )}
                            </button>
                        )}
                    </div>

                    {/* Budget Type and Buttons */}
                    <div className="z-10 flex items-center justify-between md:gap-8">
                        {/* W-10 div visible only in desktop */}
                        <div className="hidden md:block w-10"/>

                        {/* CSV button visible only in mobile, at the start */}
                        {!isHomePage && (
                            <div className="md:hidden">
                                <button
                                    onClick={async () => {
                                        try {
                                            const button = document.querySelector('.csv-button-mobile');
                                            if (button) button.classList.add('animate-spin');
                                            await withMinimumDelay(async () => {
                                                await onDownloadCsv();
                                            }, 800);
                                        } finally {
                                            const button = document.querySelector('.csv-button-mobile');
                                            if (button) button.classList.remove('animate-spin');
                                        }
                                    }}
                                    disabled={selectedBudgets.length === 0}
                                    className="p-2 bg-green-600 text-white rounded
                    hover:bg-green-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download CSV Report"
                                >
                                    <FileSpreadsheet
                                        className="h-6 w-6 csv-button-mobile transition-transform duration-200"
                                    />
                                </button>
                            </div>
                        )}

                        {/* Budget Type - visible in both mobile and desktop */}
                        {!isHomePage && (
                            <div className="text-center md:flex-grow">
                                <h2 className="text-lg text-gray-600">{getBudgetType()}</h2>
                            </div>
                        )}

                        {/* Container for desktop CSV button and PDF button */}
                        {!isHomePage && (
                            <div className="flex items-center space-x-2">
                                {/* CSV button visible only in desktop */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const button = document.querySelector('.csv-button-desktop');
                                            if (button) button.classList.add('animate-spin');
                                            await withMinimumDelay(async () => {
                                                await onDownloadCsv();
                                            }, 800);
                                        } finally {
                                            const button = document.querySelector('.csv-button-desktop');
                                            if (button) button.classList.remove('animate-spin');
                                        }
                                    }}
                                    disabled={selectedBudgets.length === 0}
                                    className="hidden md:inline-flex p-2 bg-green-600 text-white rounded
                    hover:bg-green-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download CSV Report"
                                >
                                    <FileSpreadsheet
                                        className="h-6 w-6 csv-button-desktop transition-transform duration-200"
                                    />
                                </button>

                                {/* PDF Report Button - visible in both mobile and desktop */}
                                <button
                                    onClick={handleDirectPdfGeneration}
                                    disabled={selectedBudgets.length === 0 || isGeneratingPdf}
                                    className="p-2 bg-blue-600 text-white rounded
                    hover:bg-blue-700 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download PDF Report"
                                >
                                    {isGeneratingPdf ? (
                                        <Loader2
                                            className="h-6 w-6 report-button animate-spin"
                                        />
                                    ) : (
                                        <FileDown
                                            className="h-6 w-6 report-button transition-transform duration-200"
                                        />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;