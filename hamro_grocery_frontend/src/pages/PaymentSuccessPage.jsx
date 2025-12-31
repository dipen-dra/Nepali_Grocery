import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { CartContext } from '../context/CartContext';
import { fetchUserProfile } from '../services/userServices';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle } from 'lucide-react';

export const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useContext(AuthContext);
    const { clearCart } = useContext(CartContext);
    const [isLoading, setIsLoading] = useState(true);

    const message = new URLSearchParams(location.search).get('message');

    useEffect(() => {
        const verifyAndRedirect = async () => {
            try {
                const response = await fetchUserProfile();
                updateUser(response.data);
                clearCart();
                toast.success(message || 'Payment successful!');
            } catch (error) {
                console.error("Failed to update user profile after payment:", error);
                toast.error("Could not update your session. Please re-login to see your updated points.");
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    navigate('/dashboard/orders', { replace: true });
                }, 4000);
            }
        };

        verifyAndRedirect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
            {isLoading ? (
                <>
                    <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
                    <h1 className="text-2xl font-bold mt-4">Verifying Payment...</h1>
                    <p className="text-gray-500 mt-2">Please wait while we confirm your transaction and update your account.</p>
                </>
            ) : (
                <>
                    <CheckCircle className="h-16 w-16 text-green-600" />
                    <h1 className="text-2xl font-bold mt-4">Success!</h1>
                    <p className="text-gray-600 mt-2 max-w-md">{message}</p>
                    <p className="text-gray-500 mt-6">Redirecting to your orders page shortly...</p>
                </>
            )}
        </div>
    );
};