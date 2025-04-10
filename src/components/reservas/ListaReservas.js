import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TableContainer, Table, TableHead, TableBody, 
  TableRow, TableCell, Paper, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Importando componentes estilizados de um arquivo separado
import {
  PageContainer, PageHeader, PageTitle, NewButton, StyledTableContainer,
  TableHeader, TableHeaderCell, ActionButton, StatusChip, ConfirmDialog,
  DialogTitleStyled, EmptyState, EmptyStateText, StyledTable, TableCellStyled
} from './styles/ListaReservasStyles';

// Utilitários separados
import { formatarData, formatarHora, formatarNomeProfessor, getStatusLabel } from '../../utils/formatters';

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

const ListaReservas = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const intervalRef = useRef(null);
  
  const [reservas, setReservas] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'info' });

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
      const response = await api.get('/reservas');
      
      // Ordenar as reservas
      const reservasOrdenadas = ordenarReservas(response.data);
      
      setReservas(reservasOrdenadas);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      setError('Não foi possível carregar as reservas. Tente novamente mais tarde.');
      showFeedback('Erro ao carregar reservas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de ordenação de reservas
  const ordenarReservas = (listaReservas) => {
    return listaReservas.sort((a, b) => {
      // Ordenação por data, hora e status
      const dataA = new Date(a.data);
      const dataB = new Date(b.data);
      
      if (dataA.getTime() !== dataB.getTime()) {
        return dataA - dataB;
      }
      
      if (a.horaInicial !== b.horaInicial) {
        return a.horaInicial.localeCompare(b.horaInicial);
      }
      
      const ordemStatus = {
        'EM_USO': 1,
        'AGUARDANDO_CONFIRMACAO': 2,
        'PENDENTE': 3,
        'UTILIZADO': 4,
        'CANCELADO': 5
      };
      
      return ordemStatus[a.status] - ordemStatus[b.status];
    });
  };

  // Função para atualizar o status das reservas em tempo real
  const atualizarStatusReservasEmTempoReal = useCallback(() => {
    const agora = new Date();
    const dataHoje = agora.toISOString().split('T')[0];
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:00`;
    
    setReservas(prevReservas => 
      prevReservas.map(reserva => {
        if (reserva.data !== dataHoje) return reserva;
        
        // Clone para não mutar o estado diretamente
        const novaReserva = {...reserva};
        
        // Converter PENDENTE para AGENDADO
        if (novaReserva.status === 'PENDENTE') {
          novaReserva.status = 'AGENDADO';
        }
        
        // Para reservas AGENDADO/PENDENTE: se hora inicial <= hora atual < hora final => EM_USO
        if ((reserva.status === 'PENDENTE' || reserva.status === 'AGENDADO') && 
            reserva.horaInicial <= horaAtual && 
            reserva.horaFinal > horaAtual) {
          novaReserva.status = 'EM_USO';
        }
        // Para reservas EM_USO: se hora atual >= hora final => AGUARDANDO_CONFIRMACAO
        else if (reserva.status === 'EM_USO' && 
                 reserva.horaFinal <= horaAtual) {
          novaReserva.status = 'AGUARDANDO_CONFIRMACAO';
        }
        
        return novaReserva;
      })
    );
  }, []);

  // Carregar reservas ao montar o componente e configurar intervalos
  useEffect(() => {
    carregarReservas();

    // Atualizar a cada 2 minutos
    intervalRef.current = setInterval(carregarReservas, 2 * 60 * 1000);
    
    // Atualizar status em tempo real a cada segundo
    const statusInterval = setInterval(atualizarStatusReservasEmTempoReal, 1000);

    // Limpar intervalos ao desmontar
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(statusInterval);
    };
  }, [carregarReservas, atualizarStatusReservasEmTempoReal]);

  // Manipuladores de eventos
  const handleNovaReserva = () => navigate('/reservas/nova');
  
  const editarReserva = (id) => navigate(`/reservas/editar/${id}`);

  const handleOpenConfirmDialog = (reserva, action) => {
    setSelectedReserva(reserva);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

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
        await api.delete(`/reservas/${selectedReserva.id}`);
        showFeedback('Reserva cancelada com sucesso', 'success');
      } else if (actionType === 'confirmar') {
        await api.post(`/reservas/${selectedReserva.id}/confirmar`);
        showFeedback('Utilização confirmada com sucesso', 'success');
      }

      carregarReservas();
    } catch (error) {
      console.error(`Erro ao ${actionType} reserva:`, error);
      showFeedback(`Erro ao ${actionType} reserva. Tente novamente.`, 'error');
    } finally {
      setLoadingAction(false);
      handleCloseConfirmDialog();
    }
  };

  // Renderização dos botões de ação conforme status e permissões
  const renderBotoesAcao = (reserva) => {
    const { status } = reserva;

    if (status === 'UTILIZADO') return null;

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

    if ((status === 'PENDENTE' || status === 'AGENDADO') && auth.isAdmin) {
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

  // Renderização da interface
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
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
      );
    }

    if (reservas.length === 0) {
      return (
        <EmptyState>
          <EmptyStateText variant="h6">
            Nenhuma reserva encontrada
          </EmptyStateText>
          <EmptyStateText>
            Clique em "Nova Reserva" para criar uma reserva de espaço acadêmico
          </EmptyStateText>
        </EmptyState>
      );
    }

    return (
      <StyledTableContainer component={Paper}>
        <StyledTable>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Espaço</TableHeaderCell>
              <TableHeaderCell>Professor</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell>Horário</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Ações</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCellStyled>{reserva.espacoAcademico.sigla} - {reserva.espacoAcademico.nome}</TableCellStyled>
                <TableCellStyled>{formatarNomeProfessor(reserva.professor.nome)}</TableCellStyled>
                <TableCellStyled>{formatarData(reserva.data)}</TableCellStyled>
                <TableCellStyled>
                  {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                </TableCellStyled>
                <TableCellStyled>
                  <StatusChip 
                    label={getStatusLabel(reserva.status)} 
                    status={reserva.status}
                  />
                </TableCellStyled>
                <TableCellStyled>
                  <Box display="flex" flexWrap="nowrap">
                    {renderBotoesAcao(reserva)}
                  </Box>
                </TableCellStyled>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    );
  };

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

      {renderContent()}

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