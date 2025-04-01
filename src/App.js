import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Tema personalizado
import theme from './theme';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate replace to="/login" />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rota de Dashboard - acessível para todos os usuários autenticados */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rotas para espaços - administrativas */}
              <Route path="/espacos" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <ListaEspacos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/espacos/novo" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <FormEspaco />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/espacos/:id" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <FormEspaco />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rotas para professores - administrativas */}
              <Route path="/professores" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <ListaProfessores />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/novo" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <FormProfessor />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/:id" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <FormProfessor />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/:id/reservas" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <ReservasProfessor />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rota para reservas - acessível para admin e professores */}
              <Route path="/reservas" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PROFESSOR']}>
                  <Layout>
                    <ListaReservas />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reservas/nova" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PROFESSOR']}>
                  <Layout>
                    <FormReserva />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reservas/:id" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PROFESSOR']}>
                  <Layout>
                    <FormReserva />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rota para gerenciamento de usuários (admin only) */}
              <Route path="/usuarios" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <GerenciarUsuarios />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rotas de erro */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;