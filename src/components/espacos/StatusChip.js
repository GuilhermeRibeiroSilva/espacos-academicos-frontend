import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Componente estilizado para status
const StyledChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'EM_USO':
        return { bg: '#f44336', color: '#fff' };
      case 'DISPONÍVEL':
        return { bg: '#4caf50', color: '#fff' };
      case 'INDISPONÍVEL':
        return { bg: '#9e9e9e', color: '#fff' };
      default:
        return { bg: '#9e9e9e', color: '#fff' };
    }
  };

  const colors = getStatusColor();

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

const StatusChip = ({ status }) => {
  return <StyledChip label={status} status={status} />;
};

export default StatusChip;