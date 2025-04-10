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
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';
import StatusChip from './StatusChip';
import FiltroEspacos from './FiltroEspacos';

// Constantes para facilitar manutenção
const STATUS = {
  TODOS: 'TODOS',
  DISPONIVEL: 'DISPONÍVEL',
  EM_USO: 'EM_USO',
  INDISPONIVEL: 'INDISPONÍVEL'
};

const INTERVALO_ATUALIZACAO = 60000; // 1 minuto em milissegundos

const ListaEspacos = () => {
  const [espacos, setEspacos] = useState([]);
  const [espacosFiltrados, setEspacosFiltrados] = useState([]);
  const [espacoParaExcluir, setEspacoParaExcluir] = useState(null);
  const [espacoParaAtualizarStatus, setEspacoParaAtualizarStatus] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState(STATUS.TODOS);
  
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();

  useEffect(() => {
    carregarEspacos();
    
    // Atualizar o status dos espaços periodicamente
    const interval = setInterval(() => {
      carregarEspacos(false); // Não mostrar loading para atualizações silenciosas
    }, INTERVALO_ATUALIZACAO);
    
    return () => clearInterval(interval);
  }, []);

  // Efeito para filtrar os espaços quando o filtro ou a lista de espaços mudar
  useEffect(() => {
    aplicarFiltro();
  }, [filtroStatus, espacos]);

  const aplicarFiltro = () => {
    if (filtroStatus === STATUS.TODOS) {
      setEspacosFiltrados(espacos);
      return;
    }
    
    const filtrados = espacos.filter(espaco => {
      const statusAtual = espaco.disponivel ? espaco.statusAtual : STATUS.INDISPONIVEL;
      return statusAtual === filtroStatus;
    });
    
    setEspacosFiltrados(filtrados);
  };

  const carregarEspacos = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading('Carregando espaços acadêmicos...');
    }
    
    try {
      const response = await api.get('/espacos');
      const espacosComStatus = await verificarStatusEspacos(response.data);
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

  // Função para verificar status atual dos espaços
  const verificarStatusEspacos = async (espacos) => {
    const agora = new Date();
    const dataHoje = agora.toISOString().split('T')[0];
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:00`;
    
    return Promise.all(espacos.map(async (espaco) => {
      if (!espaco.disponivel) {
        return { ...espaco, statusAtual: STATUS.INDISPONIVEL };
      }
      
      try {
        const reservasResponse = await api.get('/reservas/buscar-por-espaco-data', {
          params: {
            espacoId: espaco.id,
            data: dataHoje
          }
        });
        
        // Verificar se alguma reserva está em uso
        const emUso = reservasResponse.data.some(reserva => 
          reserva.status === STATUS.EM_USO && 
          reserva.horaInicial <= horaAtual && 
          reserva.horaFinal > horaAtual
        );
        
        return { ...espaco, statusAtual: emUso ? STATUS.EM_USO : STATUS.DISPONIVEL };
      } catch (error) {
        console.error(`Erro ao verificar status do espaço ${espaco.id}:`, error);
        return { ...espaco, statusAtual: STATUS.DISPONIVEL };
      }
    }));
  };

  // Handlers para os filtros
  const handleFiltroChange = (event) => {
    setFiltroStatus(event.target.value);
  };

  const handleLimparFiltro = () => {
    setFiltroStatus(STATUS.TODOS);
  };

  // Handlers para navegação e ações
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

  // Função para renderizar botões de ação conforme status
  const renderAcoes = (espaco) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleEditar(espaco.id)}
        sx={{ bgcolor: '#0F1140', '&:hover': { bgcolor: '#1a1b4b' } }}
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
  );

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

      {/* Componente de filtro extraído */}
      <FiltroEspacos 
        filtroStatus={filtroStatus} 
        handleFiltroChange={handleFiltroChange} 
        handleLimparFiltro={handleLimparFiltro} 
        totalEspacos={espacosFiltrados.length} 
      />

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
                      <StatusChip status={espaco.disponivel ? espaco.statusAtual : STATUS.INDISPONIVEL} />
                    </TableCell>
                    <TableCell align="center">
                      {renderAcoes(espaco)}
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
      <Dialog open={confirmDialogOpen} onClose={handleCancelExcluir}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o espaço acadêmico "{espacoParaExcluir?.nome}"? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExcluir} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmExcluir} color="error" autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para tornar indisponível */}
      <Dialog open={statusDialogOpen} onClose={handleCancelTornarIndisponivel}>
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
          <Button onClick={handleCancelTornarIndisponivel} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmTornarIndisponivel} color="warning" autoFocus>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListaEspacos;