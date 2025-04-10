import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StatusChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'PENDENTE':
      case 'AGENDADO':
        return { bg: '#FFA726', color: '#fff' };
      case 'EM_USO':
        return { bg: '#42A5F5', color: '#fff' };
      case 'AGUARDANDO_CONFIRMACAO':
        return { bg: '#9EA5B5', color: '#fff' };
      case 'UTILIZADO':
        return { bg: '#66BB6A', color: '#fff' };
      case 'CANCELADO':
        return { bg: '#f44336', color: '#fff' };
      default:
        return { bg: '#9E9E9E', color: '#fff' };
    }
  };

  const colors = getStatusColor();

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

// Traduzir status para exibição
export const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDENTE': 
    case 'AGENDADO': return 'Agendado';
    case 'EM_USO': return 'Em uso';
    case 'AGUARDANDO_CONFIRMACAO': return 'Aguardando confirmação';
    case 'UTILIZADO': return 'Utilizado';
    case 'CANCELADO': return 'Cancelado';
    default: return status;
  }
};

export default StatusChip;