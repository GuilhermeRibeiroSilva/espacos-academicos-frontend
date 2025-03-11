import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { isTokenExpired } from '../utils/security';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            if (storedUser && token && !isTokenExpired(token)) {
                setUser(JSON.parse(storedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                // Limpa dados expirados
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
            }
            
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, ...userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erro ao fazer login');
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const updateUserData = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = () => !!user;
    const isAdmin = () => user?.role === 'ROLE_ADMIN';
    const isProfessor = () => user?.role === 'ROLE_PROFESSOR';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            updateUserData,
            isAuthenticated,
            isAdmin,
            isProfessor
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};