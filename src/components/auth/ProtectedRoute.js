import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente para proteger rotas baseado em autenticação e autorização
 * @param {object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados
 * @param {string[]} [props.allowedRoles=[]] - Lista de papéis permitidos para acessar a rota
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { auth } = useAuth();
    
    // Verifica autenticação
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Se não houver restrição de papéis, permite o acesso
    if (allowedRoles.length === 0) {
        return children;
    }
    
    // Verifica se o usuário tem pelo menos um dos papéis permitidos
    const hasAllowedRole = allowedRoles.some(role => {
        if (role === 'ROLE_ADMIN') return auth.isAdmin;
        if (role === 'ROLE_PROFESSOR') return auth.isProfessor;
        return false;
    });
    
    // Redireciona para dashboard se não tiver permissão
    if (!hasAllowedRole) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
