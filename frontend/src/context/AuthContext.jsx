import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    // Check for existing auth on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (token && userData) {
                    // Verify token with backend
                    const response = await axios.get('http://localhost:8080/api/auth/verify', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        setUser(JSON.parse(userData));
                    } else {
                        // Token is invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                // Clear invalid auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (userData, token) => {
        try {
            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set user state
            setUser(userData);
            
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear user state
        setUser(null);
        
        // Remove axios header
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 