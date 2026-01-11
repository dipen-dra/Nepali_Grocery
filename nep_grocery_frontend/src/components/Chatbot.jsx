// Chatbot.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bot, X, Send, User, Loader2, MessageSquare } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext';
import { useQueries } from '@tanstack/react-query';
import api from '../api/api';
import DOMPurify from 'dompurify';

const fetchData = async (endpoint) => {
    try {
        const { data } = await api.get(endpoint);
        if (endpoint === '/admin/users') return data.data;
        if (endpoint.includes('/orders')) return data.orders || data.history;
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
};


const USER_SUGGESTIONS = [
    "What's in my cart?",
    "What's the status of my last order?",
    "Do you have apples in stock?"
];

const ADMIN_SUGGESTIONS = [
    "Summarize today's performance",
    "Which products are low on stock?",
    "List all pending orders"
];


export const Chatbot = ({ isVisible, onClose, cartItems = [] }) => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    const results = useQueries({
        queries: [
            { queryKey: ['chatbot_dashboardStats'], queryFn: () => fetchData('/dashboard/stats'), enabled: isVisible && isAdmin },
            { queryKey: ['chatbot_all_orders'], queryFn: () => fetchData('/orders'), enabled: isVisible && isAdmin },
            { queryKey: ['chatbot_users'], queryFn: () => fetchData('/admin/users'), enabled: isVisible && isAdmin },
            { queryKey: ['chatbot_products'], queryFn: () => fetchData('/products'), enabled: isVisible },
            { queryKey: ['chatbot_my_orders'], queryFn: () => fetchData('/orders/myorders'), enabled: isVisible && !isAdmin }
        ],
    });

    const [dashboardStatsResult, allOrdersResult, usersResult, productsResult, myOrdersResult] = results;
    const isLoadingData = results.some(result => result.isLoading && result.fetchStatus !== 'idle');

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            const greetingText = `Hi ${user?.fullName || 'there'}! I'm GrocerBot. How can I help you today?`;
            const initialSuggestions = isAdmin ? ADMIN_SUGGESTIONS : USER_SUGGESTIONS;
            setMessages([{ role: 'bot', text: greetingText, suggestions: initialSuggestions }]);
        }
    }, [isVisible, isAdmin, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getLocalBotResponse = (userInput) => {

        if (results.length === 0) {
            return "I'm getting ready, please wait a moment...";
        }

        const lowerInput = userInput.toLowerCase();


        if (isAdmin) {
            if (lowerInput.includes('performance') || lowerInput.includes('summarize')) {
                const stats = dashboardStatsResult?.data;
                if (!stats) return "Sorry, I can't get performance stats right now.";
                return `Today's Summary:\n- Revenue: $${stats.totalRevenue?.toFixed(2)}\n- Orders: ${stats.totalOrders}\n- New Customers: ${stats.newCustomers}`;
            }
            if (lowerInput.includes('low on stock') || lowerInput.includes('low stock')) {
                const products = productsResult?.data;
                if (!products) return "I can't access product data right now.";
                const lowStockProducts = products.filter(p => p.stock < 10);
                if (lowStockProducts.length === 0) return "Great news! No products are low on stock.";
                return `Low stock products:\n${lowStockProducts.map(p => `- ${p.name} (Stock: ${p.stock})`).join('\n')}`;
            }
            if (lowerInput.includes('pending orders')) {
                const allOrders = allOrdersResult?.data;
                if (!allOrders) return "I can't access order data right now.";
                const pendingOrders = allOrders.filter(o => o.status === 'Pending');
                if (pendingOrders.length === 0) return "There are no pending orders.";

                const orderList = pendingOrders.map(o => {
                    const userName = o.user ? o.user.fullName : 'Guest';
                    return `- Order #${o._id.slice(-6)} by ${userName}`;
                }).join('\n');
                return `There are ${pendingOrders.length} pending orders:\n${orderList}`;
            }
        }


        if (!isAdmin) {
            if (lowerInput.includes('cart')) {
                if (cartItems.length === 0) return "Your cart is empty.";
                return `You have ${cartItems.length} items in your cart:\n${cartItems.map(item => `- ${item.name} (Qty: ${item.quantity})`).join('\n')}`;
            }
            if (lowerInput.includes('last order') || lowerInput.includes('order status')) {
                const myOrders = myOrdersResult?.data;
                if (!myOrders || myOrders.length === 0) return "You haven't placed any orders yet.";
                const lastOrder = myOrders[0];
                return `Your last order (#${lastOrder._id.slice(-6)}) has a status of: **${lastOrder.status}**.`;
            }
        }


        if (lowerInput.includes('stock') || lowerInput.includes('do you have')) {
            const products = productsResult?.data;
            if (!products) return "Sorry, I can't check stock right now.";
            const productNameMatch = products.find(p => lowerInput.includes(p.name.toLowerCase()));
            if (productNameMatch) {
                return `Yes, we have ${productNameMatch.name}. Current stock: ${productNameMatch.stock} units.`;
            }
            return "I couldn't find that product. Please try a different name.";
        }


        return "Sorry, I didn't understand that. Please choose one of the options below.";
    };

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || isLoadingResponse) return;

        const userMessage = { role: 'user', text: messageText };

        setMessages(prev => prev.map(m => ({ ...m, suggestions: undefined })));
        setMessages(prev => [...prev, userMessage]);

        setInput('');
        setIsLoadingResponse(true);

        setTimeout(() => {
            const botText = getLocalBotResponse(messageText);

            const nextSuggestions = isAdmin ? ADMIN_SUGGESTIONS : USER_SUGGESTIONS;
            const botResponse = { role: 'bot', text: botText, suggestions: nextSuggestions };

            setMessages(prev => [...prev, botResponse]);
            setIsLoadingResponse(false);
        }, 500);
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <MessageSquare size={24} />
                    <h3 className="font-bold text-lg">GrocerBot Assistant</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><X size={20} /></button>
            </div>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0"><Bot size={20} className="text-white" /></div>}
                            <div className={`max-w-xs px-4 py-2.5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-lg'}`}>
                                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }}></p>
                                {msg.suggestions && !isLoadingResponse && (
                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                        {msg.suggestions.map((s, i) => (
                                            <button key={i} onClick={() => handleSuggestionClick(s)} className="w-full text-left text-sm text-blue-600 font-semibold p-2 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50" disabled={isLoadingData}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0"><User size={20} className="text-white" /></div>}
                        </div>
                    ))}
                    {(isLoadingResponse || isLoadingData) && (
                        <div className="flex items-end gap-2.5 justify-start">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"><Bot size={20} className="text-white" /></div>
                            <div className="max-w-xs px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <Loader2 className="animate-spin text-gray-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me or choose an option" className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500" />
                    <button onClick={() => handleSend()} disabled={isLoadingResponse || isLoadingData || !input.trim()} className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"><Send size={20} /></button>
                </div>
            </div>
        </div>
    );
};