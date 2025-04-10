import { styled } from '@mui/material/styles';
import { 
  Box, Typography, Button, TableContainer, Table, TableHead,
  TableCell, Paper, Chip, Dialog, DialogTitle
} from '@mui/material';

// Componentes estilizados
export const PageContainer = styled(Box)({
  padding: '20px',
});

export const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

export const PageTitle = styled(Typography)({
  color: '#0F1140',
  fontSize: '24px',
  fontWeight: 'bold',
});

export const NewButton = styled(Button)({
  backgroundColor: '#0F1140',
  color: 'white',
  borderRadius: '8px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#1a1b4b',
  },
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

export const ActionButton = styled(Button)(({ color }) => ({
  margin: '0 5px',
  borderRadius: '4px',
  padding: '6px 12px',
  textTransform: 'none',
  backgroundColor: color === 'primary' ? '#0F1140' :
    color === 'error' ? '#f44336' :
      color === 'success' ? '#4caf50' : '#2196f3',
  color: 'white',
  '&:hover': {
    backgroundColor: color === 'primary' ? '#1a1b4b' :
      color === 'error' ? '#d32f2f' :
        color === 'success' ? '#388e3c' : '#1976d2',
  },
}));

export const StatusChip = styled(Chip)(({ status }) => {
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

export const ConfirmDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '10px',
    padding: '10px',
  },
});

export const DialogTitleStyled = styled(DialogTitle)({
  color: '#0F1140',
  fontWeight: 'bold',
});

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  margin: '20px 0',
});

export const EmptyStateText = styled(Typography)({
  color: '#666',
  marginTop: '16px',
  textAlign: 'center',
});

export const StyledTable = styled(Table)({
  minWidth: 900,
  tableLayout: 'fixed',
});

export const TableCellStyled = styled(TableCell)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});