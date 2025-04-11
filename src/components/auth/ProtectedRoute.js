import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * @param {object} props 
 * @param {React.ReactNode} props.children 
 * @param {string[]} [props.allowedRoles=[]] 
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { auth } = useAuth();
    
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length === 0) {
        return children;
    }
    
    const hasAllowedRole = allowedRoles.some(role => {
        if (role === 'ROLE_ADMIN') return auth.isAdmin;
        if (role === 'ROLE_PROFESSOR') return auth.isProfessor;
        return false;
    });
    
    if (!hasAllowedRole) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
