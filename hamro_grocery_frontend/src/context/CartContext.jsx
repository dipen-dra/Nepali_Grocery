import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
    
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error parsing cart items from localStorage", error);
            return [];
        }
    });

    
    useEffect(() => {
        try {
            if (cartItems.length === 0) {
               
                localStorage.removeItem('cartItems');
            } else {
               
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
            }
        } catch (error) {
            console.error("Error saving cart items to localStorage", error);
        }
    }, [cartItems]);

    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === product._id);
            if (existingItem) {
                return prevItems.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []); 
    
    const contextValue = { cartItems, addToCart, updateQuantity, removeFromCart, clearCart };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContextProvider;