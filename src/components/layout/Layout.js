import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Container,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/',
            roles: ['ROLE_ADMIN', 'ROLE_PROFESSOR'],
        },
        {
            text: 'Espaços Acadêmicos',
            icon: <MeetingRoomIcon />,
            path: '/espacos',
            roles: ['ROLE_ADMIN'],
        },
        {
            text: 'Professores',
            icon: <PersonIcon />,
            path: '/professores',
            roles: ['ROLE_ADMIN'],
        },
        {
            text: 'Usuários',
            icon: <PeopleIcon />,
            path: '/usuarios',
            roles: ['ROLE_ADMIN'],
        },
        {
            text: 'Reservas',
            icon: <BookIcon />,
            path: '/reservas',
            roles: ['ROLE_ADMIN', 'ROLE_PROFESSOR'],
        },
    ];

    const filteredMenuItems = menuItems.filter((item) => {
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    const drawer = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="div">
                    Sistema de Espaços
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user?.username}
                </Typography>
            </Box>
            <Divider />
            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        component={Link}
                        to={item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sair" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Sistema de Espaços Acadêmicos
                    </Typography>
                    
                    {isAdmin() && (
                        <Box sx={{ mr: 2 }}>
                            <Button color="inherit" onClick={() => navigate('/espacos')}>
                                Espaços
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/professores')}>
                                Professores
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/usuarios')}>
                                Usuários
                            </Button>
                        </Box>
                    )}
                    
                    <Button color="inherit" onClick={() => navigate('/reservas')}>
                        Reservas
                    </Button>
                    
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle2" component="span" sx={{ mr: 2 }}>
                            {user?.username}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>
                            Sair
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            
            <Container sx={{ mt: 4 }}>
                {children}
            </Container>
        </>
    );
};

export default Layout;