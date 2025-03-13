import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

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

// Tema personalizado
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rota de Login */}
              <Route path="/login" element={<Login />} />

              {/* Rota do Dashboard */}
              <Route path="/" element={
                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Rotas de Espaços */}
              <Route path="/espacos" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <ListaEspacos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/espacos/novo" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <FormEspaco />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/espacos/editar/:id" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <FormEspaco />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Rotas de Professores */}
              <Route path="/professores" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <ListaProfessores />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/novo" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <FormProfessor />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/editar/:id" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <FormProfessor />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professores/:id/reservas" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <ReservasProfessor />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Rotas de Usuários */}
              <Route path="/usuarios" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <Layout>
                    <GerenciarUsuarios />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Rotas de Reservas - CORRIGIDO */}
              <Route path="/reservas" element={
                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
                  <Layout>
                    <ListaReservas userType="admin" />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reservas/nova" element={
                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
                  <Layout>
                    <FormReserva />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reservas/editar/:id" element={
                <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
                  <Layout>
                    <FormReserva />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/professor/reservas" element={
                <ProtectedRoute roles={["ROLE_PROFESSOR"]}>
                  <Layout>
                    <ListaReservas userType="professor" />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Rota curinga para páginas não encontradas */}
              <Route path="*" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;