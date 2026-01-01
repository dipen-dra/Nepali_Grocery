import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
// import logo from '../assets/hamro2.png'; // Unused
const logo = "/NepGrocery.png";

// ... inside component ...
<img src={logo} alt="NepGrocery" className="h-16 w-auto" />

const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const EyeSlashIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);


const ResetPasswordPage = () => {

    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        if (strength === 0) return '';
        if (strength < 3) return 'Weak';
        if (strength < 5) return 'Medium';
        return 'Strong';
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordStrength(calculateStrength(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (passwordStrength !== 'Strong') {
            setError("Please choose a strong password (min 8 chars, uppercase, number, & symbol).");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {

            const response = await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(response.data.message);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="NepGrocery" className="h-16 w-auto" />
                </div>
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create New Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Your new password must be different from previous ones.</p>
                </div>

                {success ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold text-green-600">{success}</h3>
                        <p className="text-gray-600">Redirecting to the sign-in page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={passwordVisible ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                    {passwordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Password Strength Meter */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Weak' ? 'bg-red-500' : passwordStrength === 'Medium' ? 'bg-yellow-500' : passwordStrength === 'Strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Medium' || passwordStrength === 'Strong' ? (passwordStrength === 'Medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    </div>
                                    <p className={`text-xs font-semibold text-right ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {passwordStrength && `${passwordStrength} Password`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirm-password"
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                    {confirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button type="submit" disabled={loading || passwordStrength !== 'Strong'} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
