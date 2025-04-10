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
import LogoutIcon from '@mui/icons-material/Logout';

// Importar logo da faculdade
import LogoFaculdade from '../../img/ucasl-branco.png';

const Layout = ({ children }) => {
  const { auth, logout } = useAuth();
  const { loading, showLoading, hideLoading } = useLoading();
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
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao processar logout:', error);
      navigate('/login');
    }
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleUserMenuClose();
  };
  
  // Função para extrair apenas o primeiro e último nome
  const getUserDisplayName = () => {
    if (!auth.user) return 'Usuário';
    
    let nomeCompleto = auth.user.professorNome || auth.user.username;
    
    // Se for um email, use apenas a parte antes do @
    if (nomeCompleto.includes('@')) {
      nomeCompleto = nomeCompleto.split('@')[0];
      return nomeCompleto.charAt(0).toUpperCase() + nomeCompleto.slice(1);
    }
    
    // Se for um nome completo, use primeiro e último nome
    const nomes = nomeCompleto.trim().split(' ');
    
    if (nomes.length === 1) return nomes[0]; // apenas um nome
    if (nomes.length > 1) return `${nomes[0]} ${nomes[nomes.length - 1]}`; // primeiro e último
    
    return nomeCompleto;
  };
  
  // Função para obter iniciais do nome para o Avatar
  const getUserInitials = () => {
    if (!auth.user) return '?';
    
    // Se for professor, usar as iniciais do nome
    if (auth.user.professorNome) {
      const nomes = auth.user.professorNome.split(' ');
      if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
      return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
    }
    
    // Se não tiver nome de professor, usar o username
    const username = auth.user.username || '';
    
    if (username.includes('@')) {
      // Se for um email, usar a primeira letra antes do @
      return username.charAt(0).toUpperCase();
    }
    
    return username.charAt(0).toUpperCase();
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
                  <>
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
                  </>
                ) : (
                  <MenuItem onClick={() => handleNavigate('/reservas')}>
                    <ListItemIcon>
                      <CalendarMonthIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Reservas" />
                  </MenuItem>
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