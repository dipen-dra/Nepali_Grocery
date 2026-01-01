import React, { useState, useEffect, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../auth/AuthContext.jsx';
import { placeOrder } from '../services/userServices.js';
import { toast } from 'react-toastify';
import { Loader2, MapPin, Gift } from 'lucide-react';
import axios from 'axios';

import api from '../api/api';

const initiateEsewa = async (payload) => {
    const { data } = await api.post('/payment/initiate-esewa', payload);
    return data;
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, clearCart } = useContext(CartContext);
    const { user, updateUser, loading: isLoadingAuth } = useContext(AuthContext);

    const [address, setAddress] = useState(user?.location || '');
    const [phone, setPhone] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [applyDiscount, setApplyDiscount] = useState(false);
    const canApplyDiscount = user && user.groceryPoints >= 150;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'failure') {
            toast.error(decodeURIComponent(params.get('message') || 'Payment failed.'));
            navigate('/checkout', { replace: true });
        }
    }, [location.search, navigate]);

    const handleDiscountToggle = () => canApplyDiscount && setApplyDiscount(prev => !prev);

    const fetchAddressFromCoords = async (lat, lon) => {
        setIsFetchingLocation(true);
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (data?.display_name) setAddress(data.display_name);
        } catch (error) { toast.error("Could not fetch address."); }
        finally { setIsFetchingLocation(false); }
    };

    const handleFetchLocation = () => {
        if (navigator.geolocation) {
            setIsFetchingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
                () => { toast.error("Geolocation failed."); setIsFetchingLocation(false); }
            );
        } else { toast.error("Geolocation not supported."); }
    };

    const codOrderMutation = useMutation({
        mutationFn: placeOrder,
        onSuccess: (data) => {
            toast.success(data.message || "Order placed successfully!");
            if (data.updatedUser) {
                updateUser(data.updatedUser);
            }
            clearCart();
            navigate('/dashboard/orders');
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to place order.")
    });

    const esewaMutation = useMutation({
        mutationFn: initiateEsewa,
        onSuccess: (data) => {
            const esewaForm = document.createElement('form');
            esewaForm.setAttribute('method', 'POST');
            esewaForm.setAttribute('action', data.esewaUrl);
            for (const key in data) {
                if (key !== 'esewaUrl') {
                    const hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', data[key]);
                    esewaForm.appendChild(hiddenField);
                }
            }
            document.body.appendChild(esewaForm);
            esewaForm.submit();
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to initiate eSewa payment.")
    });

    const handleConfirmOrder = (e) => {
        e.preventDefault();
        if (!address.trim() || !phone.trim()) {
            toast.error("Please fill in all delivery details."); return;
        }
        const commonPayload = { address, phone, applyDiscount };
        if (paymentMethod === 'cod') {
            const orderData = { ...commonPayload, items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity })) };
            codOrderMutation.mutate(orderData);
        } else if (paymentMethod === 'esewa') {
            const payload = { ...commonPayload, cartItems };
            esewaMutation.mutate(payload);
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 50;
    const discountAmount = applyDiscount && canApplyDiscount ? totalAmount * 0.25 : 0;
    const finalAmount = totalAmount + deliveryFee - discountAmount;

    if (isLoadingAuth) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-green-500 h-12 w-12" /></div>;
    if (cartItems.length === 0) return <div className="text-center p-12"><h2 className="text-2xl font-semibold">Your cart is empty.</h2></div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
            <form onSubmit={handleConfirmOrder} className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow bg-white p-6 rounded-2xl shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-3 mb-4">Delivery Information</h2>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input id="phone" type="tel" placeholder="e.g., 98xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                        <textarea id="address" placeholder="Enter your full delivery address..." value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full p-3 border rounded-lg min-h-[120px]" />
                        <button type="button" onClick={handleFetchLocation} disabled={isFetchingLocation} className="mt-2 flex items-center gap-2 text-sm text-green-600 font-semibold hover:text-green-800 disabled:opacity-50">
                            {isFetchingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                            {isFetchingLocation ? 'Fetching...' : 'Use My Current Location'}
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold border-b pb-3 mb-4">Order Summary</h2>
                        {canApplyDiscount && (
                            <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg cursor-pointer" onClick={handleDiscountToggle}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Gift className="text-green-600" size={24} />
                                        <div>
                                            <h4 className="font-bold text-green-800">Use 25% Discount</h4>
                                            <p className="text-xs text-gray-600">You have {user.groceryPoints} points</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" checked={applyDiscount} readOnly className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between"><span>Items Total</span><span>₹{totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                            {applyDiscount && discountAmount > 0 && (
                                <div className="flex justify-between font-semibold text-green-600">
                                    <span>Discount (25%)</span>
                                    <span>- ₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t pt-4 mt-2">
                                <span>Grand Total</span>
                                <span>₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-semibold text-center mb-3">Payment Method</h3>
                            <div className="space-y-3">
                                <div onClick={() => setPaymentMethod('cod')} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" id="cod" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} readOnly className="h-4 w-4 text-green-600" />
                                    <label htmlFor="cod" className="ml-3 text-sm font-medium text-gray-700">Cash on Delivery</label>
                                </div>
                                <div onClick={() => setPaymentMethod('esewa')} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'esewa' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center">
                                        <input type="radio" id="esewa" name="paymentMethod" value="esewa" checked={paymentMethod === 'esewa'} readOnly className="h-4 w-4 text-green-600" />
                                        <label htmlFor="esewa" className="ml-3 text-sm font-medium text-gray-700">Pay with eSewa</label>
                                    </div>
                                    <img src="/esewalogo.png" alt="eSewa" className="h-6" />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={codOrderMutation.isLoading || esewaMutation.isLoading} className="mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center disabled:bg-gray-400">
                            {(codOrderMutation.isLoading || esewaMutation.isLoading) ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;