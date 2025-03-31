import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export const useFeedback = () => {
  const [feedback, setFeedback] = React.useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000,
  });

  const showFeedback = (message, severity = 'info', autoHideDuration = 6000) => {
    setFeedback({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  };

  const hideFeedback = () => {
    setFeedback(prev => ({
      ...prev,
      open: false,
    }));
  };

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