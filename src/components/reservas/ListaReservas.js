import React, { useState, useEffect, useCallback } from 'react';
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

const StatusChip = styled(Chip)(({ status, sx }) => ({
    backgroundColor: 
        status === 'Pendente' ? '#ff9800' : 
        status === 'Em Uso' ? '#2196f3' :
        status === 'Cancelado' ? '#f44336' : '#4caf50',
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
    const { showFeedback, FeedbackComponent } = useFeedback();

    // Mova a função carregarReservas para dentro do useCallback
    const carregarReservas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = userType === 'professor' ? '/reservas/professor' : '/reservas';
            console.log("Carregando reservas do endpoint:", endpoint);
            const response = await api.get(endpoint);
            setReservas(response.data);
        } catch (error) {
            logError(error, 'Erro ao carregar reservas');
        } finally {
            setLoading(false);
        }
    }, [userType]);

    useEffect(() => {
        carregarReservas();
        const interval = setInterval(carregarReservas, 60000);
        return () => clearInterval(interval);
    }, [carregarReservas]);

    // Função para depuração
    const logError = (error, message) => {
        console.error(message, error);
        console.log('Detalhes do erro:');
        console.log('Status:', error.response?.status);
        console.log('Mensagem:', error.response?.data?.message || error.message);
        console.log('Dados:', error.response?.data);

        setError(`${message}: ${error.response?.data?.message || error.message}`);
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

    const handleConfirmAction = async () => {
        if (!selectedReserva) return;
    
        try {
            if (actionType === 'cancelar') {
                await api.delete(`/reservas/${selectedReserva.id}`);
                setReservas(reservas.filter(r => r.id !== selectedReserva.id));
                showFeedback('Reserva cancelada com sucesso', 'success');
            } else if (actionType === 'confirmar') {
                await api.patch(`/reservas/${selectedReserva.id}/confirmar`);
                await carregarReservas();
                showFeedback('Utilização confirmada com sucesso', 'success');
            }
        } catch (error) {
            console.error('Erro ao processar ação:', error);
            
            // Tratamento específico para o erro de antecedência mínima
            if (error.response?.status === 400 && 
                error.response?.data?.message?.includes('antecedência')) {
                showFeedback(
                    'Não é possível cancelar reservas com menos de 30 minutos de antecedência',
                    'error'
                );
            } else {
                showFeedback(
                    error.response?.data?.message || 'Erro ao processar ação',
                    'error'
                );
            }
        } finally {
            setConfirmDialogOpen(false);
            setSelectedReserva(null);
            carregarReservas(); // Recarregar a lista para garantir que está atualizada
        }
    };

    // Adicione esta função para verificar o status atual da reserva
    const getReservaStatus = (reserva) => {
        if (reserva.utilizado) return "Utilizado";
        if (reserva.status === "CANCELADO") return "Cancelado";
        
        const agora = new Date();
        const dataReserva = new Date(reserva.data);
        
        // Ajustar para o fuso horário local
        dataReserva.setMinutes(dataReserva.getMinutes() + dataReserva.getTimezoneOffset());
        
        const horaInicial = reserva.horaInicial.split(':');
        const horaFinal = reserva.horaFinal.split(':');
        
        const inicioReserva = new Date(dataReserva);
        inicioReserva.setHours(parseInt(horaInicial[0]), parseInt(horaInicial[1]), 0);
        
        const fimReserva = new Date(dataReserva);
        fimReserva.setHours(parseInt(horaFinal[0]), parseInt(horaFinal[1]), 0);
        
        // Verificar se a reserva está acontecendo agora
        if (agora >= inicioReserva && agora <= fimReserva) {
            return "Em Uso";
        }
        
        return "Pendente";
    };

    // Adicione esta função para verificar se a reserva está em uso
    const isReservaEmUso = (reserva) => {
        return getReservaStatus(reserva) === "Em Uso";
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';

        const data = new Date(dataString);
        data.setMinutes(data.getMinutes() + data.getTimezoneOffset());

        return data.toLocaleDateString('pt-BR');
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
                                            label={getReservaStatus(reserva)}
                                            status={getReservaStatus(reserva)}
                                            sx={{
                                                backgroundColor: 
                                                    getReservaStatus(reserva) === "Utilizado" ? "#4caf50" :
                                                    getReservaStatus(reserva) === "Em Uso" ? "#2196f3" :
                                                    getReservaStatus(reserva) === "Cancelado" ? "#f44336" : 
                                                    "#ff9800"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {!reserva.utilizado && getReservaStatus(reserva) !== "Cancelado" && (
                                            <>
                                                <ActionButton
                                                    color="primary"
                                                    onClick={() => handleOpenConfirmDialog(reserva, 'confirmar')}
                                                    disabled={loading}
                                                >
                                                    Confirmar Utilização
                                                </ActionButton>
                                                
                                                {!isReservaEmUso(reserva) && (
                                                    <>
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
            {FeedbackComponent}
        </PageContainer>
    );
};

export default ListaReservas;