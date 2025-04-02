import React, { createContext, useState, useContext, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Definindo o componente LoadingOverlay
const LoadingOverlay = ({ message = 'Carregando...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 17, 64, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ color: '#F2EEFF' }} 
      />
      <Typography
        variant="h6"
        sx={{
          color: '#F2EEFF',
          marginTop: 2,
          fontWeight: 'medium',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

// Criar contexto com valor inicial consistente
const LoadingContext = createContext({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {}
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Funções de callback para evitar re-renderizações
  const showLoading = useCallback((msg = 'Carregando...') => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage('');
  }, []);

  // Valor do contexto
  const contextValue = {
    isLoading,
    showLoading,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && <LoadingOverlay message={message} />}
    </LoadingContext.Provider>
  );
};

// Hook personalizado
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
};
