import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Button,
    Typography,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    styled,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor: status === 'Pendente' ? '#ff9800' : '#4caf50',
  color: 'white',
  fontWeight: 'bold',
}));

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

const ListaReservas = ({ userType }) => {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [actionType, setActionType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Função para depuração
    const logError = (error, message) => {
        console.error(message, error);
        console.log('Detalhes do erro:');
        console.log('Status:', error.response?.status);
        console.log('Mensagem:', error.response?.data?.message || error.message);
        console.log('Dados:', error.response?.data);
        
        setError(`${message}: ${error.response?.data?.message || error.message}`);
    };

    useEffect(() => {
        carregarReservas();
    }, [userType]);

    const carregarReservas = async () => {
        setLoading(true);
        setError(null);
        try {
            // Se for professor, carrega apenas suas reservas
            const endpoint = userType === 'professor' ? '/reservas/professor' : '/reservas';
            console.log("Carregando reservas do endpoint:", endpoint);
            const response = await api.get(endpoint);
            setReservas(response.data);
        } catch (error) {
            logError(error, 'Erro ao carregar reservas');
        } finally {
            setLoading(false);
        }
    };

    const confirmarUtilizacao = async (id) => {
        setLoading(true);
        try {
            await api.patch(`/reservas/${id}/confirmar`, {
                utilizado: true
            });
            carregarReservas();
            handleCloseConfirmDialog();
        } catch (error) {
            logError(error, 'Erro ao confirmar utilização');
        } finally {
            setLoading(false);
        }
    };

    const cancelarReserva = async (id) => {
        setLoading(true);
        try {
            await api.delete(`/reservas/${id}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            carregarReservas();
            handleCloseConfirmDialog();
        } catch (error) {
            logError(error, 'Erro ao cancelar reserva');
        } finally {
            setLoading(false);
        }
    };

    const editarReserva = (id) => {
        navigate(`/reservas/editar/${id}`);
    };

    const handleNovaReserva = () => {
        navigate('/reservas/nova');
    };

    const handleOpenConfirmDialog = (reserva, action) => {
        setSelectedReserva(reserva);
        setActionType(action);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setSelectedReserva(null);
    };

    const handleConfirmAction = () => {
        if (!selectedReserva) return;
        
        if (actionType === 'cancelar') {
            cancelarReserva(selectedReserva.id);
        } else if (actionType === 'confirmar') {
            confirmarUtilizacao(selectedReserva.id);
        }
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarHora = (hora) => {
        return hora.substring(0, 5); // Formato HH:mm
    };

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Gerenciar Reservas</PageTitle>
                <NewButton onClick={handleNovaReserva}>
                    Nova Reserva
                </NewButton>
            </PageHeader>
            
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            
            <StyledTableContainer component={Paper}>
                <Table>
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
                        {reservas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    {loading ? 'Carregando...' : 'Nenhuma reserva encontrada'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservas.map((reserva) => (
                                <TableRow key={reserva.id}>
                                    <TableCell>{reserva.espacoAcademico.nome}</TableCell>
                                    <TableCell>{reserva.professor.nome}</TableCell>
                                    <TableCell>{formatarData(reserva.data)}</TableCell>
                                    <TableCell>
                                        {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip 
                                            label={reserva.utilizado ? "Utilizado" : "Pendente"}
                                            status={reserva.utilizado ? "Utilizado" : "Pendente"}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {!reserva.utilizado && (
                                            <>
                                                <ActionButton 
                                                    color="primary"
                                                    onClick={() => handleOpenConfirmDialog(reserva, 'confirmar')}
                                                    disabled={loading}
                                                >
                                                    Confirmar Utilização
                                                </ActionButton>
                                                <ActionButton 
                                                    color="secondary"
                                                    onClick={() => editarReserva(reserva.id)}
                                                    disabled={loading}
                                                >
                                                    Editar
                                                </ActionButton>
                                                <ActionButton 
                                                    color="error"
                                                    onClick={() => handleOpenConfirmDialog(reserva, 'cancelar')}
                                                    disabled={loading}
                                                >
                                                    Excluir
                                                </ActionButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            {/* Dialog de confirmação */}
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDialog}
            >
                <DialogTitleStyled>
                    {actionType === 'cancelar' ? 'Cancelar Reserva' : 'Confirmar Utilização'}
                </DialogTitleStyled>
                <DialogContent>
                    <Typography>
                        {actionType === 'cancelar' 
                            ? 'Tem certeza que deseja cancelar esta reserva?' 
                            : 'Tem certeza que deseja confirmar a utilização deste espaço?'}
                    </Typography>
                    {selectedReserva && (
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Espaço:</strong> {selectedReserva.espacoAcademico.nome}</Typography>
                            <Typography><strong>Data:</strong> {formatarData(selectedReserva.data)}</Typography>
                            <Typography>
                                <strong>Horário:</strong> {formatarHora(selectedReserva.horaInicial)} - {formatarHora(selectedReserva.horaFinal)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCloseConfirmDialog}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmAction}
                        color={actionType === 'cancelar' ? 'error' : 'primary'}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </ConfirmDialog>
        </PageContainer>
    );
};

export default ListaReservas;