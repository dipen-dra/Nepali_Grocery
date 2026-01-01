import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import Lottie from "lottie-react";
import forgotPasswordAnimation from '../assets/forgot-password-animation.json';
import Navbar from '../components/Navbar';

const EmailIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success(response.data.message || "Reset link sent!");
            setIsSubmitted(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                    {/* Left Side - Animation & Welcome */}
                    <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-teal-600 p-10 text-white flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-opacity-20 bg-pattern"></div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-4xl font-extrabold mb-4">Forgot Password?</h2>
                            <p className="text-lg text-green-100 mb-8">
                                Don't worry! It happens. Enter your email and we'll help you reset it.
                            </p>

                            {/* Lottie Animation */}
                            <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <Lottie
                                    animationData={forgotPasswordAnimation}
                                    loop={true}
                                    className="h-64 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="md:w-1/2 p-10 sm:p-12 flex flex-col justify-center">
                        <div className="w-full max-w-md mx-auto">

                            {isSubmitted ? (
                                <div className="text-center space-y-6 animate-fadeIn">
                                    <div className="flex justify-center">
                                        <div className="bg-green-100 p-4 rounded-full">
                                            <CheckCircleIcon className="h-16 w-16 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Request Sent!</h3>
                                    <p className="text-gray-600 text-lg">
                                        If an account with that email exists, we've sent a password reset link to <span className="font-semibold text-gray-800">{email}</span>.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Please check your inbox and spam folder.
                                    </p>
                                    <div className="pt-4">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center justify-center w-full px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                                        >
                                            Return to Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center md:text-left mb-10">
                                        <h3 className="text-3xl font-bold text-gray-900">Reset Password</h3>
                                        <p className="text-gray-500 mt-2">Enter your email address to receive a reset link.</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div>
                                            <label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-2">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <EmailIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-11 pr-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50"
                                                    placeholder="you@example.com"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </form>

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-500">
                                            Remembered your password?{' '}
                                            <Link to="/login" className="font-bold text-green-600 hover:text-green-700 hover:underline transition-colors">
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;
