import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isProfessor: false
    });
    
    useEffect(() => {
        const loadUserData = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (!token || !userData) return;
            
            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const user = JSON.parse(userData);
                
                setAuth({
                    user,
                    isAuthenticated: true,
                    isAdmin: user.role === 'ROLE_ADMIN',
                    isProfessor: user.role === 'ROLE_PROFESSOR'
                });
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                clearAuthData();
            }
        };
        
        loadUserData();
    }, []);

    const clearAuthData = () => {
        api.defaults.headers.common['Authorization'] = '';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        
        setAuth({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isProfessor: false
        });
    };

    const login = async (username, password) => {
        try {
            console.log("Tentando login com:", { username });
            const response = await api.post('/auth/login', { username, password });
            
            const { token, ...user } = response.data;
            
            const authData = { 
                user, 
                isAuthenticated: true,
                isAdmin: user.role === 'ROLE_ADMIN',
                isProfessor: user.role === 'ROLE_PROFESSOR'
            };
            
            // Salvar dados de autenticação
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('auth', JSON.stringify(authData));
            
            setAuth(authData);
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Tenta comunicar logout ao servidor, mas continua mesmo com erro
            if (auth?.user) {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Falha ao comunicar logout ao servidor:', error);
                }
            }
            
            // Sempre limpa dados locais
            clearAuthData();
            return true;
        } catch (error) {
            console.error('Erro no processo de logout:', error);
            clearAuthData();
            return false;
        }
    };

    // Valores contextuais
    const contextValue = {
        auth,
        login,
        logout,
        isAdmin: () => auth?.isAdmin || false,
        isProfessor: () => auth?.isProfessor || false,
        getUser: () => auth?.user || null,
        isAuthenticated: auth?.isAuthenticated || false
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
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