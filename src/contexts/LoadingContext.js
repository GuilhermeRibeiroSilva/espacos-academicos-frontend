import React, { createContext, useState, useContext } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const LoadingContext = createContext(null);

// Adicionar um contador para múltiplas chamadas de loading
export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [message, setMessage] = useState('Carregando...');

  const showLoading = (msg = 'Carregando...') => {
    setMessage(msg);
    setLoadingCount(prev => prev + 1);
  };

  const hideLoading = () => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  };

  // Só mostra o loading se o contador for > 0
  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Box mt={2}>
          <Typography variant="h6">{message}</Typography>
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
};
