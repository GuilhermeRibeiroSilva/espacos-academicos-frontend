import React, { useState, useEffect } from 'react';
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
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import HomeIcon from '@mui/icons-material/Home';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

// Importar logo da faculdade
import LogoFaculdade from '../../img/ucasl-branco.png'; // Certifique-se de ter o logo neste caminho

const Layout = ({ children }) => {
  const { auth, logout, isAdmin } = useAuth();
  const { loading, showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);
  
  // Novos estados para os submenus
  const [espacosMenuAnchorEl, setEspacosMenuAnchorEl] = useState(null);
  const [usuariosMenuAnchorEl, setUsuariosMenuAnchorEl] = useState(null);
  const [reservasMenuAnchorEl, setReservasMenuAnchorEl] = useState(null);
  const [professoresMenuAnchorEl, setProfessoresMenuAnchorEl] = useState(null);
  
  const handleUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result) {
        navigate('/login');
      } else {
        // Se o logout da API falhou mas limpamos localmente
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao processar logout:', error);
      // Mesmo com erro, redirecionar para login
      navigate('/login');
    }
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleUserMenuClose();
    closeAllMenus();
  };
  
  // Funções para abrir submenus
  const handleEspacosMenu = (event) => {
    setEspacosMenuAnchorEl(event.currentTarget);
  };
  
  const handleUsuariosMenu = (event) => {
    setUsuariosMenuAnchorEl(event.currentTarget);
  };
  
  const handleReservasMenu = (event) => {
    setReservasMenuAnchorEl(event.currentTarget);
  };
  
  const handleProfessoresMenu = (event) => {
    setProfessoresMenuAnchorEl(event.currentTarget);
  };
  
  // Funções para fechar submenus
  const handleMenuClose = (menuSetter) => {
    menuSetter(null);
  };
  
  const closeAllMenus = () => {
    setEspacosMenuAnchorEl(null);
    setUsuariosMenuAnchorEl(null);
    setReservasMenuAnchorEl(null);
    setProfessoresMenuAnchorEl(null);
    setUserMenuAnchorEl(null);
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
    
    // Caso contrário, usar as iniciais do email ou nome de usuário
    const displayName = auth.user.username.split('@')[0];
    return displayName.charAt(0).toUpperCase();
  };
  
  const getUserDisplayName = () => {
    if (!auth.user) return '';
    if (auth.user.professorNome) return auth.user.professorNome;
    return auth.isAdmin ? 'Administrador' : auth.user.username.split('@')[0];
  };
  
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#0F1140' }}>
        <Toolbar>
          {/* Logo e Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src={LogoFaculdade} 
              alt="Logo da Faculdade" 
              style={{ height: 40, marginRight: 10 }} 
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SCEA
            </Typography>
          </Box>
          
          {auth.isAuthenticated && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row-reverse'}}>
                {/* Botão Dashboard/Início para todos */}
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard')}
                  startIcon={<HomeIcon />}
                >
                  Início
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
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    width: 200,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getUserDisplayName()}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {auth.isAdmin ? 'Administrador' : 'Professor'}
                  </Typography>
                </MenuItem>
                <Divider />
                
                {/* Menu de opções específicas baseado no tipo de usuário */}
                {auth.isAdmin ? (
                  <div>
                    <MenuItem onClick={() => handleNavigate('/espacos')}>
                      <ListItemIcon>
                        <MeetingRoomIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Espaços" />
                    </MenuItem>

                    <MenuItem onClick={() => handleNavigate('/professores')}>
                      <ListItemIcon>
                        <GroupIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Professores" />
                    </MenuItem>
                    
                    <MenuItem onClick={() => handleNavigate('/usuarios')}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Usuários" />
                    </MenuItem>
                    
                    <MenuItem onClick={() => handleNavigate('/reservas')}>
                      <ListItemIcon>
                        <CalendarMonthIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Reservas" />
                    </MenuItem>
                  </div>
                ) : (
                  // Menu para professores
                  <div>
                    <MenuItem onClick={() => handleNavigate('/reservas')}>
                      <ListItemIcon>
                        <CalendarMonthIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Reservas" />
                    </MenuItem>
                  </div>
                )}
                
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Sair" />
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
    </Box>
  );
};

export default Layout;