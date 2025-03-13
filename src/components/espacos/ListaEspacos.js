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

const ListaEspacos = () => {
  const [espacos, setEspacos] = useState([]);
  const [espacoParaExcluir, setEspacoParaExcluir] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();

  useEffect(() => {
    carregarEspacos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarEspacos = async () => {
    showLoading('Carregando espaços acadêmicos...');
    try {
      const response = await api.get('/espacos');
      setEspacos(response.data);
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
      showFeedback('Erro ao carregar espaços acadêmicos', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleNovoEspaco = () => {
    navigate('/espacos/novo');
  };

  const handleEditar = (id) => {
    navigate(`/espacos/editar/${id}`);
  };

  const handleExcluirClick = (espaco) => {
    setEspacoParaExcluir(espaco);
    setConfirmDialogOpen(true);
  };

  const handleConfirmExcluir = async () => {
    if (!espacoParaExcluir) return;
    
    showLoading('Excluindo espaço acadêmico...');
    try {
      await api.delete(`/espacos/${espacoParaExcluir.id}`);
      showFeedback('Espaço acadêmico excluído com sucesso', 'success');
      carregarEspacos();
    } catch (error) {
      console.error('Erro ao excluir espaço:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao excluir espaço acadêmico', 
        'error'
      );
    } finally {
      hideLoading();
      setConfirmDialogOpen(false);
      setEspacoParaExcluir(null);
    }
  };

  const handleCancelExcluir = () => {
    setConfirmDialogOpen(false);
    setEspacoParaExcluir(null);
  };

  return (
    <div>
      {FeedbackComponent}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gerenciar Espaço Acadêmico</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNovoEspaco}
          sx={{ 
            bgcolor: '#0F1140', 
            '&:hover': { bgcolor: '#1a1b4b' },
            borderRadius: '4px',
            py: 1.5,
            px: 3
          }}
        >
          Novo Espaço
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
                <TableCell>Sigla</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Capacidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {espacos.map((espaco) => (
                <TableRow key={espaco.id}>
                  <TableCell>{espaco.sigla}</TableCell>
                  <TableCell>{espaco.nome}</TableCell>
                  <TableCell>{espaco.capacidadeAlunos}</TableCell>
                  <TableCell>{espaco.disponivel ? 'Disponível' : 'Indisponível'}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditar(espaco.id)}
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
                      color="error"
                      size="small"
                      onClick={() => handleExcluirClick(espaco)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
            Tem certeza que deseja excluir o espaço acadêmico "{espacoParaExcluir?.nome}"? 
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

export default ListaEspacos;