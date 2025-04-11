import React, { createContext, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

// Componente de overlay que mostra o indicador de carregamento
const LoadingOverlay = ({ message }) => (
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

LoadingOverlay.propTypes = {
  message: PropTypes.string
};

LoadingOverlay.defaultProps = {
  message: 'Carregando...'
};

// Valores padrão para o contexto para garantir consistência
const DEFAULT_CONTEXT = {
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {}
};

// Criação do contexto com valores padrão
const LoadingContext = createContext(DEFAULT_CONTEXT);

/**
 * Provider que gerencia o estado de carregamento da aplicação
 */
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Exibe o indicador de carregamento com uma mensagem opcional
  const showLoading = useCallback((msg = 'Carregando...') => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  // Esconde o indicador de carregamento
  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage('');
  }, []);

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

LoadingProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook personalizado para acessar o contexto de carregamento
 * @returns {Object} O contexto de carregamento
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  
  return context;
};
