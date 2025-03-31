import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/unauthorized" }) => {
    const { isAuthenticated, user, isProfessor, isAdmin } = useAuth();
    const location = useLocation();

    // Verificar autenticação
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar permissões para roles específicos
    if (allowedRoles) {
        // Se é necessário ser admin e não é
        if (allowedRoles.includes('ROLE_ADMIN') && !isAdmin) {
            return <Navigate to={redirectTo} replace />;
        }
        
        // Se é necessário ser professor e não é
        if (allowedRoles.includes('ROLE_PROFESSOR') && !isProfessor) {
            return <Navigate to={redirectTo} replace />;
        }
        
        // Verificação genérica por role
        if (!user?.role || !allowedRoles.includes(user.role)) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
