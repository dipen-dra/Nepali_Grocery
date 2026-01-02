import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from "lottie-react";
import groceryAnimation from '../../assets/grocery-animation.json';
import { useLoginUser } from '../../hooks/useLoginUser';
import Navbar from '../Navbar';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { login: loginUser, isLoading } = useLoginUser();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please enter both email and password.');
            return;
        }
        loginUser(formData);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
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
                            <h2 className="text-4xl font-extrabold mb-4">Welcome Back!</h2>
                            <p className="text-lg text-green-100 mb-8">
                                Sign in to continue your fresh grocery journey with NepGrocery.
                            </p>

                            {/* Lottie Animation */}
                            <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <Lottie
                                    animationData={groceryAnimation}
                                    loop={true}
                                    className="h-64 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="md:w-1/2 p-10 sm:p-12 flex flex-col justify-center">
                        <div className="w-full max-w-md mx-auto">
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
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
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
                                    {isLoading ? 'Signing in...' : 'Login'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-8">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-bold text-green-600 hover:text-green-700 hover:underline transition-colors">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
export { LoginPage };
export { NavigationContext } from '../../context/NavigationContext';