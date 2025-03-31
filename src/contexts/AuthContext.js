import React, { createContext, useContext, useState, useEffect } from 'react';
// Ajuste o caminho conforme a estrutura do seu projeto
import api from '../services/api'; // ou ajuste para o caminho correto

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Verificar se existe dado no localStorage antes de tentar fazer o parse
        const storedAuth = localStorage.getItem('auth');
        return storedAuth ? JSON.parse(storedAuth) : {
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isProfessor: false
        };
    });

    useEffect(() => {
        // Verificar se existe dado no localStorage antes de tentar fazer o parse
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
            try {
                // Decodificar token para verificar expiração
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                
                // Se token expirado, fazer logout
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                    return;
                }
                
                const user = JSON.parse(storedUser);
                const isAuthenticated = true;
                const isAdmin = user.role === 'ROLE_ADMIN';
                const isProfessor = user.role === 'ROLE_PROFESSOR';
                
                setAuth({ 
                    user, 
                    isAuthenticated,
                    isAdmin,
                    isProfessor
                });
            } catch (error) {
                console.error('Erro ao processar dados do usuário:', error);
                // Se houver erro, limpa os dados corrompidos
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('auth');
            }
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, ...user } = response.data;
            
            const isAdmin = user.role === 'ROLE_ADMIN';
            const isProfessor = user.role === 'ROLE_PROFESSOR';
            
            const authData = { 
                user, 
                isAuthenticated: true,
                isAdmin,
                isProfessor
            };
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('auth', JSON.stringify(authData));
            
            setAuth(authData);
            
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            // Tenta fazer logout no servidor, se aplicável
            // await api.post('/auth/logout');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Mesmo se falhar no servidor, limpa os dados locais
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth');
            
            setAuth({ 
                user: null, 
                isAuthenticated: false,
                isAdmin: false,
                isProfessor: false
            });
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user: auth.user,
            isAuthenticated: auth.isAuthenticated,
            isAdmin: auth.isAdmin,
            isProfessor: auth.isProfessor,
            login,
            logout
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