import { createContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    // Check for existing session using the profile endpoint
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success && data.data) {
                    setUser(data.data);

                    // Check Password Expiration (30 Days)
                    if (data.data.passwordLastChangedAt) {
                        const lastChanged = dayjs(data.data.passwordLastChangedAt);
                        const daysDiff = dayjs().diff(lastChanged, 'day');

                        if (daysDiff > 30) {
                            toast.warning("It's been a while! Please update your password for better security.", {
                                autoClose: 10000
                            });
                        }
                    }
                }
            } catch (error) {
                // console.error("Session check failed", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (data) => {
        if (data && data.data) {
            const userData = data.data;

            setUser(userData);

            if (userData.role === 'admin') {
                // Admins go to their specific dashboard
                navigate('/admin/dashboard', { replace: true });
            } else {
                // Standard users default to the shop dashboard
                navigate('/dashboard/shop', { replace: true });
            }

        } else {
            console.error("Login failed: Invalid data received from server.", data);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token'); // Clear token
            setUser(null);
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout failed", error);
            // Force logout on error
            localStorage.removeItem('token'); // Clear token
            setUser(null);
            navigate("/", { replace: true });
        }
    };

    const updateUser = (updatedUserData) => {
        if (updatedUserData) {
            setUser(updatedUserData);
        }
    };

    const contextValue = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user
    }), [user, loading]);

    return (
        <AuthContext.Provider value={contextValue}>

            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;