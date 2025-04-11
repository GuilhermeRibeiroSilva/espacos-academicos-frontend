import React, { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * @returns {Object}
 */
export const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    type: 'info', 
  });

  /**
   * @param {string} message 
   * @param {('error'|'warning'|'info'|'success')} severity 
   */
  const showFeedback = useCallback((message, type = 'info') => {
    setFeedback({
      show: true,
      message,
      type,
    });
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback(prev => ({
      ...prev,
      show: false,
    }));
  }, []);

  const FeedbackComponent = () => (
    <Snackbar
      open={feedback.show}
      autoHideDuration={6000}
      onClose={hideFeedback}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hideFeedback} severity={feedback.type} sx={{ width: '100%' }}>
        {feedback.message}
      </Alert>
    </Snackbar>
  );

  return {
    showFeedback,
    hideFeedback,
    FeedbackComponent,
  };
};


const Feedback = useFeedback;
export default Feedback;