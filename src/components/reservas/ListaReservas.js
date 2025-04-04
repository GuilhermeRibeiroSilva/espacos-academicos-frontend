import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TableContainer, Table, TableHead, TableBody, 
  TableRow, TableCell, Paper, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/auth';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componentes estilizados
const PageContainer = styled(Box)({
  padding: '20px',
});

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const PageTitle = styled(Typography)({
  color: '#0F1140',
  fontSize: '24px',
  fontWeight: 'bold',
});

const NewButton = styled(Button)({
  backgroundColor: '#0F1140',
  color: 'white',
  borderRadius: '8px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#1a1b4b',
  },
});

const StyledTableContainer = styled(TableContainer)({
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  overflow: 'hidden',
});

const TableHeader = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

const TableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  color: '#0F1140',
});

const ActionButton = styled(Button)(({ color }) => ({
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

const StatusChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'PENDENTE':
        return { bg: '#FFA726', color: '#fff' };
      case 'EM_USO':
        return { bg: '#42A5F5', color: '#fff' };
      case 'AGUARDANDO_CONFIRMACAO':
        return { bg: '#EC407A', color: '#fff' };
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

const ConfirmDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '10px',
    padding: '10px',
  },
});

const DialogTitleStyled = styled(DialogTitle)({
  color: '#0F1140',
  fontWeight: 'bold',
});

const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  margin: '20px 0',
});

const EmptyStateText = styled(Typography)({
  color: '#666',
  marginTop: '16px',
  textAlign: 'center',
});

