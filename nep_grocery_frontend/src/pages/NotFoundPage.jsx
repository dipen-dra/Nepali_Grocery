import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertTriangle className="text-red-500 w-16 h-16" />
                    </div>
                </div>

                <h1 className="text-9xl font-extrabold text-green-600 tracking-tight">404</h1>

                <div className="bg-green-600 px-2 text-sm rounded rotate-12 absolute opacity-80 shadow-lg hidden md:block" style={{ top: '35%', left: '48%' }}>
                    Page Not Found
                </div>

                <h2 className="mt-8 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
                    Uh-oh! Page not found.
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    We can't find the page you're looking for. It might have been removed or renamed.
                </p>

                <div className="mt-10 flex items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200"
                    >
                        <Home className="w-5 h-5" />
                        Go Back Home
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-sm text-gray-400">
                Are you lost? <Link to="/" className="text-green-600 hover:underline">Click here</Link> to browse our groceries.
            </div>
        </div>
    );
};

export default NotFoundPage;
