import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Hook personalizado para gerenciar feedback na interface através de alertas
 * @returns {Object} Objeto contendo o estado do feedback, funções para controle e componente de renderização
 */
const useFeedback = () => {
  const [feedback, setFeedback] = React.useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000,
  });

  /**
   * Exibe uma mensagem de feedback
   * @param {string} message - Mensagem a ser exibida
   * @param {('error'|'warning'|'info'|'success')} severity - Tipo de alerta
   * @param {number} autoHideDuration - Tempo em ms para ocultar automaticamente
   */
  const showFeedback = (message, severity = 'info', autoHideDuration = 6000) => {
    setFeedback({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  };

  /**
   * Oculta a mensagem de feedback atual
   */
  const hideFeedback = () => {
    setFeedback(prev => ({
      ...prev,
      open: false,
    }));
  };

  /**
   * Componente de renderização do feedback
   */
  const FeedbackComponent = () => (
    <Snackbar
      open={feedback.open}
      autoHideDuration={feedback.autoHideDuration}
      onClose={hideFeedback}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={hideFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
        {feedback.message}
      </Alert>
    </Snackbar>
  );

  return {
    feedback,
    showFeedback,
    hideFeedback,
    FeedbackComponent,
  };
};

export default useFeedback;