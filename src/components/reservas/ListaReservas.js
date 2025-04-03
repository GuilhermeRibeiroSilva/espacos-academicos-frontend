import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';
import { useAuth } from '../../contexts/AuthContext';

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

const StatusChip = styled(Chip)(({ sx }) => ({
    color: 'white',
    fontWeight: 'bold',
    ...sx
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
    const { showLoading, hideLoading } = useLoading();
    const { showFeedback, FeedbackComponent } = useFeedback();
    const { auth } = useAuth();

    // Ref para controlar se já carregamos os dados
    const initialLoadComplete = useRef(false);
    // Ref para armazenar o intervalo
    const intervalRef = useRef(null);

    // Atualizado para usar useRef e evitar loops infinitos
    const carregarReservas = useCallback(async () => {
        if (loading) return;

        setLoading(true);
        showLoading('Carregando reservas...');

        try {
            const endpoint = userType === 'professor' ? '/reservas/professor' : '/reservas';

            const response = await api.get(endpoint);

            const reservasOrdenadas = response.data
                .filter(r => r.status !== 'CANCELADO')
                .sort((a, b) => {
                    const dataA = new Date(a.data);
                    const dataB = new Date(b.data);
                    if (dataA.getTime() !== dataB.getTime()) {
                        return dataA - dataB;
                    }
                    return a.horaInicial.localeCompare(b.horaInicial);
                });

            setReservas(reservasOrdenadas);
        } catch (error) {
            console.error('Erro ao carregar reservas:', error);
            setError('Erro ao carregar lista de reservas');
        } finally {
            setLoading(false);
            hideLoading();
            initialLoadComplete.current = true;
        }
    }, [userType, showLoading, hideLoading, loading]);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (!initialLoadComplete.current) {
            carregarReservas();
        }

        intervalRef.current = setInterval(() => {
            carregarReservas();
        }, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [carregarReservas]);

    const handleNovaReserva = () => {
        navigate('/reservas/nova');
    };

    const editarReserva = async (id) => {
        try {
            setLoading(true);
            
            // Verificar se a reserva pode ser alterada
            const response = await api.get(`/reservas/${id}/pode-alterar`);
            
            if (response.data === true) {
                // Navegar para a página de edição
                navigate(`/reservas/editar/${id}`);
            } else {
                showFeedback('Esta reserva não pode mais ser alterada', 'warning');
            }
        } catch (error) {
            console.error('Erro ao verificar permissão de alteração:', error);
            showFeedback('Erro ao verificar permissões', 'error');
        } finally {
            setLoading(false);
        }
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

    const handleConfirmAction = async () => {
        if (!selectedReserva) return;

        showLoading(actionType === 'cancelar' ? 'Cancelando reserva...' : 'Confirmando utilização...');

        try {
            if (actionType === 'cancelar') {
                await api.delete(`/reservas/${selectedReserva.id}`);
                setReservas(prev => prev.filter(r => r.id !== selectedReserva.id));
                showFeedback('Reserva cancelada com sucesso', 'success');
            } else if (actionType === 'confirmar') {
                await api.patch(`/reservas/${selectedReserva.id}/confirmar`);
                setReservas(prev => prev.map(r => {
                    if (r.id === selectedReserva.id) {
                        return { ...r, status: 'UTILIZADO', utilizado: true };
                    }
                    return r;
                }));
                showFeedback('Utilização confirmada com sucesso', 'success');
            }
        } catch (error) {
            console.error(`Erro ao ${actionType} reserva:`, error);

            if (error.response?.status === 400) {
                showFeedback(error.response.data.message || `Não foi possível ${actionType} a reserva`, 'error');
            } else {
                showFeedback(`Erro ao ${actionType} reserva`, 'error');
            }
        } finally {
            hideLoading();
            handleCloseConfirmDialog();
        }
    };

    const getReservaStatus = (reserva) => {
        switch (reserva.status) {
            case 'PENDENTE':
                return "Pendente";
            case 'EM_USO':
                return "Em Uso";
            case 'AGUARDANDO_CONFIRMACAO':
                return "Aguardando Confirmação";
            case 'UTILIZADO':
                return "Utilizado";
            case 'CANCELADO':
                return "";
            default:
                return "Pendente";
        }
    };

    const podeAlterar = async (reserva) => {
        if (!auth.isAdmin) return false;

        try {
            const response = await api.get(`/reservas/${reserva.id}/pode-alterar`);
            return response.data === true;
        } catch (error) {
            console.error('Erro ao verificar permissão de alteração:', error);
            return false;
        }
    };

    const podeCancelar = async (reserva) => {
        try {
            const response = await api.get(`/reservas/${reserva.id}/pode-cancelar`);
            return response.data === true;
        } catch (error) {
            console.error('Erro ao verificar permissão de cancelamento:', error);
            return false;
        }
    };

    const podeConfirmarUtilizacao = (reserva) => {
        return reserva.status === 'EM_USO' || reserva.status === 'AGUARDANDO_CONFIRMACAO';
    };

    const renderBotoesAcao = (reserva) => {
        const statusVisual = getReservaStatus(reserva);
        
        // Status "Utilizado" - sem ações
        if (statusVisual === "Utilizado") {
            return null;
        }
        
        // Status "Em Uso" ou "Aguardando Confirmação" - apenas botão de confirmar utilização
        if (statusVisual === "Em Uso" || statusVisual === "Aguardando Confirmação") {
            return (
                <ActionButton
                    color="primary"
                    onClick={() => handleOpenConfirmDialog(reserva, 'confirmar')}
                    disabled={loading}
                >
                    Confirmar Utilização
                </ActionButton>
            );
        }
        
        // Status "Pendente" - botões de Alterar (admin) e Cancelar
        if (statusVisual === "Pendente") {
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {auth.isAdmin && (
                        <ActionButton
                            color="secondary"
                            onClick={() => editarReserva(reserva.id)}
                            disabled={loading}
                        >
                            Alterar
                        </ActionButton>
                    )}
                    
                    <ActionButton
                        color="error"
                        onClick={() => handleOpenConfirmDialog(reserva, 'cancelar')}
                        disabled={loading}
                    >
                        Cancelar
                    </ActionButton>
                </Box>
            );
        }
        
        return null;
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarHora = (hora) => {
        return hora ? hora.substring(0, 5) : '';
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
                            reservas.map((reserva) => {
                                if (reserva.status === 'CANCELADO') return null;

                                const statusVisual = getReservaStatus(reserva);

                                return (
                                    <TableRow key={reserva.id}>
                                        <TableCell>{reserva.espacoAcademico.nome}</TableCell>
                                        <TableCell>{reserva.professor.nome}</TableCell>
                                        <TableCell>{formatarData(reserva.data)}</TableCell>
                                        <TableCell>
                                            {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                label={statusVisual}
                                                sx={{
                                                    backgroundColor:
                                                        statusVisual === "Utilizado" ? "#4caf50" :
                                                        statusVisual === "Em Uso" ? "#2196f3" :
                                                        statusVisual === "Aguardando Confirmação" ? "#ff9800" :
                                                        "#9c27b0"
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {renderBotoesAcao(reserva)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

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
                            ? 'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.'
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
                        Confirmar
                    </Button>
                </DialogActions>
            </ConfirmDialog>
            <FeedbackComponent />
        </PageContainer>
    );
};

export default ListaReservas;