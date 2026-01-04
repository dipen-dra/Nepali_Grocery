import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Avatar } from '../components/Avatar';
import { Loader2, Calendar, MapPin, Edit, X, Save, Edit2, User, Mail, KeyRound } from 'lucide-react';
import dayjs from 'dayjs';
import axios from 'axios';

import api from '../api/api';

const updateUserProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    return data;
};

const updateUserProfilePicture = async (formData) => {
    const { data } = await api.put('/auth/profile/picture', formData);
    return data;
};

const getAddressFromCoords = async (lat, lon) => {
    try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        return data?.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        toast.error("Could not fetch address. Using coordinates instead.");
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
};



const ProfileInfoField = ({ icon: Icon, label, value, isPlaceholder = false }) => (
    <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3 mt-1">
            <Icon className="text-gray-400" size={20} />
            <p className={`text-base ${isPlaceholder ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                {value || 'Not set'}
            </p>
        </div>
    </div>
);

const ProfileInputField = ({ name, value, onChange, label, placeholder, type = "text" }) => (
    <div>
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
    </div>
);



const AdminProfilePage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', location: '', twoFactorEnabled: false });
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const resetFormData = useCallback(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                location: user.location || '',
                twoFactorEnabled: user.twoFactorEnabled || false
            });
        }
    }, [user]);

    useEffect(() => {
        resetFormData();
    }, [user, resetFormData]);

    const profileUpdateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            updateUser(data.data);
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Profile updated successfully!');
            setIsEditMode(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update profile.')
    });

    const pictureUpdateMutation = useMutation({
        mutationFn: updateUserProfilePicture,
        onSuccess: (data) => {
            updateUser(data.data);
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Profile picture updated successfully!');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update picture.')
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        profileUpdateMutation.mutate(formData);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const pictureFormData = new FormData();
        pictureFormData.append('profilePicture', file);
        pictureUpdateMutation.mutate(pictureFormData);
    };

    const handleFetchLocation = () => {
        if (!isEditMode) return;
        setIsFetchingLocation(true);
        toast.info("Fetching your location...");
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const address = await getAddressFromCoords(coords.latitude, coords.longitude);
                setFormData(prev => ({ ...prev, location: address }));
                setIsFetchingLocation(false);
                if (address.includes(',')) toast.success('Location fetched!');
            },
            () => {
                toast.error('Unable to retrieve your location.');
                setIsFetchingLocation(false);
            }
        );
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        resetFormData();
    };

    if (!user) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-green-600" size={48} /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* --- Header --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your profile details and preferences.</p>
                    </div>
                    {!isEditMode && (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* --- Main Content --- */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative group w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                                <Avatar user={user} size={128} className="rounded-full border-4 border-white shadow-md" />
                                {isEditMode && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 size={24} />
                                        <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" disabled={pictureUpdateMutation.isLoading} />
                                    </label>
                                )}
                            </div>
                            {/* User Info */}
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-gray-500">
                                    <Calendar size={14} />
                                    <span>Joined on {dayjs(user.createdAt).format('MMMM D, YYYY')}</span>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8" />

                        {/* --- Form / Details Section --- */}
                        <form onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {isEditMode ? (
                                    <>
                                        <ProfileInputField name="fullName" label="Full Name" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" />
                                        <ProfileInputField name="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" />

                                        {/* Location Input with Button */}
                                        <div>
                                            <label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label>
                                            <div className="mt-1 flex gap-2">
                                                <input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} placeholder="Click pin to fetch location" className="flex-grow p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                                                <button type="button" onClick={handleFetchLocation} disabled={isFetchingLocation} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isFetchingLocation ? <Loader2 className="animate-spin" /> : <MapPin />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* 2FA Toggle */}
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                                            <input
                                                id="twoFactorEnabled"
                                                name="twoFactorEnabled"
                                                type="checkbox"
                                                checked={formData.twoFactorEnabled}
                                                onChange={(e) => setFormData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                            />
                                            <label htmlFor="twoFactorEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Enable Two-Factor Authentication (2FA)
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ProfileInfoField icon={User} label="Full Name" value={user.fullName} />
                                        <ProfileInfoField icon={Mail} label="Email Address" value={user.email} />
                                        <ProfileInfoField icon={MapPin} label="Location" value={user.location} isPlaceholder={!user.location} />
                                        <ProfileInfoField icon={KeyRound} label="Role" value={user.role} />
                                        <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="font-medium text-gray-700">
                                                    Two-Factor Authentication is <span className={user.twoFactorEnabled ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{user.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}</span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                                {user.twoFactorEnabled
                                                    ? "Your account is secured. You will be asked for an OTP when logging in."
                                                    : "Enable 2FA to add an extra layer of security to your admin account."}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* --- Action Buttons for Edit Mode --- */}
                            {isEditMode && (
                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                                    <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={profileUpdateMutation.isLoading} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition disabled:opacity-50">
                                        {profileUpdateMutation.isLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;