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
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            try {
                const user = JSON.parse(userData);
                const isAdmin = user.role === 'ROLE_ADMIN';
                const isProfessor = user.role === 'ROLE_PROFESSOR';
                
                setAuth({
                    user,
                    isAuthenticated: true,
                    isAdmin,
                    isProfessor
                });
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('auth');
            }
        }
    }, []);

    const login = async (username, password) => {
        try {
            console.log("Tentando login com:", { username });
            // Remova o /api se já está incluído no baseURL
            const response = await api.post('/auth/login', { username, password });
            // OU
            // const response = await api.post('auth/login', { username, password });
            
            const { token, ...user } = response.data;
            
            const isAdmin = user.role === 'ROLE_ADMIN';
            const isProfessor = user.role === 'ROLE_PROFESSOR';
            
            const authData = { 
                user, 
                isAuthenticated: true,
                isAdmin,
                isProfessor
            };
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('auth', JSON.stringify(authData));
            
            setAuth(authData);
            
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error; // Propague o erro para tratamento no componente
        }
    };

    const logout = async () => {
        try {
            // Primeiro, limpar dados locais (sempre deve acontecer)
            const cleanLocalState = () => {
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
            
            // Tentar fazer logout no servidor
            if (auth?.token) {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Falha ao comunicar logout ao servidor:', error);
                    // Continuar mesmo com erro no servidor
                }
            }
            
            // Sempre limpar estado local
            cleanLocalState();
            return true;
        } catch (error) {
            console.error('Erro no processo de logout:', error);
            
            // Mesmo com erro, limpar dados locais
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
            
            return false;
        }
    };

    const isAdmin = () => {
        return auth?.isAdmin || false;
    };

    const isProfessor = () => {
        return auth?.isProfessor || false;
    };

    const getUser = () => {
        return auth?.user || null;
    };

    return (
        <AuthContext.Provider value={{ 
            auth, 
            login, 
            logout, 
            isAdmin, 
            isProfessor, 
            getUser,
            isAuthenticated: auth?.isAuthenticated || false
        }}>
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