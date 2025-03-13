import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#181B59',
      dark: '#0F1140',
      light: '#2C2F7C',
    },
    secondary: {
      main: '#F2E085',
    },
    background: {
      default: '#F2F2F2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F1140',
      secondary: '#181B59',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    h2: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    h3: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    h4: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    h5: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    h6: {
      fontFamily: 'Orbitron, Arial, sans-serif',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
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
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;