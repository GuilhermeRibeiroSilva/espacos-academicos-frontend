import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes de Autenticação
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import Layout from './components/layout/Layout';

// Componentes da Aplicação
import Dashboard from './components/Dashboard';
import ListaEspacos from './components/espacos/ListaEspacos';
import FormEspaco from './components/espacos/FormEspaco';
import ListaProfessores from './components/professores/ListaProfessores';
import FormProfessor from './components/professores/FormProfessor';
import ReservasProfessor from './components/professores/ReservasProfessor';
import ListaReservas from './components/reservas/ListaReservas';
import FormReserva from './components/reservas/FormReserva';
import GerenciarUsuarios from './components/usuarios/GerenciarUsuarios';
import NotFound from './components/common/NotFound';

// Constantes
const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  PROFESSOR: 'ROLE_PROFESSOR'
};

function AppRoutes() {
  // Helper para criar rotas protegidas com layout
  const ProtectedPage = ({ element, roles }) => (
    <ProtectedRoute allowedRoles={roles}>
      <Layout>{element}</Layout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Rotas de autenticação */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard - acessível para todos os usuários autenticados */}
      <Route path="/dashboard" element={<ProtectedPage element={<Dashboard />} />} />
      
      {/* Rotas para espaços - administrativas */}
      <Route 
        path="/espacos" 
        element={<ProtectedPage element={<ListaEspacos />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/espacos/novo" 
        element={<ProtectedPage element={<FormEspaco />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/espacos/:id" 
        element={<ProtectedPage element={<FormEspaco />} roles={[ROLES.ADMIN]} />} 
      />
      
      {/* Rotas para professores - administrativas */}
      <Route 
        path="/professores" 
        element={<ProtectedPage element={<ListaProfessores />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/professores/novo" 
        element={<ProtectedPage element={<FormProfessor />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/professores/:id" 
        element={<ProtectedPage element={<FormProfessor />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/professores/editar/:id" 
        element={<ProtectedPage element={<FormProfessor />} roles={[ROLES.ADMIN]} />} 
      />
      <Route 
        path="/professores/:id/reservas" 
        element={<ProtectedPage element={<ReservasProfessor />} roles={[ROLES.ADMIN]} />} 
      />
      
      {/* Rotas para reservas - acessível para admin e professores */}
      <Route 
        path="/reservas" 
        element={<ProtectedPage element={<ListaReservas />} roles={[ROLES.ADMIN, ROLES.PROFESSOR]} />} 
      />
      <Route 
        path="/reservas/nova" 
        element={<ProtectedPage element={<FormReserva />} roles={[ROLES.ADMIN, ROLES.PROFESSOR]} />} 
      />
      <Route 
        path="/reservas/:id" 
        element={<ProtectedPage element={<FormReserva />} roles={[ROLES.ADMIN, ROLES.PROFESSOR]} />} 
      />
      <Route 
        path="/reservas/editar/:id" 
        element={<ProtectedPage element={<FormReserva />} roles={[ROLES.ADMIN]} />} 
      />
      
      {/* Rota para gerenciamento de usuários (admin only) */}
      <Route 
        path="/usuarios" 
        element={<ProtectedPage element={<GerenciarUsuarios />} roles={[ROLES.ADMIN]} />} 
      />
      
      {/* Rotas de erro */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;