
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md m-4">{children}</div>
        </div>
    );
};

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
    const base = "px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} disabled={disabled}>
            {children}
        </button>
    );
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">{title}</h3>
                <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={onConfirm}>Logout</Button>
                </div>
            </div>
        </Modal>
    );
};