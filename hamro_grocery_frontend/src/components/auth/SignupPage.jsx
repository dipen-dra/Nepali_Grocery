import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../Navbar';
import logo from '../../assets/hamro2.png';
import { useRegisterUser } from '../../hooks/useRegisterUser';
import TermsModal from '../TermsModal'; // Import the new modal component

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);

  const { mutate: registerUser, isLoading: isSubmitting } = useRegisterUser();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    registerUser(formData, {
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
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg m-4">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Create an Account</h1>
            <p className="text-gray-500 mt-2">Start your fresh journey with us today.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ... Full Name, Email, and Password inputs remain the same ... */}
            {/* Full Name Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            {/* Email Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            {/* Password Input with Toggle */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10"/>
                <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> )}
                </button>
              </div>
            </div>

            {/* MODIFIED Terms and Conditions Checkbox */}
            <div className="flex items-center">
              <input id="terms-and-conditions" name="terms-and-conditions" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"/>
              <label htmlFor="terms-and-conditions" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)} // Open modal on click
                  className="font-semibold text-green-600 hover:underline"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" disabled={isSubmitting || !agreedToTerms} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
      
      {/* Render the modal component and pass state and close function as props */}
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  );
};

export default SignupPage;
export { SignupPage };
export { NavigationContext } from '../../context/NavigationContext';