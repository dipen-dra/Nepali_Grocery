// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import logo from '../assets/hamro2.png';

// const Link = ({ to, children, ...props }) => (
//     <a href={to} {...props}>
//         {children}
//     </a>
// );


// const EmailIcon = ({ className }) => (
//     <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//     </svg>
// );


// const CheckCircleIcon = ({ className }) => (
//     <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//     </svg>
// );



// const ForgotPasswordPage = () => {
//     const [email, setEmail] = useState('');
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const [isVisible, setIsVisible] = useState(false);
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         setIsVisible(true);
//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

        
//         console.log("Submitting email for password reset:", email);
//         await new Promise(resolve => setTimeout(resolve, 1500)); 

        
//         if (email === "fail@example.com") {
//              setError("This email address was not found in our system.");
//              setLoading(false);
//         } else {
//             setIsSubmitted(true);
//             setLoading(false);
//         }

       
//     };

//     const backgroundStyle = {
//         backgroundImage: `url('https://pplx-res.cloudinary.com/image/upload/v1751175506/gpt4o_images/sjppbg6tx9cud98x5bfc.png')`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//     };

//     return (
//         <div className="min-h-screen relative font-sans" style={backgroundStyle}>
//             {/* Overlay */}
//             <div className="absolute inset-0 bg-black opacity-60"></div>

//             <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-opacity duration-700 ease-in-out relative" style={{ opacity: isVisible ? 1 : 0 }}>
//                 <div className="w-full max-w-lg space-y-8">
//                     <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl px-8 pt-10 pb-8">
//                         <div className="flex justify-center mb-6">
                             
//                             <Link to="/">
//                                 <img src={logo} alt="Hamro Grocery Logo" className="h-15 w-auto" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x112/CCCCCC/FFFFFF?text=Logo'; }} />
//                             </Link>
//                         </div>
                        
//                         <div className="text-center mb-8">
//                             <h2 className="text-3xl font-bold text-gray-700">
//                                 Forgot Password?
//                             </h2>
//                             <p className="mt-2 text-sm text-gray-600">
//                                 No worries. We'll send a reset link to your email.
//                             </p>
//                         </div>

//                         {isSubmitted ? (
//                             <div className="text-center space-y-4">
//                                 <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
//                                 <h3 className="text-xl font-semibold text-gray-800">Request Sent!</h3>
//                                 <p className="text-sm text-gray-600">
//                                     If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).
//                                 </p>
//                                 <Link
//                                     to="/auth"
//                                     className="inline-block bg-gray-800 hover:bg-black text-white font-medium py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
//                                 >
//                                     Return to Sign In
//                                 </Link>
//                             </div>
//                         ) : (
//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 <div>
//                                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                                         Email Address
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                             <EmailIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
//                                         </div>
//                                         <input
//                                             id="email"
//                                             name="email"
//                                             type="email"
//                                             required
//                                             autoComplete="email"
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                             className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
//                                             placeholder="you@example.com"
//                                         />
//                                     </div>
//                                     {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//                                 </div>

//                                 <div>
//                                     <button
//                                         type="submit"
//                                         disabled={loading}
//                                         className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         {loading ? 'Sending...' : 'Send Reset Link'}
//                                     </button>
//                                 </div>

//                                 <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm">
//                                     <span className="text-gray-600">Remembered your password?</span>{' '}
//                                     <Link to="/auth" className="text-gray-800 hover:text-black font-medium">
//                                         Sign In
//                                     </Link>
//                                 </div>
//                             </form>
//                         )}
//                     </div>
//                      <p className="text-center text-xs text-white/80">
//                          &copy; {new Date().getFullYear()} HamroGrocery. All rights reserved.
//                      </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ForgotPasswordPage;


import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed
import logo from '../assets/hamro2.png';


const Link = ({ to, children, ...props }) => (
    <a href={to} {...props}>
        {children}
    </a>
);


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
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState(''); 
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            
            const response = await axios.post('/api/auth/forgot-password', { email });
            setMessage(response.data.message);
            setIsSubmitted(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again.";
            setMessage(errorMessage);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const backgroundStyle = {
        backgroundImage: `url('https://pplx-res.cloudinary.com/image/upload/v1751175506/gpt4o_images/sjppbg6tx9cud98x5bfc.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="min-h-screen relative font-sans" style={backgroundStyle}>
            <div className="absolute inset-0 bg-black opacity-60"></div>

            <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-opacity duration-700 ease-in-out relative" style={{ opacity: isVisible ? 1 : 0 }}>
                <div className="w-full max-w-lg space-y-8">
                    <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl px-8 pt-10 pb-8">
                        <div className="flex justify-center mb-6">
                            <Link to="/">
                                <img src={logo} alt="Hamro Grocery Logo" className="h-16 w-auto" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x112/CCCCCC/FFFFFF?text=Logo'; }} />
                            </Link>
                        </div>
                        
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Forgot Password?</h2>
                            <p className="mt-2 text-sm text-gray-600">No worries. We'll send a reset link to your email.</p>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center space-y-4">
                                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                                <h3 className="text-xl font-semibold text-gray-800">Request Sent!</h3>
                                <p className="text-sm text-gray-600">{message}</p>
                                <Link to="/login" className="inline-block bg-gray-800 hover:bg-black text-white font-medium py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                                    Return to Sign In
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EmailIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {message && <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                                </div>

                                <div>
                                    <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>

                                <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm">
                                    <span className="text-gray-600">Remembered your password?</span>{' '}
                                    <Link to="/login" className="text-gray-800 hover:text-black font-medium">
                                        Sign In
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                     <p className="text-center text-xs text-white/80">
                         &copy; {new Date().getFullYear()} HamroGrocery. All rights reserved.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
