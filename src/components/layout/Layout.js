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
    await logout();
    navigate('/login');
  };

  // Função para obter o nome de exibição do usuário
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.professorNome || user.username.split('@')[0]; // Exibir apenas parte antes do @ para emails
  };

  // Função para obter as iniciais do usuário para o avatar de forma mais robusta
  const getUserInitials = () => {
    if (!user) return '';
    
    if (user.professorNome) {
      const nameParts = user.professorNome.split(' ').filter(part => part.length > 0);
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return user.professorNome.substring(0, 2).toUpperCase();
    }
    
    // Para emails, usar as primeiras duas letras antes do @
    const username = user.username.split('@')[0];
    return username.substring(0, 2).toUpperCase();
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