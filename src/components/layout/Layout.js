import React, { useState } from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoUcb from '../../img/ucasl-branco.png';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isProfessor } = useAuth();
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
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

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
          
          {/* Dashboard Button */}
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<DashboardIcon />}
            sx={{ mr: 2 }}
          >
            Inicio
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
                <div>
                  <MenuItem component={Link} to="/espacos" onClick={handleUserMenuClose}>
                    <ListItemIcon>
                      <MeetingRoomIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Espaços</ListItemText>
                  </MenuItem>
                  
                  <MenuItem component={Link} to="/professores" onClick={handleUserMenuClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Professores</ListItemText>
                  </MenuItem>
                  
                  <MenuItem component={Link} to="/usuarios" onClick={handleUserMenuClose}>
                    <ListItemIcon>
                      <PeopleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Usuários</ListItemText>
                  </MenuItem>
                </div>
              )}
              
              <MenuItem component={Link} to="/reservas" onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <BookIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reservas</ListItemText>
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
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4, pb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;