import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const Feedback = ({ message, severity, open, onClose, autoHideDuration = 6000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export const useFeedback = () => {
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showFeedback = (message, severity = 'info') => {
    setFeedback({
      open: true,
      message,
      severity,
    });
  };

  const hideFeedback = () => {
    setFeedback({
      ...feedback,
      open: false,
    });
  };

  return {
    feedback,
    showFeedback,
    hideFeedback,
    FeedbackComponent: (
      <Feedback
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={hideFeedback}
      />
    ),
  };
};

export default Feedback;