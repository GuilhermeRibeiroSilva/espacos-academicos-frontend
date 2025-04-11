import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

// Estilos comuns extraídos para constantes
const BUTTON_PRIMARY_STYLE = {
    bgcolor: '#0F1140',
    '&:hover': { bgcolor: '#1a1b4b' }
};

const ListaProfessores = () => {
    const [professores, setProfessores] = useState([]);
    const [professorParaExcluir, setProfessorParaExcluir] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();
    const { showFeedback, FeedbackComponent } = useFeedback();

    useEffect(() => {
        carregarProfessores();
    }, []);

    const carregarProfessores = async () => {
        showLoading('Carregando professores...');
        try {
            const response = await api.get('/professores');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            showFeedback('Erro ao carregar professores', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleNovoProfessor = () => navigate('/professores/novo');
    const handleEditar = (id) => navigate(`/professores/editar/${id}`);
    const handleVerReservas = (id) => navigate(`/professores/${id}/reservas`);

    const handleExcluirClick = (professor) => {
        setProfessorParaExcluir(professor);
        setConfirmDialogOpen(true);
    };

    const handleCancelExcluir = () => {
        setConfirmDialogOpen(false);
        setProfessorParaExcluir(null);
    };

    const handleConfirmExcluir = async () => {
        if (!professorParaExcluir) return;

        showLoading('Excluindo professor...');
        try {
            await api.delete(`/professores/${professorParaExcluir.id}?force=true`);
            showFeedback('Professor excluído com sucesso', 'success');
            carregarProfessores();
        } catch (error) {
            console.error('Erro ao excluir professor:', error);
            showFeedback(
                error.response?.data?.message || 'Erro ao excluir professor',
                'error'
            );
        } finally {
            hideLoading();
            setConfirmDialogOpen(false);
            setProfessorParaExcluir(null);
        }
    };

    // Componente de botão de ação extraído para reduzir repetição
    const ActionButton = ({ color, onClick, children, ...props }) => (
        <Button
            variant="contained"
            color={color || "primary"}
            size="small"
            onClick={onClick}
            sx={{ mr: 1, ...(color === "primary" ? BUTTON_PRIMARY_STYLE : {}) }}
            {...props}
        >
            {children}
        </Button>
    );

    // Renderização da linha da tabela extraída para maior legibilidade
    const renderTableRow = (professor) => (
        <TableRow key={professor.id}>
            <TableCell>{professor.nome}</TableCell>
            <TableCell>{professor.escola}</TableCell>
            <TableCell align="center">
                <ActionButton onClick={() => handleEditar(professor.id)}>
                    Editar
                </ActionButton>
                <ActionButton onClick={() => handleVerReservas(professor.id)}>
                    Ver Reservas
                </ActionButton>
                <ActionButton 
                    color="error" 
                    onClick={() => handleExcluirClick(professor)}
                    sx={{ mr: 0 }}
                >
                    Excluir
                </ActionButton>
            </TableCell>
        </TableRow>
    );

    return (
        <div>
            <FeedbackComponent />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Professores</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNovoProfessor}
                    sx={{
                        ...BUTTON_PRIMARY_STYLE,
                        borderRadius: '4px',
                        py: 1.5,
                        px: 3
                    }}
                >
                    Novo Professor
                </Button>
            </Box>

            <Paper sx={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Escola/Disciplina</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {professores.length > 0 ? (
                                professores.map(renderTableRow)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Nenhum professor cadastrado
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelExcluir}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o professor "{professorParaExcluir?.nome}"?
                        <strong> Esta ação também excluirá todas as reservas ligadas a este professor.</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelExcluir} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmExcluir} color="error" autoFocus>
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ListaProfessores;