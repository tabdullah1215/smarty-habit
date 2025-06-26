// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PWAGateway from './components/PWAGateway';
import Login from './components/Login';
import AppRegistration from './components/AppRegistration';
import Home from "./components/Home";
import authService from './services/authService';
import { indexdbService } from './services/IndexDBService';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from './contexts/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import {isMobileDevice, shouldBypassMobileCheck} from "./utils/helpers";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const [isStandalone, setIsStandalone] = useState(false);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    const isAuthenticated = authService.isAuthenticated();
    const isRegistrationPath = currentPath.includes('/register/');

    const getQRCodeUrl = () => {
        if (process.env.REACT_APP_LOCAL_IP) {
            return `http://${process.env.REACT_APP_LOCAL_IP}:3000${window.location.pathname}`;
        }
        return window.location.href;
    };

    useEffect(() => {
        authService.initializeAuth();

        const checkStandalone = () => {
            const isAppMode = window.matchMedia('(display-mode: standalone)').matches
                || window.navigator.standalone
                || document.referrer.includes('android-app://')
                || shouldBypassMobileCheck();
            setIsStandalone(isAppMode);
        };

        checkStandalone();

        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const listener = (e) => checkStandalone();
        mediaQuery.addListener(listener);

        return () => mediaQuery.removeListener(listener);
    }, []);

    if (!isMobileDevice() && !shouldBypassMobileCheck()) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <img
                            src="/images/smartyapps-logo.png"
                            alt="SmartyApps.AI Logo"
                            className="h-24 mx-auto mb-6"
                        />
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Welcome to SMARTYAPPS HABIT TRACKER APP
                        </h1>
                        <p className="text-gray-600 mb-6">
                            To install the SmartyApps Habit Tracker App
                            please scan this QR code with your phone:
                        </p>
                        <div className="qr-code-container mx-auto w-48 h-48 mb-6">
                            <QRCodeSVG
                                value={getQRCodeUrl()}
                                size={192}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    if (!isStandalone && !isRegistrationPath && !shouldBypassMobileCheck()) {
        const isProtectedRoute = currentPath !== '/login' &&
            !currentPath.includes('/register/');

        if (isProtectedRoute) {
            return <PWAGateway />;
        }
    }

    const shouldAllowAccess = isStandalone || shouldBypassMobileCheck() || isRegistrationPath;

    return (
        <ErrorBoundary>
            <ToastProvider>
                <div className="h-full overflow-hidden">
                    <BrowserRouter>
                        <Routes>
                            {/* Special handling for standalone mode - redirects to login if not authenticated */}
                            {isStandalone && !isAuthenticated && !isRegistrationPath && (
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            )}

                            {/* Regular routes */}
                            <Route path="/login" element={
                                shouldAllowAccess ? <Login /> : <PWAGateway />
                            } />
                            <Route
                                path="/register/:appId/:linkType/:token"
                                element={<AppRegistration />}
                            />
                            <Route
                                path="/register/:appId/:subappId/:linkType/:token"
                                element={<AppRegistration />}
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        {shouldAllowAccess ? <Home /> : <PWAGateway />}
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/habit-journey"
                                element={
                                    <ProtectedRoute>
                                        {isStandalone ?
                                            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Habit Journey</h1>
                                                    <p className="text-gray-600">Coming soon - Habit tracking interface</p>
                                                </div>
                                            </div> :
                                            <PWAGateway />
                                        }
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/"
                                element={
                                    isStandalone && !isAuthenticated ?
                                        <Navigate to="/login" replace /> :
                                        <ProtectedRoute>
                                            <Navigate to="/dashboard" replace />
                                        </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </BrowserRouter>
                    <Toaster
                        containerStyle={{
                            top: 20,
                            right: 20,
                            zIndex: 10000
                        }}
                    />
                </div>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;