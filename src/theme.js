import { createTheme } from '@mui/material/styles';

// Cores base da identidade visual
const colors = {
  ucbBlue: {
    main: '#14104a',
    light: '#3f3a7d',
    dark: '#0d0a2e',
  },
  ucbYellow: {
    main: '#F2E085',
    light: '#f5e9a9',
    dark: '#c9b96e',
  },
  text: {
    primary: '#333333',
    secondary: '#757575',
    disabled: '#9e9e9e',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  }
};

const theme = createTheme({
  // Configuração de cores
  palette: {
    primary: {
      main: colors.ucbBlue.main,
      light: colors.ucbBlue.light,
      dark: colors.ucbBlue.dark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.ucbYellow.main,
      light: colors.ucbYellow.light,
      dark: colors.ucbYellow.dark,
      contrastText: '#000000',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: colors.background,
    text: colors.text,
  },
  
  // Configuração de tipografia
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  
  // Customização de componentes
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 12,
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.background.default,
        },
      },
    },
  },
});

export default theme;