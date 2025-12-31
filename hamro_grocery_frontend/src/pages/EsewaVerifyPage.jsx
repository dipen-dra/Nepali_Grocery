import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../auth/AuthContext.jsx'; 

const EsewaVerifyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useContext(CartContext);
    const { loading: isLoadingAuth } = useContext(AuthContext);

    useEffect(() => {
        
        if (isLoadingAuth) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const message = decodeURIComponent(params.get('message') || '');

        if (status === 'success') {
            toast.success(message || 'Payment successful! Your order has been placed.');
            clearCart();
           
            navigate('/dashboard/orders', { replace: true });
        } else if (status === 'failure') {
            toast.error(message || 'Payment failed. Please try again.');
            navigate('/checkout', { replace: true });
        } else {
           
            toast.info("Redirecting to homepage.");
            navigate('/', { replace: true });
        }
        
    }, [isLoadingAuth, navigate, location.search, clearCart]);

    
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Loader2 className="animate-spin text-green-500 h-16 w-16" />
            <p className="mt-6 text-xl text-gray-700">Finalizing your payment, please wait...</p>
        </div>
    );
};

export default EsewaVerifyPage;