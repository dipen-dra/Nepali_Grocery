
import React, { useState, useEffect, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import { Plus, Edit, Trash2, Search, Users, DollarSign, LogOut, Menu, X, AlertTriangle, ShoppingCart, Package, ClipboardList, Tag, Home as HomeIcon, Mail, PhoneCallIcon, User as UserIcon, MessageSquare, CheckCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import { AuthContext } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import AdminProfilePage from './AdminProfilePage';
import { useChatbot } from '../hooks/useChatbot';
import { Chatbot } from '../components/Chatbot';

const queryClient = new QueryClient();

const API_URL = "http://192.168.1.78:8081/api";

const adminApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor to attach token from localStorage (Fallback for Cookies)
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);



const fetchDashboardStats = async () => {
    const { data } = await adminApi.get('/dashboard/stats');
    return data;
};

const fetchProducts = async () => {
    const { data } = await adminApi.get('/products');
    return data;
};
const addProduct = (newProduct) => adminApi.post('/products', newProduct);
const updateProduct = (updatedProduct) => {
    const { id, ...payload } = updatedProduct;
    return adminApi.put(`/products/${id}`, payload);
};
const deleteProduct = (productId) => adminApi.delete(`/products/${productId}`);

const fetchCategories = async () => {
    const { data } = await adminApi.get('/categories');
    return data;
};
const addCategory = (newCategory) => adminApi.post('/categories', newCategory);
const updateCategory = (updatedCategory) => {
    const { id, ...payload } = updatedCategory;
    return adminApi.put(`/categories/${id}`, payload);
};
const deleteCategory = (categoryId) => adminApi.delete(`/categories/${categoryId}`);

const fetchOrders = async () => {
    const { data } = await adminApi.get('/orders');
    return data.orders || [];
};

const fetchOrderById = async (orderId) => {
    if (!orderId) return null;
    const { data } = await adminApi.get(`/orders/${orderId}`);
    return data.order;
};

const updateOrderStatus = ({ orderId, status }) => adminApi.put(`/orders/${orderId}`, { status });

const updateUserStatus = ({ userId, isActive }) => adminApi.put(`/admin/users/${userId}/status`, { isActive });

const fetchUsers = async () => {
    const { data } = await adminApi.get('/admin/users');
    return data.data || [];
};

const UsersPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);

    const { data: users, isLoading, isError, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

    // Mutation for toggling status
    const statusMutation = useMutation({
        mutationFn: updateUserStatus,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.data?.message || "User status updated successfully.");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status.");
        },
        onSettled: () => {
            setConfirmOpen(false);
            setUserToToggle(null);
        }
    });

    const handleToggleClick = (user) => {
        setUserToToggle(user);
        setConfirmOpen(true);
    };

    const confirmToggle = () => {
        if (userToToggle) {
            statusMutation.mutate({ userId: userToToggle._id, isActive: !userToToggle.isActive });
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage message={error.message} />;

    const filteredUsers = Array.isArray(users) ? users.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            <Card>
                <div className="relative w-full md:w-1/3 mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Joined On</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-900">{user.fullName}</td>
                                        <td className="p-3 text-gray-600">{user.email}</td>
                                        <td className="p-3 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleToggleClick(user)}
                                                className={`p-2 rounded-full transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={user.isActive ? "Deactivate User" : "Activate User"}
                                            >
                                                {user.isActive ? <Trash2 size={18} /> : <CheckCircle size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center p-8 text-gray-500">{searchTerm ? "No customers match your search." : "No customers found."}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmToggle}
                title={userToToggle?.isActive ? "Deactivate User" : "Reactivate User"}
                message={`Are you sure you want to ${userToToggle?.isActive ? 'ban' : 'unban'} ${userToToggle?.fullName}? ${userToToggle?.isActive ? 'They will lose access immediately.' : 'They will regain access to their account.'}`}
                confirmText={userToToggle?.isActive ? "Deactivate" : "Activate"}
                confirmVariant={userToToggle?.isActive ? "danger" : "primary"}
            />
        </div>
    );
};

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];


const getStatusColor = (status) => {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Shipped': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-blue-100 text-blue-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`}>{children}</div>;
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = { primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500", secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500", danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500" };
    return <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} disabled={disabled} {...props}>{children}</button>;
};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", confirmVariant = "danger" }) => {
    if (!isOpen) return null;
    return <Modal isOpen={isOpen} onClose={onClose} title=""><div className="text-center"><div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}><AlertTriangle className={`h-6 w-6 ${confirmVariant === 'danger' ? 'text-red-600' : 'text-blue-600'}`} /></div><h3 className="mt-5 text-lg font-medium text-gray-900">{title}</h3><div className="mt-2 px-7 py-3"><p className="text-sm text-gray-500">{message}</p></div><div className="flex justify-center gap-3 mt-4"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button></div></div></Modal>;
};
const Input = ({ id, label, ...props }) => <div><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input id={id} {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>;
const StatusBadge = ({ status }) => <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>{status}</span>;
const LoadingSpinner = () => <div className="flex justify-center items-center p-8"><div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div></div>;
const ErrorMessage = ({ message }) => <div className="text-center text-red-500 p-8 bg-red-100 rounded-lg">{`Error: ${message}`}</div>;


const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
    const { data: order, isLoading, isError, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderById(orderId),
        enabled: !!orderId,
    });

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: #${orderId?.slice(-6)}`}>
            {isLoading && <LoadingSpinner />}
            {isError && <ErrorMessage message={error?.message || "Failed to load order details."} />}
            {order && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Customer Details</h4>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> <span className="font-medium text-gray-600">{order.customer?.fullName}</span></p>
                                <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> <span className="text-gray-600">{order.customer?.email}</span></p>
                                <p className="flex items-center gap-2"><PhoneCallIcon size={14} className="text-gray-400" /> <span className="text-gray-600">{order.phone}</span></p>
                            </div>
                        </Card>
                        <Card>
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Delivery Address</h4>
                            <p className="flex items-start gap-2 text-sm text-gray-600">
                                <HomeIcon size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                                <span>{order.address}</span>
                            </p>
                        </Card>
                        <Card>
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Payment Information</h4>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <DollarSign size={14} className="text-gray-400" />
                                    <span>Method: <span className="font-medium text-gray-600">{order.paymentMethod}</span></span>
                                </p>
                                {order.transactionId && (
                                    <p className="flex items-center gap-2">
                                        <span className="text-gray-400 font-mono text-lg">#</span>
                                        <span>ID: <span className="font-mono text-xs text-gray-600">{order.transactionId}</span></span>
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Items Ordered ({order.items.length})</h4>
                        <div className="border rounded-lg overflow-hidden border-gray-200">
                            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                {order.items.map((item, index) => (
                                    <div key={item.product || index} className="p-3 flex items-center gap-4 bg-gray-50">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=Img'; }} />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-medium text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-100 text-right font-bold text-lg text-gray-800">
                                Total: ₹{order.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};


const DashboardPage = () => {
    const { data: stats, isLoading, isError, error } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchDashboardStats });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage message={error.message} />;

    const safeStats = {
        totalRevenue: stats?.totalRevenue || 0,
        totalOrders: stats?.totalOrders || 0,
        totalCustomers: stats?.totalCustomers || 0,
        salesData: stats?.salesData || [],
        topProducts: stats?.topProducts || [],
        recentOrders: stats?.recentOrders || [],
    };

    const LightTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md">
                    <p className="label font-semibold text-gray-700">{`${label}`}</p>
                    <p className="intro text-blue-600">{`Sales : ₹${payload[0].value.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:border-blue-500 border-2 border-transparent"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full"><DollarSign className="text-blue-600" size={28} /></div><div><p className="text-gray-500 text-sm">Total Revenue</p><p className="text-2xl font-bold text-gray-800">₹{safeStats.totalRevenue?.toLocaleString()}</p></div></div></Card>
                <Card className="hover:border-green-500 border-2 border-transparent"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-full"><ClipboardList className="text-green-600" size={28} /></div><div><p className="text-gray-500 text-sm">Total Orders</p><p className="text-2xl font-bold text-gray-800">{safeStats.totalOrders}</p></div></div></Card>
                <Card className="hover:border-indigo-500 border-2 border-transparent"><div className="flex items-center gap-4"><div className="p-3 bg-indigo-100 rounded-full"><Users className="text-indigo-600" size={28} /></div><div><p className="text-gray-500 text-sm">Total Customers</p><p className="text-2xl font-bold text-gray-800">{safeStats.totalCustomers}</p></div></div></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3"><h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Overview</h2><div style={{ width: '100%', height: 300 }}><ResponsiveContainer><LineChart data={safeStats.salesData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="_id.month" stroke="rgb(107 114 128)" /><YAxis stroke="rgb(107 114 128)" /><Tooltip content={<LightTooltip />} /><Legend /><Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div></Card>
                <Card className="lg:col-span-2"><h2 className="text-xl font-semibold mb-4 text-gray-800">Top Products</h2><div style={{ width: '100%', height: 300 }}><ResponsiveContainer><PieChart><Pie data={safeStats.topProducts} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{safeStats.topProducts.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip content={<LightTooltip />} /><Legend /></PieChart></ResponsiveContainer></div></Card>
            </div>
            <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 uppercase bg-gray-50"><tr><th className="p-3">Order ID</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th></tr></thead>
                        <tbody>
                            {safeStats.recentOrders?.map(order => (
                                <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-900">#{order._id.slice(-6)}</td>
                                    <td className="p-3 text-gray-600">{order.customer?.fullName || 'N/A'}</td>
                                    <td className="p-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3"><StatusBadge status={order.status} /></td>
                                    <td className="p-3 text-right font-medium text-gray-900">₹{order.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const OrdersPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { data: orders, isLoading, isError, error } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

    const mutation = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Order status updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update order status.");
        }
    });

    const handleStatusChange = (orderId, status) => {
        mutation.mutate({ orderId, status });
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setDetailsModalOpen(true);
    };

    const handleCloseModal = () => {
        setDetailsModalOpen(false);
        setSelectedOrderId(null);
    }

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage message={error.message} />;

    const filteredOrders = Array.isArray(orders) ? orders.filter(o =>
        (o.customer?.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        o._id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search by Order ID or Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Payment</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(order._id)}>
                                        <td className="p-3 font-medium text-gray-900">#{order._id.slice(-6)}</td>
                                        <td className="p-3 text-gray-600">{order.customer?.fullName || 'N/A'}</td>
                                        <td className="p-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-gray-600">{order.paymentMethod}</td>
                                        <td className="p-3 text-right font-medium">₹{order.amount.toLocaleString()}</td>
                                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`w-full p-1.5 text-xs font-semibold text-center rounded-md appearance-none border-0 focus:ring-2 focus:ring-offset-2 ${getStatusColor(order.status)}`}
                                            >
                                                <option>Pending</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            <OrderDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseModal} orderId={selectedOrderId} />
        </div>
    );
};

const ProductsPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data: productsData, isLoading: productsLoading, isError: productsIsError, error: productsError } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
    const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesIsError, error: categoriesError } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

    const addMutation = useMutation({ mutationFn: addProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }) });
    const updateMutation = useMutation({ mutationFn: updateProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }) });
    const deleteMutation = useMutation({ mutationFn: deleteProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }) });

    const handleAddNew = () => { setEditingProduct(null); setIsModalOpen(true); };
    const handleEdit = (product) => { setEditingProduct(product); setIsModalOpen(true); };
    const handleDeleteClick = (id) => { setItemToDelete(id); setConfirmOpen(true); };

    const confirmDelete = () => {
        deleteMutation.mutate(itemToDelete, {
            onSuccess: () => toast.success("Product deleted successfully."),
            onError: (err) => toast.error(err.response?.data?.message || "Failed to delete product."),
            onSettled: () => { setConfirmOpen(false); setItemToDelete(null); }
        });
    };

    const handleSave = (productData) => {
        const dataToSend = { ...productData, category: productData.categoryId };
        delete dataToSend.categoryId;
        if (!dataToSend.imageUrl) { toast.error("Product Image URL is required."); return; }

        const mutation = editingProduct ? updateMutation : addMutation;
        const dataToSave = editingProduct ? { ...dataToSend, id: editingProduct._id } : dataToSend;

        mutation.mutate(dataToSave, {
            onSuccess: () => {
                toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
                closeModal();
            },
            onError: (err) => toast.error(err.response?.data?.message || "An error occurred.")
        });
    };

    const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };

    if (productsLoading || categoriesLoading) return <LoadingSpinner />;
    if (productsIsError) return <ErrorMessage message={productsError.message} />;
    if (categoriesIsError) return <ErrorMessage message={categoriesError.message} />;

    const products = Array.isArray(productsData) ? productsData : [];
    const categories = Array.isArray(categoriesData) ? categoriesData : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-gray-800">Product Management</h1><Button onClick={handleAddNew}><Plus size={20} />Add New Product</Button></div>
            <Card>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-sm text-gray-500 uppercase bg-gray-50"><tr><th className="p-3"></th><th className="p-3">Product Name</th><th className="p-3">Category</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Stock</th><th className="p-3 text-center">Actions</th></tr></thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (<tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-3"><img src={product.imageUrl || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=No+Image'} alt={product.name} className="w-12 h-12 object-cover rounded-md" /></td>
                                <td className="p-3 font-medium text-gray-900">{product.name}</td>
                                <td className="p-3 text-gray-600">{product.category ? product.category.name : 'Uncategorized'}</td>
                                <td className="p-3 text-right font-medium">₹{product.price.toLocaleString()}</td><td className="p-3 text-right font-medium">{product.stock}</td>
                                <td className="p-3 text-center"><div className="flex justify-center items-center gap-2"><button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={18} /></button><button onClick={() => handleDeleteClick(product._id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button></div></td>
                            </tr>))
                        ) : (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-500">No products found. Click "Add New Product" to get started.</td></tr>
                        )}
                    </tbody>
                </table></div>
            </Card>
            <ProductFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} product={editingProduct} categories={categories} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Product" message="Are you sure you want to delete this product? This action is permanent." />
        </div>
    );
};

const CategoriesPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data: categories, isLoading, isError, error } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
    const addMutation = useMutation({ mutationFn: addCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }) });
    const updateMutation = useMutation({ mutationFn: updateCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }) });
    const deleteMutation = useMutation({ mutationFn: deleteCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }) });

    const handleAddNew = () => { setEditingCategory(null); setIsModalOpen(true); };
    const handleEdit = (category) => { setEditingCategory(category); setIsModalOpen(true); };
    const handleDeleteClick = (id) => { setItemToDelete(id); setConfirmOpen(true); };
    const confirmDelete = () => {
        deleteMutation.mutate(itemToDelete, {
            onSuccess: () => toast.success("Category deleted."),
            onError: (err) => toast.error(err.response?.data?.message || "Failed to delete category."),
            onSettled: () => { setConfirmOpen(false); setItemToDelete(null); }
        });
    };
    const handleSave = (categoryData) => {
        const mutation = editingCategory ? updateMutation : addMutation;
        const dataToSave = editingCategory ? { ...categoryData, id: editingCategory._id } : categoryData;
        mutation.mutate(dataToSave, {
            onSuccess: () => {
                toast.success(`Category ${editingCategory ? 'updated' : 'added'} successfully!`);
                closeModal();
            },
            onError: (err) => toast.error(err.response?.data?.message || "An error occurred.")
        });
    };
    const closeModal = () => { setIsModalOpen(false); setEditingCategory(null); }

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage message={error.message} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-gray-800">Category Management</h1><Button onClick={handleAddNew}><Plus size={20} />Add New Category</Button></div>
            <Card>
                <div className="space-y-4">
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                            <div key={category._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                                <span className="font-medium text-gray-800">{category.name}</span>
                                <div className="flex gap-2"><button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-gray-200"><Edit size={18} /></button><button onClick={() => handleDeleteClick(category._id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-200"><Trash2 size={18} /></button></div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-gray-500">No categories found.</div>
                    )}
                </div>
            </Card>
            <CategoryFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} category={editingCategory} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Category" message="Are you sure? Deleting a category might affect products associated with it." />
        </div>
    );
};




const ProductFormModal = ({ isOpen, onClose, onSave, product, categories }) => {
    const [formData, setFormData] = useState({ name: '', categoryId: '', price: '', stock: '', imageUrl: '' });
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '', categoryId: product.category?._id || product.categoryId || '', price: product.price || '', stock: product.stock || '', imageUrl: product.imageUrl || ''
            });
        } else {
            setFormData({ name: '', categoryId: '', price: '', stock: '', imageUrl: '' });
        }
    }, [product, isOpen]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); }
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="name" name="name" label="Product Name" value={formData.name} onChange={handleChange} required />
                <div><label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label><select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"><option value="">Select a category</option>{(categories || []).map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4"><Input id="price" name="price" label="Price (₹)" type="number" value={formData.price} onChange={handleChange} required /><Input id="stock" name="stock" label="Stock Quantity" type="number" value={formData.stock} onChange={handleChange} required /></div>
                <Input id="imageUrl" name="imageUrl" label="Product Image URL" value={formData.imageUrl} onChange={handleChange} required />
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">{product ? 'Save Changes' : 'Add Product'}</Button></div>
            </form>
        </Modal>
    );
};

const CategoryFormModal = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState('');
    useEffect(() => { if (category) { setName(category.name); } else { setName(''); } }, [category, isOpen]);
    const handleSubmit = (e) => { e.preventDefault(); onSave({ name }); };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add New Category'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="name" name="name" label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">{category ? 'Save Changes' : 'Add Category'}</Button></div>
            </form>
        </Modal>
    );
};

const AdminDashboard = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    // CHATBOT & LOGOUT HOOKS
    const { isChatbotVisible, toggleChatbot, closeChatbot } = useChatbot();
    const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const handleLogout = () => {
        setLogoutConfirmOpen(false);
        logout();
        window.location.href = '/';
    };

    const confirmLogoutFromChatbot = () => {
        closeChatbot();
        setTimeout(() => setLogoutConfirmOpen(true), 100);
    };

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'logout') {
                setLogoutConfirmOpen(true);
            } else {
                const validPages = ['dashboard', 'orders', 'products', 'categories', 'users', 'profile'];
                setActivePage(validPages.includes(hash) ? hash : 'dashboard');
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardPage />;
            case 'orders': return <OrdersPage />;
            case 'products': return <ProductsPage />;
            case 'categories': return <CategoriesPage />;
            case 'users': return <UsersPage />;
            case 'profile': return <AdminProfilePage />;
            default: return <DashboardPage />;
        }
    };

    const NavLink = ({ page, icon: Icon, children, isLogout = false }) => (
        <a
            href={`#${page}`}
            onClick={(e) => {
                if (isLogout) {
                    e.preventDefault();
                    setLogoutConfirmOpen(true);
                }
                setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${activePage === page ? 'bg-green-600 text-white font-semibold shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            <Icon size={22} /><span className="text-md">{children}</span>
        </a>
    );

    const SidebarContent = () => (
        <>
            <div className="p-4 flex items-center justify-between">
                <a href="#dashboard" className="flex items-center gap-3">
                    <img src="/NepGrocery.png" alt="GrocerAdmin Logo" className="h-12 w-auto" />
                </a>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={24} /></button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink page="dashboard" icon={BarChart}>Dashboard</NavLink>
                <NavLink page="orders" icon={ClipboardList}>Orders</NavLink>
                <NavLink page="products" icon={Package}>Products</NavLink>
                <NavLink page="categories" icon={Tag}>Categories</NavLink>
                <NavLink page="users" icon={Users}>Customers</NavLink>
                <NavLink page="profile" icon={UserIcon}>Profile</NavLink>
            </nav>
            <div className="p-4 border-t border-gray-200">
                <NavLink page="logout" icon={LogOut} isLogout={true}>Logout</NavLink>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            <div className={`fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-72 bg-white shadow-lg flex flex-col"><SidebarContent /></div>
                <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
            </div>
            <aside className="w-72 bg-white shadow-md hidden lg:flex flex-col flex-shrink-0"><SidebarContent /></aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu size={28} /></button>
                    <div className="hidden lg:block"></div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar user={user} size={40} />
                            <div>
                                <p className="font-semibold text-sm">{user?.fullName || 'Admin'}</p>
                                <p className="text-xs text-gray-500">Store Manager</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">{renderPage()}</main>
            </div>

            {/* --- FLOATING CHATBOT --- */}
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
            />

            <ConfirmationModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => {
                    setLogoutConfirmOpen(false);
                    window.location.hash = activePage;
                }}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
                confirmVariant="danger"
            />
        </div>
    );
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminDashboard />
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </QueryClientProvider>
    );
};
export default App;