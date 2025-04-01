import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';

const Layout = ({ children }) => {
  const { auth, logout, isAdmin } = useAuth();
  const { loading } = useLoading();
  const navigate = useNavigate();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);
  
  const handleUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleUserMenuClose();
  };
  
  // Extrair iniciais do nome de usuário para o Avatar
  const getUserInitials = () => {
    if (!auth.user || !auth.user.username) return '?';
    
    // Se for professor, usar as iniciais do nome
    if (auth.user.professorNome) {
      return auth.user.professorNome
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    // Caso contrário, usar as iniciais do email
    return auth.user.username
      .split('@')[0]
      .charAt(0)
      .toUpperCase();
  };
  
  const getUserDisplayName = () => {
    if (!auth.user) return '';
    return auth.user.professorNome || auth.user.username;
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <AppBar position="static" sx={{ bgcolor: '#0F1140' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Espaços Acadêmicos
          </Typography>
          
          {auth.user && (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                
                {/* Mostrar opções administrativas apenas para admins */}
                {auth.isAdmin && (
                  <>
                    <Button color="inherit" onClick={() => navigate('/espacos')}>
                      Espaços
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/professores')}>
                      Professores
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/usuarios')}>
                      Usuários
                    </Button>
                  </>
                )}
                
                {/* Mostrar para todos os usuários autenticados */}
                <Button color="inherit" onClick={() => navigate('/reservas')}>
                  Reservas
                </Button>
              </Box>
              
              <IconButton
                onClick={handleUserMenu}
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
                <Avatar sx={{ bgcolor: '#F2E085', color: '#0F1140' }}>
                  {getUserInitials()}
                </Avatar>
              </IconButton>
              
              <Menu
                id="user-menu"
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  {getUserDisplayName()} ({auth.isAdmin ? 'Admin' : 'Professor'})
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleNavigate('/perfil')}>
                  Meu Perfil
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/alterar-senha')}>
                  Alterar Senha
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 2, bgcolor: '#f5f5f5', mt: 'auto' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Sistema de Espaços Acadêmicos
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;