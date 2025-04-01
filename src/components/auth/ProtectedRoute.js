import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { auth } = useAuth();
    
    // Se não estiver autenticado, redirecionar para login
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Se não houver restrição de papéis, apenas verificar autenticação
    if (allowedRoles.length === 0) {
        return children;
    }
    
    // Verificar se o usuário tem pelo menos um dos papéis permitidos
    const hasAllowedRole = 
        (allowedRoles.includes('ROLE_ADMIN') && auth.isAdmin) ||
        (allowedRoles.includes('ROLE_PROFESSOR') && auth.isProfessor);
    
    if (!hasAllowedRole) {
        // Redirecionar para dashboard com acesso limitado
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
