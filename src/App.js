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
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
      <AppBar position="static">
        <Toolbar>
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
                  <MeetingRoomIcon sx={{ mr: 1 }} /> Novo Espaço
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/professores" onClick={handleClose}>
                  <PersonIcon sx={{ mr: 1 }} /> Professores
                </MenuItem>
                <MenuItem component={Link} to="/professores/novo" onClick={handleClose}>
                  <PersonIcon sx={{ mr: 1 }} /> Novo Professor
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
              <BookIcon sx={{ mr: 1 }} /> Nova Reserva
            </MenuItem>
          </Menu>

          {/* Logo/Título */}
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Sistema de Espaços Acadêmicos
          </Typography>

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

            {isAdmin() && (
              <>
                <Box>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/espacos"
                    startIcon={<MeetingRoomIcon />}
                  >
                    Espaços
                  </Button>
                  <Button color="inherit" component={Link} to="/espacos/novo">
                    Novo
                  </Button>
                </Box>
                
                <Box>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/professores"
                    startIcon={<PersonIcon />}
                  >
                    Professores
                  </Button>
                  <Button color="inherit" component={Link} to="/professores/novo">
                    Novo
                  </Button>
                </Box>

                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/usuarios"
                  startIcon={<PeopleIcon />}
                >
                  Usuários
                </Button>
              </>
            )}

            <Box>
              <Button 
                color="inherit" 
                component={Link} 
                to="/reservas"
                startIcon={<BookIcon />}
              >
                Reservas
              </Button>
              <Button color="inherit" component={Link} to="/reservas/nova">
                Nova
              </Button>
            </Box>

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
                      bgcolor: isAdmin() ? 'primary.main' : 'secondary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                }
              >
                {user.username}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {isAdmin() ? 'Administrador' : 'Professor'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
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
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;