const ListaReservas = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'info' });
  const { auth } = useAuth();

  // Ref para o intervalo de atualização
  const intervalRef = useRef(null);

  // Função para mostrar feedback
  const showFeedback = (message, type = 'info') => {
    setFeedback({ show: true, message, type });
    setTimeout(() => {
      setFeedback({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  // Função para carregar reservas
  const carregarReservas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reservas');
      setReservas(response.data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      setError('Não foi possível carregar as reservas. Tente novamente mais tarde.');
      showFeedback('Erro ao carregar reservas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar reservas ao montar o componente e configurar intervalo
  useEffect(() => {
    carregarReservas();

    // Atualizar a cada 2 minutos
    intervalRef.current = setInterval(() => {
      carregarReservas();
    }, 2 * 60 * 1000);

    // Limpar intervalo ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carregarReservas]);

  // Função para criar nova reserva
  const handleNovaReserva = () => {
    navigate('/reservas/nova');
  };

  // Função para navegar para a página de edição (apenas admin)
  const editarReserva = (id) => {
    navigate(`/reservas/editar/${id}`);
  };

  // Abrir diálogo de confirmação
  const handleOpenConfirmDialog = (reserva, action) => {
    setSelectedReserva(reserva);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  // Fechar diálogo de confirmação
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedReserva(null);
    setActionType('');
  };

  // Executar ação confirmada
  const handleConfirmAction = async () => {
    if (!selectedReserva) return;

    try {
      setLoadingAction(true);

      if (actionType === 'cancelar') {
        await api.delete(`/api/reservas/${selectedReserva.id}`);
        showFeedback('Reserva cancelada com sucesso', 'success');
      } else if (actionType === 'confirmar') {
        await api.post(`/api/reservas/${selectedReserva.id}/confirmar`);
        showFeedback('Utilização confirmada com sucesso', 'success');
      }

      // Recarregar dados
      carregarReservas();
    } catch (error) {
      console.error(`Erro ao ${actionType} reserva:`, error);
      showFeedback(`Erro ao ${actionType} reserva. Tente novamente.`, 'error');
    } finally {
      setLoadingAction(false);
      handleCloseConfirmDialog();
    }
  };

  // Traduzir status para exibição
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_USO': return 'Em uso';
      case 'AGUARDANDO_CONFIRMACAO': return 'Aguardando confirmação';
      case 'UTILIZADO': return 'Utilizado';
      default: return status;
    }
  };

  // Renderização dos botões de ação conforme status e permissões
  const renderBotoesAcao = (reserva) => {
    const { status } = reserva;

    // Se o status for UTILIZADO, não mostrar botões
    if (status === 'UTILIZADO') {
      return null;
    }

    // Status "Em Uso" ou "Aguardando Confirmação" - apenas botão de confirmar utilização
    if (status === 'EM_USO' || status === 'AGUARDANDO_CONFIRMACAO') {
      return (
        <ActionButton
          color="success"
          onClick={() => handleOpenConfirmDialog(reserva, 'confirmar')}
          disabled={loadingAction}
        >
          Confirmar Utilização
        </ActionButton>
      );
    }

    // Status "Pendente" - botões de Alterar e Cancelar (apenas para admin)
    if (status === 'PENDENTE' && auth.isAdmin) {
      return (
        <>
          <ActionButton
            color="secondary"
            onClick={() => editarReserva(reserva.id)}
            disabled={loadingAction}
          >
            Alterar
          </ActionButton>
          
          <ActionButton
            color="error"
            onClick={() => handleOpenConfirmDialog(reserva, 'cancelar')}
            disabled={loadingAction}
          >
            Cancelar
          </ActionButton>
        </>
      );
    }

    return null;
  };

  // Formatar data para exibição
  const formatarData = (dataString) => {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Formatar hora para exibição
  const formatarHora = (horaString) => {
    if (!horaString) return '';
    return horaString.substring(0, 5); // Formato HH:MM
  };

  // Componente de feedback
  const FeedbackAlert = ({ message, type }) => (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: type === 'error' ? '#f44336' : 
                        type === 'success' ? '#4caf50' : '#2196f3',
        color: 'white',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
      }}
    >
      <Typography>{message}</Typography>
    </Box>
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle variant="h4">Gerenciar Reservas</PageTitle>
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={carregarReservas} 
            sx={{ mr: 2 }}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
          <NewButton 
            variant="contained" 
            onClick={handleNovaReserva}
            disabled={loading}
          >
            Nova Reserva
          </NewButton>
        </Box>
      </PageHeader>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box
          sx={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            p: 2,
            borderRadius: 1,
            my: 2,
          }}
        >
          <Typography>{error}</Typography>
        </Box>
      ) : reservas.length === 0 ? (
        <EmptyState>
          <EmptyStateText variant="h6">
            Nenhuma reserva encontrada
          </EmptyStateText>
          <EmptyStateText>
            Clique em "Nova Reserva" para criar uma reserva de espaço acadêmico
          </EmptyStateText>
        </EmptyState>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Espaço</TableHeaderCell>
                <TableHeaderCell>Professor</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Horário</TableHeaderCell>
                <TableHeaderCell>Finalidade</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>{reserva.espacoAcademico.nome}</TableCell>
                  <TableCell>{reserva.professor.nome}</TableCell>
                  <TableCell>{formatarData(reserva.data)}</TableCell>
                  <TableCell>
                    {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                  </TableCell>
                  <TableCell>
                    {reserva.finalidade ? 
                      (reserva.finalidade.length > 30 ? 
                        `${reserva.finalidade.substring(0, 30)}...` : 
                        reserva.finalidade) : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    <StatusChip 
                      label={getStatusLabel(reserva.status)} 
                      status={reserva.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      {renderBotoesAcao(reserva)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      {/* Diálogo de confirmação */}
      <ConfirmDialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitleStyled>
          {actionType === 'cancelar' ? 'Cancelar Reserva' : 'Confirmar Utilização'}
        </DialogTitleStyled>
        <DialogContent>
          <Typography>
            {actionType === 'cancelar' 
              ? 'Tem certeza que deseja cancelar esta reserva?' 
              : 'Confirmar a utilização deste espaço acadêmico?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={loadingAction}>
            Não
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
            disabled={loadingAction}
          >
            {loadingAction ? <CircularProgress size={20} /> : 'Sim'}
          </Button>
        </DialogActions>
      </ConfirmDialog>

      {/* Componente de feedback */}
      {feedback.show && (
        <FeedbackAlert message={feedback.message} type={feedback.type} />
      )}
    </PageContainer>
  );
};

export default ListaReservas;