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
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';
import { styled } from '@mui/material/styles';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componente estilizado para status
const StatusChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'EM_USO':
        return { bg: '#f44336', color: '#fff' };
      case 'DISPONÍVEL':
        return { bg: '#4caf50', color: '#fff' };
      case 'INDISPONÍVEL':
        return { bg: '#9e9e9e', color: '#fff' };
      default:
        return { bg: '#9e9e9e', color: '#fff' };
    }
  };

  const colors = getStatusColor();

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

// Componente estilizado para o filtro
const FilterContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const ListaEspacos = () => {
  const [espacos, setEspacos] = useState([]);
  const [espacosFiltrados, setEspacosFiltrados] = useState([]);
  const [espacoParaExcluir, setEspacoParaExcluir] = useState(null);
  const [espacoParaAtualizarStatus, setEspacoParaAtualizarStatus] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();

  useEffect(() => {
    carregarEspacos();
    
    // Atualizar o status dos espaços a cada minuto para refletir mudanças em tempo real
    const interval = setInterval(() => {
      carregarEspacos(false); // Não mostrar loading para atualizações silenciosas
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Efeito para filtrar os espaços quando o filtro ou a lista de espaços mudar
  useEffect(() => {
    aplicarFiltro();
  }, [filtroStatus, espacos]);

  const aplicarFiltro = () => {
    if (filtroStatus === 'TODOS') {
      setEspacosFiltrados(espacos);
      return;
    }
    
    const espacosFiltrados = espacos.filter(espaco => {
      const statusAtual = espaco.disponivel ? espaco.statusAtual : 'INDISPONÍVEL';
      return statusAtual === filtroStatus;
    });
    
    setEspacosFiltrados(espacosFiltrados);
  };

  const carregarEspacos = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading('Carregando espaços acadêmicos...');
    }
    
    try {
      // Buscar os espaços acadêmicos
      const response = await api.get('/espacos');
      
      // Verificar os espaços que estão atualmente em uso
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0];
      const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:00`;
      
      // Para cada espaço, verificar se há reservas ativas no momento atual
      const espacosComStatus = await Promise.all(response.data.map(async (espaco) => {
        if (!espaco.disponivel) {
          return { ...espaco, statusAtual: 'INDISPONÍVEL' };
        }
        
        try {
          const reservasResponse = await api.get('/reservas/buscar-por-espaco-data', {
            params: {
              espacoId: espaco.id,
              data: dataHoje
            }
          });
          
          // Verificar se alguma reserva está em uso neste momento
          const emUso = reservasResponse.data.some(reserva => 
            reserva.status === 'EM_USO' && 
            reserva.horaInicial <= horaAtual && 
            reserva.horaFinal > horaAtual
          );
          
          return { ...espaco, statusAtual: emUso ? 'EM_USO' : 'DISPONÍVEL' };
        } catch (error) {
          console.error(`Erro ao verificar status do espaço ${espaco.id}:`, error);
          return { ...espaco, statusAtual: 'DISPONÍVEL' };
        }
      }));
      
      setEspacos(espacosComStatus);
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
      if (showLoadingIndicator) {
        showFeedback('Erro ao carregar espaços acadêmicos', 'error');
      }
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  const handleFiltroChange = (event) => {
    setFiltroStatus(event.target.value);
  };

  const handleLimparFiltro = () => {
    setFiltroStatus('TODOS');
  };

  const handleNovoEspaco = () => {
    navigate('/espacos/novo');
  };

  const handleEditar = (id) => {
    navigate(`/espacos/${id}`);
  };

  const handleExcluirClick = (espaco) => {
    setEspacoParaExcluir(espaco);
    setConfirmDialogOpen(true);
  };

  const handleTornarIndisponivelClick = (espaco) => {
    setEspacoParaAtualizarStatus(espaco);
    setStatusDialogOpen(true);
  };

  const handleTornarDisponivelClick = async (espacoId) => {
    showLoading('Atualizando status do espaço...');
    try {
      await api.patch(`/espacos/${espacoId}/disponivel`);
      showFeedback('Espaço acadêmico está disponível novamente', 'success');
      carregarEspacos();
    } catch (error) {
      console.error('Erro ao atualizar status do espaço:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao atualizar status do espaço', 
        'error'
      );
    } finally {
      hideLoading();
    }
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

  const handleConfirmTornarIndisponivel = async () => {
    if (!espacoParaAtualizarStatus) return;
    
    showLoading('Atualizando status do espaço...');
    try {
      await api.patch(`/espacos/${espacoParaAtualizarStatus.id}/indisponivel`);
      showFeedback('Espaço acadêmico marcado como indisponível', 'success');
      carregarEspacos();
    } catch (error) {
      console.error('Erro ao atualizar status do espaço:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao marcar espaço como indisponível', 
        'error'
      );
    } finally {
      hideLoading();
      setStatusDialogOpen(false);
      setEspacoParaAtualizarStatus(null);
    }
  };

  const handleCancelExcluir = () => {
    setConfirmDialogOpen(false);
    setEspacoParaExcluir(null);
  };

  const handleCancelTornarIndisponivel = () => {
    setStatusDialogOpen(false);
    setEspacoParaAtualizarStatus(null);
  };

  return (
    <div>
      <FeedbackComponent />
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

      {/* Filtro de Status */}
      <FilterContainer>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              <FilterAltIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Filtrar por Status:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="filtro-status-label">Status</InputLabel>
              <Select
                labelId="filtro-status-label"
                id="filtro-status"
                value={filtroStatus}
                label="Status"
                onChange={handleFiltroChange}
              >
                <MenuItem value="TODOS">Todos os Espaços</MenuItem>
                <MenuItem value="DISPONÍVEL">Disponíveis</MenuItem>
                <MenuItem value="EM_USO">Em Uso</MenuItem>
                <MenuItem value="INDISPONÍVEL">Indisponíveis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleLimparFiltro}
              fullWidth
            >
              Limpar
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              {espacosFiltrados.length} espaço(s) encontrado(s)
            </Typography>
          </Grid>
        </Grid>
      </FilterContainer>

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
              {espacosFiltrados.length > 0 ? (
                espacosFiltrados.map((espaco) => (
                  <TableRow key={espaco.id}>
                    <TableCell>{espaco.sigla}</TableCell>
                    <TableCell>{espaco.nome}</TableCell>
                    <TableCell>{espaco.capacidadeAlunos}</TableCell>
                    <TableCell>
                      <StatusChip 
                        label={espaco.disponivel ? espaco.statusAtual : 'INDISPONÍVEL'} 
                        status={espaco.disponivel ? espaco.statusAtual : 'INDISPONÍVEL'} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEditar(espaco.id)}
                          sx={{ 
                            bgcolor: '#0F1140', 
                            '&:hover': { bgcolor: '#1a1b4b' } 
                          }}
                        >
                          Editar
                        </Button>
                        
                        {espaco.disponivel ? (
                          <Tooltip title="Marcar como indisponível (em manutenção/reforma)">
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={() => handleTornarIndisponivelClick(espaco)}
                              sx={{
                                bgcolor: '#ff9800',
                                '&:hover': { bgcolor: '#f57c00' }
                              }}
                            >
                              Tornar Indisponível
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Marcar como disponível novamente">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleTornarDisponivelClick(espaco.id)}
                              sx={{
                                bgcolor: '#4caf50',
                                '&:hover': { bgcolor: '#388e3c' }
                              }}
                            >
                              Tornar Disponível
                            </Button>
                          </Tooltip>
                        )}
                        
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleExcluirClick(espaco)}
                        >
                          Excluir
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {espacos.length > 0 ? 
                      `Nenhum espaço acadêmico encontrado com o status "${filtroStatus}"` : 
                      'Nenhum espaço acadêmico cadastrado'}
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

      {/* Diálogo de confirmação para tornar indisponível */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCancelTornarIndisponivel}
      >
        <DialogTitle>Confirmar Alteração de Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja marcar o espaço "{espacoParaAtualizarStatus?.nome}" como indisponível?
            <br /><br />
            <strong>Atenção:</strong> Isto impedirá novas reservas para este espaço e 
            deve ser usado para espaços em manutenção ou reforma.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTornarIndisponivel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmTornarIndisponivel} color="warning" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListaEspacos;