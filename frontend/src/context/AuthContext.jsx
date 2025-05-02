import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const isAlumni = localStorage.getItem('isAlumni') === 'true';
        
        if (token && loggedInUser) {
            // Set initial user data from localStorage
            setUser({
                fullName: loggedInUser,
                isAlumni: isAlumni
            });
            
            // Then try to fetch updated user data
            const fetchUserData = async () => {
                try {
                    const response = await axios.get('/api/user/profile');
                    setUser({
                        ...response.data,
                        isAlumni: isAlumni
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Keep the basic user data from localStorage even if profile fetch fails
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', userData.fullName);
        localStorage.setItem('isAlumni', userData.isAlumni);
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isAlumni');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 