import { Typography, TableContainer, TableHead, TableCell, Table, Chip, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageTitle = styled(Typography)({
  color: '#0F1140',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
});

export const StyledTableContainer = styled(TableContainer)({
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  overflow: 'auto',
  maxWidth: '100%',
});

export const TableHeader = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

export const TableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  color: '#0F1140',
});

export const StyledTable = styled(Table)({
  minWidth: 650,
  tableLayout: 'fixed',
});

export const TableCellStyled = styled(TableCell)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const StyledButton = styled(Button)({
  marginRight: '16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: 'rgba(15, 17, 64, 0.1)',
  },
});

export const ProfessorInfoBox = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '24px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
});


export const StatusChip = styled(Chip)(({ status }) => {
  
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
        return { bg: '#9E9E9E', color: '#fff' };
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