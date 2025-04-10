import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    textAlign: "center",
    padding: 3
  },
  title: {
    color: '#0F1140',
    fontSize: '6rem',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#0F1140', 
    mb: 2
  },
  description: {
    maxWidth: '500px', 
    mb: 4
  },
  button: {
    mt: 2,
    backgroundColor: '#0F1140',
    color: 'white',
    padding: '10px 30px',
    '&:hover': {
      backgroundColor: '#1a1b4b',
    },
  }
};

const NotFound = () => {
  return (
    <Box sx={styles.container}>
      <Typography variant="h1" sx={styles.title} gutterBottom>
        404
      </Typography>
      <Typography variant="h4" sx={styles.subtitle}>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={styles.description}>
        A página que você está procurando não existe ou foi movida. 
        Por favor, retorne ao dashboard ou entre em contato com o administrador.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        size="large"
        sx={styles.button}
      >
        Voltar para o Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;