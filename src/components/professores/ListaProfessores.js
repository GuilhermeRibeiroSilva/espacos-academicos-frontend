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
    DialogTitle,
    IconButton,
    Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

const ListaProfessores = () => {
    const [professores, setProfessores] = useState([]);
    const [professorParaExcluir, setProfessorParaExcluir] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();
    const { showFeedback, FeedbackComponent } = useFeedback();

    useEffect(() => {
        carregarProfessores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleNovoProfessor = () => {
        navigate('/professores/novo');
    };

    const handleEditar = (id) => {
        navigate(`/professores/editar/${id}`);
    };

    const handleVerReservas = (id) => {
        navigate(`/professores/${id}/reservas`);
    };

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
            await api.delete(`/professores/${professorParaExcluir.id}`);
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

    return (
        <div>
            {FeedbackComponent}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Professores</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNovoProfessor}
                    sx={{
                        bgcolor: '#0F1140',
                        '&:hover': { bgcolor: '#1a1b4b' },
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
                                <TableCell>Escola</TableCell>
                                <TableCell align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {professores.length > 0 ? (
                                professores.map((professor) => (
                                    <TableRow key={professor.id}>
                                        <TableCell>{professor.nome}</TableCell>
                                        <TableCell>{professor.escola}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEditar(professor.id)}
                                                sx={{
                                                    mr: 1,
                                                    bgcolor: '#0F1140',
                                                    '&:hover': { bgcolor: '#1a1b4b' }
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleVerReservas(professor.id)}
                                                sx={{
                                                    mr: 1,
                                                    bgcolor: '#0F1140',
                                                    '&:hover': { bgcolor: '#1a1b4b' }
                                                }}
                                            >
                                                Ver Reservas
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleExcluirClick(professor)}
                                            >
                                                Excluir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
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

            {/* Diálogo de confirmação para exclusão */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelExcluir}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o professor "{professorParaExcluir?.nome}"?
                        Esta ação não pode ser desfeita.
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