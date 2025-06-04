// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import authService from '../services/authService';
import { useLogin } from '../hooks/useLogin';
import { withMinimumDelay } from '../utils/withDelay';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [permanentMessage, setPermanentMessage] = useState({ type: '', content: '' });
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const { handleLogin } = useLogin(setPermanentMessage);

    useEffect(() => {
        authService.removeToken();

        if (location.state?.registration === 'success') {
            setPermanentMessage({ type: 'success', content: location.state.message });
            setEmail(location.state.email || '');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPermanentMessage({ type: '', content: '' });

        try {
            await withMinimumDelay(async () => {
                const loginButton = document.querySelector('.login-button-text');
                if (loginButton) {
                    loginButton.classList.add('animate-pulse');
                }
                await handleLogin(email, password);
            }, 2000); // 2 second delay
        } catch (error) {
            setPermanentMessage({
                type: 'error',
                content: error.message
            });
        } finally {
            setIsLoading(false);
            const loginButton = document.querySelector('.login-button-text');
            if (loginButton) {
                loginButton.classList.remove('animate-pulse');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <DashboardHeader
                title="Login"
                permanentMessage={permanentMessage}
            />
            <div className="pt-36 md:pt-36"> {/* Reduced padding for mobile */}
                <div className="max-w-md mx-auto px-8 md:px-0">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 font-medium disabled:bg-blue-300"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;