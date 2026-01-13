import React, { useState, useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import api from '../../api/api';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from "lottie-react";
import groceryAnimation from '../../assets/grocery-animation.json';
import Navbar from '../Navbar';
import { useRegisterUser } from '../../hooks/useRegisterUser';
import TermsModal from '../TermsModal';

import ReCAPTCHA from "react-google-recaptcha";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [nameInPasswordError, setNameInPasswordError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

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

  const { mutate: registerUser, isLoading: isSubmitting } = useRegisterUser();



  const checkNameInPassword = (fullName, password) => {
    if (!fullName || !password) return false;
    const nameParts = fullName.trim().toLowerCase().split(/\s+/);
    return nameParts.some(part => part.length > 2 && password.toLowerCase().includes(part));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Check Name in Password whenever either changes
      if (name === 'password' || name === 'fullName') {
        const hasName = checkNameInPassword(updated.fullName, updated.password);
        setNameInPasswordError(hasName ? 'Password cannot contain your name.' : '');
      }
      return updated;
    });

    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, password } = formData;
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms and Conditions to sign up.');
      return;
    }
    if (passwordStrength !== 'Strong') {
      toast.error("Please choose a strong password (min 8 chars, uppercase, number, & symbol).");
      return;
    }
    registerUser({ ...formData, captchaToken }, {
      onSuccess: () => {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(errorMessage);
      },
    });
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
          <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-teal-600 p-10 text-white flex flex-col justify-center items-center relative overflow-hidden order-last md:order-first">
            <div className="absolute top-0 left-0 w-full h-full bg-opacity-20 bg-pattern"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-extrabold mb-4">Join NepGrocery!</h2>
              <p className="text-lg text-green-100 mb-8">
                Create an account and start your fresh grocery journey today.
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

          {/* Right Side - Signup Form */}
          <div className="md:w-1/2 p-10 sm:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center md:text-left mb-8">
                <h3 className="text-3xl font-bold text-gray-900">Create an Account</h3>
                <p className="text-gray-500 mt-2">Please fill in your details to sign up.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Full Name Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50"
                  />
                </div>

                {/* Password Input with Toggle */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-gray-50 pr-12"
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>)}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Weak' ? 'bg-red-500' : passwordStrength === 'Medium' ? 'bg-yellow-500' : passwordStrength === 'Strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Medium' || passwordStrength === 'Strong' ? (passwordStrength === 'Medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength === 'Strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </div>
                      <div className="flex justify-between items-start">
                        <p className={`text-xs font-semibold ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {passwordStrength && `${passwordStrength} Password`}
                        </p>
                        {nameInPasswordError && (
                          <p className="text-xs font-bold text-red-600 ml-2 animate-pulse">
                            {nameInPasswordError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-center">
                  <input
                    id="terms-and-conditions"
                    name="terms-and-conditions"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="terms-and-conditions" className="ml-3 block text-sm text-gray-700">
                    I agree to the{' '}
                    <button type="button" onClick={() => setTermsModalOpen(true)} className="font-bold text-green-600 hover:text-green-700 hover:underline">
                      Terms and Conditions
                    </button>
                  </label>
                </div>

                {/* ReCAPTCHA */}
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !agreedToTerms || passwordStrength !== 'Strong' || !captchaToken || nameInPasswordError}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        const { data } = await api.post('/auth/google-login', { token: credentialResponse.credential });
                        login(data); // This handles navigation
                        toast.success('Google Login successful!');
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Google Login failed.');
                      }
                    }}
                    onError={() => {
                      toast.error('Google Signup Failed');
                    }}
                  />
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-green-600 hover:text-green-700 hover:underline transition-colors">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render the modal component */}
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  );
};

export default SignupPage;
export { SignupPage };
export { NavigationContext } from '../../context/NavigationContext';
