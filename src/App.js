import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import logoUcb from './img/ucasl-branco.png';
import Layout from './components/layout/Layout';

// Tema personalizado
import theme from './theme';

// Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Componentes de Autenticação
import Login from './components/auth/Login';
import RecuperarSenha from './components/auth/RecuperarSenha';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componentes da Aplicação
import Dashboard from './components/Dashboard';
import ListaEspacos from './components/espacos/ListaEspacos';
import FormEspaco from './components/espacos/FormEspaco';
import ListaProfessores from './components/professores/ListaProfessores';
import FormProfessor from './components/professores/FormProfessor';
import ListaReservas from './components/reservas/ListaReservas';
import FormReserva from './components/reservas/FormReserva';
import GerenciarUsuarios from './components/usuarios/GerenciarUsuarios';

const AppContent = () => {
  const { user, logout, isAdmin, isProfessor } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Função para obter o nome de exibição do usuário
  const getUserDisplayName = () => {
    if (!user) return '';

    if (isAdmin()) return 'Administrador';

    // Se for professor, retorna o nome do professor ou o username
    if (isProfessor()) {
      return user.professorNome || user.username.split('@')[0];
    }

    return user.username.split('@')[0];
  };

  // Função para obter as iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!user || !user.username) return '?';

    // Se for um email, pega a primeira letra antes do @
    if (user.username.includes('@')) {
      return user.username.split('@')[0].charAt(0).toUpperCase();
    }

    // Caso contrário, pega a primeira letra
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#0F1140' }}>
        <Toolbar>
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src={logoUcb}
              alt="Logo UCB"
              style={{ height: '40px', marginRight: '16px' }}
            />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
            >
              SCEA
            </Typography>
          </Box>

          {/* Menu Mobile */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>

          {/* Menu Mobile Dropdown */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/" onClick={handleClose}>
              <DashboardIcon sx={{ mr: 1 }} /> Dashboard
            </MenuItem>
            <Divider />
            {isAdmin() && (
              <>
                <MenuItem component={Link} to="/espacos" onClick={handleClose}>
                  <MeetingRoomIcon sx={{ mr: 1 }} /> Espaços
                </MenuItem>
                <MenuItem component={Link} to="/espacos/novo" onClick={handleClose}>
                  <AddIcon sx={{ mr: 1 }} /> Novo Espaço
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/professores" onClick={handleClose}>
                  <PersonIcon sx={{ mr: 1 }} /> Professores
                </MenuItem>
                <MenuItem component={Link} to="/professores/novo" onClick={handleClose}>
                  <AddIcon sx={{ mr: 1 }} /> Novo Professor
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/usuarios" onClick={handleClose}>
                  <PeopleIcon sx={{ mr: 1 }} /> Gerenciar Usuários
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem component={Link} to="/reservas" onClick={handleClose}>
              <BookIcon sx={{ mr: 1 }} /> Reservas
            </MenuItem>
            <MenuItem component={Link} to="/reservas/nova" onClick={handleClose}>
              <AddIcon sx={{ mr: 1 }} /> Nova Reserva
            </MenuItem>
          </Menu>

          {/* Menu Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>

            {/* Menu do Usuário */}
            <Box>
              <Button
                color="inherit"
                onClick={handleUserMenu}
                sx={{ textTransform: 'none' }}
                startIcon={
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isAdmin() ? '#ff6b00' : '#1976d2',
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                }
              >
                {getUserDisplayName()}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {isAdmin() ? 'Administrador' : 'Professor'}
                  </Typography>
                </MenuItem>
                <Divider />

                {isAdmin() && (
                  <>
                    <MenuItem component={Link} to="/espacos" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <MeetingRoomIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Espaços</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} to="/espacos/novo" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <AddIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Novo Espaço</ListItemText>
                    </MenuItem>

                    <MenuItem component={Link} to="/professores" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Professores</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} to="/professores/novo" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <AddIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Novo Professor</ListItemText>
                    </MenuItem>

                    <MenuItem component={Link} to="/usuarios" onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <PeopleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Usuários</ListItemText>
                    </MenuItem>
                  </>
                )}

                <MenuItem component={Link} to="/reservas" onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <BookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reservas</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/reservas/nova" onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Nova Reserva</ListItemText>
                </MenuItem>

                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Sair</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, pb: 4 }}>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Rotas de Admin */}
          <Route path="/espacos" element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <ListaEspacos />
            </ProtectedRoute>
          } />
          <Route path="/espacos/novo" element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <FormEspaco />
            </ProtectedRoute>
          } />

          <Route path="/professores" element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <ListaProfessores />
            </ProtectedRoute>
          } />
          <Route path="/professores/novo" element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <FormProfessor />
            </ProtectedRoute>
          } />

          {/* Rota de Gerenciamento de Usuários */}
          <Route path="/usuarios" element={
            <ProtectedRoute roles={["ROLE_ADMIN"]}>
              <GerenciarUsuarios />
            </ProtectedRoute>
          } />

          {/* Rotas de Reservas */}
          <Route path="/reservas" element={
            <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
              <ListaReservas />
            </ProtectedRoute>
          } />
          <Route path="/reservas/nova" element={
            <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_PROFESSOR"]}>
              <FormReserva />
            </ProtectedRoute>
          } />

          {/* Rota para qualquer caminho não encontrado */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
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
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;