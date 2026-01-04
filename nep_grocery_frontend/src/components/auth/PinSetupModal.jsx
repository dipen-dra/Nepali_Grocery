import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-toastify';

const PinSetupModal = ({ isOpen, onClose, onSuccess }) => {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullPin = pin.join('');
        if (fullPin.length !== 6) {
            toast.error("Please enter a complete 6-digit PIN.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/set-pin', { pin: fullPin });
            toast.success("Security PIN set successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to set PIN.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                        <Lock className="text-green-600" size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Security PIN</h2>
                    <p className="text-gray-500 mb-8">Create a 6-digit PIN to secure sensitive actions on your account.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-8">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder-gray-300"
                                    placeholder="•"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || pin.join('').length !== 6}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Set PIN <CheckCircle size={20} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PinSetupModal;
