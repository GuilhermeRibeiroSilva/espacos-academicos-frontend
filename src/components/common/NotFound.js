import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh" // Aumentar para ocupar mais espaço vertical
      textAlign="center"
      sx={{ padding: 3 }}
    >
      <Typography 
        variant="h1" 
        sx={{ 
          color: '#0F1140', // Usar a cor primária do sistema
          fontSize: '6rem',
          fontWeight: 'bold'
        }} 
        gutterBottom
      >
        404
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ color: '#0F1140', mb: 2 }}
      >
        Página não encontrada
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={{ maxWidth: '500px', mb: 4 }}
      >
        A página que você está procurando não existe ou foi movida. 
        Por favor, retorne ao dashboard ou entre em contato com o administrador.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        size="large"
        sx={{ 
          mt: 2,
          backgroundColor: '#0F1140',
          color: 'white',
          padding: '10px 30px',
          '&:hover': {
            backgroundColor: '#1a1b4b',
          },
        }}
      >
        Voltar para o Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;