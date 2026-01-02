import React, { useState, useContext, useRef, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, Package, User, LogOut, Menu, X, ChevronDown, Wallet, ShoppingCart, MessageSquare } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { fetchCategories } from '../services/userServices.js';
import ProductsPage from './ProductsPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import { MyOrdersPage } from './MyOrderPage.jsx';
import { PaymentHistoryPage } from './PaymentHistory.jsx';
import CartPage from './CartPage.jsx';
import CheckoutPage from './CheckoutPage.jsx';
import { Avatar } from '../components/Avatar';
import ShoppingList from '../components/ShoppingList.jsx';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useQuery } from '@tanstack/react-query';
import { useChatbot } from '../hooks/useChatbot.jsx';
import { Chatbot } from '../components/Chatbot.jsx';
import NotFoundPage from './NotFoundPage.jsx';

const CategoryNavbar = ({ selectedCategory, onCategoryChange }) => {
    const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
    const CategoryButton = ({ id, name }) => (
        <button
            onClick={() => onCategoryChange(id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap mx-1.5 flex-shrink-0 ${selectedCategory === id ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
        >
            {name}
        </button>
    );

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10 border-b-2 border-green-200">
            <div className="flex items-center justify-center px-2 sm:px-4 md:px-6 py-3 overflow-x-auto">
                {isLoading ? (
                    <p className="text-sm text-gray-500 px-4">Loading categories...</p>
                ) : (
                    <>
                        <CategoryButton id="all" name="All" />
                        {categories?.map((cat) => <CategoryButton key={cat._id} id={cat._id} name={cat.name} />)}
                    </>
                )}
            </div>
        </nav>
    );
};


const CartIndicator = () => {
    const { cartItems } = useContext(CartContext);
    const itemCount = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
    if (itemCount === 0) return null;
    return <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-green-600 text-white text-xs font-bold">{itemCount}</span>;
};


const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext); // <-- GET CART ITEMS
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const profileRef = useRef(null);
    const location = useLocation();

    const { isChatbotVisible, toggleChatbot, closeChatbot } = useChatbot();

    const isShopPage = location.pathname.endsWith('/dashboard/shop') || location.pathname.endsWith('/dashboard/');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setLogoutConfirmOpen(false);
        logout();
    };

    const confirmLogoutFromChatbot = () => {
        closeChatbot();
        setTimeout(() => setLogoutConfirmOpen(true), 100);
    };

    const NavLink = ({ to, icon: Icon, children }) => (
        <Link
            to={to}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${location.pathname.startsWith(to)
                ? 'bg-green-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-green-50'
                }`}
        >
            <Icon size={22} />
            <span>{children}</span>
        </Link>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 flex items-center justify-between border-b">
                <Link to="/dashboard/shop" className="flex items-center gap-2">
                    <img src="/NepGrocery.png" alt="NepGrocery" className="h-12 w-auto" />
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/dashboard/shop" icon={Home}>Shop</NavLink>
                <NavLink to="/dashboard/orders" icon={Package}>My Orders</NavLink>
                <NavLink to="/dashboard/payments" icon={Wallet}>Payment History</NavLink>
                <NavLink to="/dashboard/profile" icon={User}>My Profile</NavLink>
            </nav>
            <div className="p-4 border-t">
                <button onClick={() => setLogoutConfirmOpen(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
                    <LogOut size={22} /> <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 shadow-md hidden lg:flex flex-col flex-shrink-0">
                <SidebarContent />
            </aside>
            <div className={`fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-72 shadow-lg bg-white">
                    <SidebarContent />
                </div>
                <div className="flex-1" onClick={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white p-4 flex justify-between items-center z-20 border-b-2 border-green-200">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600">
                        <Menu size={28} />
                    </button>
                    <div />
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link to="/dashboard/cart" className="relative p-2 rounded-full hover:bg-gray-100">
                            <ShoppingCart size={24} className="text-gray-700" />
                            <CartIndicator />
                        </Link>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(o => !o)} className="flex items-center gap-2">
                                <Avatar user={user} size={36} />
                                <span className="hidden md:block font-medium">{user?.fullName}</span>
                                <ChevronDown size={20} className={`transition-transform text-gray-500 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                    <Link to="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <User size={16} /> My Profile
                                    </Link>
                                    <button onClick={() => { setIsProfileOpen(false); setLogoutConfirmOpen(true); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {isShopPage && <CategoryNavbar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />}

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-8">
                    <Routes>
                        <Route index element={<Navigate to="shop" replace />} />
                        <Route path="shop" element={<ProductsPage selectedCategory={selectedCategory} />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="orders" element={<MyOrdersPage />} />
                        <Route path="payments" element={<PaymentHistoryPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>

                {isShopPage && <ShoppingList />}
            </div>

            <div className="fixed bottom-6 right-6 z-30">
                <button
                    onClick={toggleChatbot}
                    className="p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110"
                    aria-label="Toggle Chatbot"
                >
                    {isChatbotVisible ? <X size={24} /> : <MessageSquare size={24} />}
                </button>
            </div>

            <Chatbot
                isVisible={isChatbotVisible}
                onClose={closeChatbot}
                onConfirmLogout={confirmLogoutFromChatbot}
                cartItems={cartItems} // <-- PASS CART ITEMS AS A PROP
            />

            <ConfirmationModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
            />
        </div>
    );
};

export default UserDashboard;