import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { isTokenExpired } from '../utils/security';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
        loading: true
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verificar se o token é válido
            api.get('/auth/verify')
                .then(response => {
                    setAuth({
                        isAuthenticated: true,
                        user: response.data,
                        loading: false
                    });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setAuth({
                        isAuthenticated: false,
                        user: null,
                        loading: false
                    });
                });
        } else {
            setAuth(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = response.data;
            
            // Armazena dados completos do usuário
            localStorage.setItem('user', JSON.stringify({
                id: userData.id,
                username: userData.username,
                role: userData.role,
                professorId: userData.professorId,
                professorNome: userData.professorNome
            }));
            
            setAuth({
                isAuthenticated: true,
                user: userData,
                loading: false
            });
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
            setAuth({
                isAuthenticated: false,
                user: null,
                loading: false
            });
        }
    };

    const updateUserData = (newData) => {
        const updatedUser = { ...auth.user, ...newData };
        setAuth({
            ...auth,
            user: updatedUser
        });
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = () => auth.isAuthenticated;
    const isAdmin = () => auth.user?.role === 'ROLE_ADMIN';
    const isProfessor = () => auth.user?.role === 'ROLE_PROFESSOR';

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            login,
            logout,
            updateUserData,
            isAuthenticated,
            isAdmin,
            isProfessor
        }}>
            {!auth.loading && children}
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