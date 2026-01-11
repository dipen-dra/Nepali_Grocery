import { useState, useContext, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from "lottie-react";

import PinVerifyModal from './PinVerifyModal';
import groceryAnimation from '../../assets/grocery-animation.json';
import Navbar from '../Navbar';
import api from '../../api/api';
import { AuthContext } from '../../auth/AuthContext';
import { NavigationContext } from '../../context/NavigationContext';

const LoginPage = () => {
    const [showPinModal, setShowPinModal] = useState(false);
    // SECURITY PIN States
    const [showOtpModal, setShowOtpModal] = useState(false); // Define showOtpModal here
    const [resendTimer, setResendTimer] = useState(0); // Add resendTimer state
    const [userId, setUserId] = useState(null); // Add userId state
    const [otp, setOtp] = useState(''); // Add otp state
    const [maskedEmail, setMaskedEmail] = useState(''); // Add maskedEmail state
    const [requires2FA, setRequires2FA] = useState(false); // Add requires2FA state
    const [isLoading, setIsLoading] = useState(false); // Add isLoading state
    const [formData, setFormData] = useState({ email: '', password: '' }); // Add formData state
    const [showPassword, setShowPassword] = useState(false); // Add showPassword state

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => { // Renamed from handleLoginSubmit to handleSubmit
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please enter both email and password.');
            return;
        }
        setIsLoading(true); // Main page loading

        try {
            // Initial Attempt (without PIN)
            const res = await api.post('/auth/login', formData);

            if (res.data.requires2FA) {
                setUserId(res.data.userId);
                setRequires2FA(true); // Keep this for UI rendering logic
                // Safely extract email or fallback
                const msg = res.data.message || '';
                const extractedEmail = msg.includes('to ') ? msg.split('to ')[1] : 'your email';
                setMaskedEmail(extractedEmail);

                setShowOtpModal(true);
                toast.info(msg || 'Verification code sent.');
                setIsLoading(false);
                setIsLoading(false); // Stop main loading, wait for OTP

                startResendTimer();
                return;
            }

            // Standard Login Success
            login(res.data); // Assuming res.data contains user info and token
            toast.success('Login successful!');
            setIsLoading(false);

            // navigate(res.data.role === 'admin' ? '/admin/dashboard' : '/'); // Example navigation based on role
        } catch (error) {
            setIsLoading(false);

            if (error.response && error.response.status === 403 && error.response.data.requiresPin) {
                toast.warning(error.response.data.message);
                setShowPinModal(true);
                return;
            }

            const errorMessage = error.response?.data?.message || 'Login failed.';
            const headers = error.response?.headers || {};

            const remaining = headers['ratelimit-remaining'];
            const reset = headers['ratelimit-reset'];

            if (remaining === '0' || error.response?.status === 429) {
                const minutesLeft = Math.ceil(reset / 60);
                toast.error(`IP blocked due to too many requests. Please try again in ${minutesLeft} minutes.`);
            } else if (remaining) {
                toast.error(`${errorMessage} Attempts left: ${remaining}`);
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handlePinSubmit = async (pin) => {
        setIsLoading(true);
        try {
            // Retry login with PIN
            const res = await api.post('/auth/login', { ...formData, pin });

            login(res.data);
            toast.success('Identity Verified! Login successful.');
            setShowPinModal(false);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            toast.error(error.response?.data?.message || "Invalid PIN");
        }
    };


    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { userId, otp });
            login(data);
            toast.success('Verification successful!');
        } catch (error) {
            setIsLoading(false);
            const errorMessage = error.response?.data?.message || 'Verification failed.';
            const headers = error.response?.headers;

            if (headers) {
                const remaining = headers['ratelimit-remaining'];
                const reset = headers['ratelimit-reset'];

                if (remaining === '0' || error.response?.status === 429) {
                    const minutesLeft = Math.ceil(reset / 60);
                    toast.error(`IP blocked due to too many requests. Please try again in ${minutesLeft} minutes.`);
                } else if (remaining) {
                    toast.error(`${errorMessage} Attempts left: ${remaining}`);
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        try {
            await api.post('/auth/resend-otp', { userId });
            toast.success("New code sent to your email.");
            startResendTimer();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to resend code.';
            const headers = error.response?.headers;

            if (headers) {
                const remaining = headers['ratelimit-remaining'];
                const reset = headers['ratelimit-reset'];

                if (remaining === '0' || error.response?.status === 429) {
                    const minutesLeft = Math.ceil(reset / 60);
                    toast.error(`Request limit reached. Please wait ${minutesLeft} minutes.`);
                } else if (remaining) {
                    toast.error(`${errorMessage} Attempts left: ${remaining}`);
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60); // 60 seconds cooldown for button UI, distinct from backend 3/hr limit
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                    {/* Left Side - Animation or OTP Info */}
                    <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-teal-600 p-10 text-white flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-opacity-20 bg-pattern"></div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-4xl font-extrabold mb-4">{requires2FA ? "Security Check" : "Welcome Back!"}</h2>
                            <p className="text-lg text-green-100 mb-8">
                                {requires2FA
                                    ? `We sent a code to ${maskedEmail} to verify it's really you.`
                                    : "Sign in to continue your fresh grocery journey with NepGrocery."}
                            </p>

                            <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <Lottie
                                    animationData={groceryAnimation}
                                    loop={true}
                                    className="h-64 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="md:w-1/2 p-10 sm:p-12 flex flex-col justify-center">
                        <div className="w-full max-w-md mx-auto">
                            {!requires2FA ? (
                                // LOGIN FORM
                                <>
                                    <div className="text-center md:text-left mb-10">
                                        <h3 className="text-3xl font-bold text-gray-900">Login</h3>
                                        <p className="text-gray-500 mt-2">Enter your email and password to access your account.</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50 pr-12"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end text-sm mt-2">
                                            <Link to="/forgot-password" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                                                Forgot Password?
                                            </Link>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Checking Security...' : 'Login'}
                                        </button>
                                        <div className="mt-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-300"></div>
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-center">
                                                <GoogleLogin
                                                    onSuccess={async (credentialResponse) => {
                                                        setIsLoading(true);
                                                        try {
                                                            const { data } = await api.post('/auth/google-login', { token: credentialResponse.credential });
                                                            login(data);
                                                            toast.success('Google Login successful!');
                                                            setIsLoading(false);
                                                        } catch (error) {
                                                            setIsLoading(false);
                                                            toast.error(error.response?.data?.message || 'Google Login failed.');
                                                        }
                                                    }}
                                                    onError={() => {
                                                        toast.error('Google Login Failed');
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                    <p className="text-center text-sm text-gray-500 mt-8">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="font-bold text-green-600 hover:text-green-700 hover:underline transition-colors">
                                            Create Account
                                        </Link>
                                    </p>
                                </>
                            ) : (
                                // OTP FORM
                                <>
                                    <div className="text-center md:text-left mb-8">
                                        <h3 className="text-3xl font-bold text-gray-900">Enter Code</h3>
                                        <p className="text-gray-500 mt-2">We sent a 6-digit code to your email.</p>
                                    </div>
                                    <form className="space-y-6" onSubmit={handleOtpSubmit}>
                                        <div>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                className="w-full px-5 py-4 text-center text-3xl tracking-[10px] font-bold rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only
                                                disabled={isLoading}
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || otp.length !== 6}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                                        </button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600">
                                            Didn't receive the code?
                                        </p>
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={resendTimer > 0 || isLoading}
                                            className="mt-2 text-green-600 font-bold hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {resendTimer > 0 ? `Resend available in ${resendTimer}s` : 'Resend Code'}
                                        </button>
                                    </div>

                                    <div className="mt-8 text-center">


                                        <button
                                            onClick={() => setRequires2FA(false)}
                                            className="text-gray-400 hover:text-gray-600 text-sm"
                                        >
                                            ← Back to Login
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PinVerifyModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSubmit={handlePinSubmit}
                isLoading={isLoading}
            />
        </>
    );
};

export default LoginPage;
export { LoginPage };
export { NavigationContext } from '../../context/NavigationContext';