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
  Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

const ReservasProfessor = () => {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();

  // Verificar e padronizar caminho da API
  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      // Verificar se '/api' é necessário aqui
      const professorResponse = await api.get(`/api/professores/${id}`);
      setProfessor(professorResponse.data);
      
      const reservasResponse = await api.get(`/api/professores/${id}/reservas`);
      setReservas(reservasResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showFeedback('Erro ao carregar dados do professor e suas reservas', 'error');
      navigate('/professores');
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  // Melhorar tratamento de datas
  const formatarData = (dataString) => {
    try {
      // Garantir que não haja problemas com timezone
      const [ano, mes, dia] = dataString.split('-');
      const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return format(data, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return dataString; // Fallback para o formato original
    }
  };

  const formatarHora = (horaString) => {
    return horaString.substring(0, 5); // Formato HH:mm
  };

  const handleVoltar = () => {
    navigate('/professores');
  };

  const exibirStatus = (reserva) => {
    switch (reserva.status) {
      case 'CANCELADO':
        return { label: 'Cancelada', color: 'error' };
      case 'UTILIZADO':
        return { label: 'Utilizada', color: 'success' };
      default:
        return { label: 'Pendente', color: 'primary' };
    }
  };

  return (
    <div>
      <FeedbackComponent />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleVoltar}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
      </Box>
      
      <Typography variant="h4" sx={{ mb: 3 }}>
        Reservas do Professor
      </Typography>
      
      {professor && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {professor.nome}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Escola: {professor.escola}
          </Typography>
        </Box>
      )}
      
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
                <TableCell>Espaço</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.length > 0 ? (
                reservas.map((reserva) => {
                  const status = exibirStatus(reserva);
                  return (
                    <TableRow key={reserva.id}>
                      <TableCell>
                        {reserva.espacoAcademico.sigla} - {reserva.espacoAcademico.nome}
                      </TableCell>
                      <TableCell>{formatarData(reserva.data)}</TableCell>
                      <TableCell>
                        {formatarHora(reserva.horaInicial)} às {formatarHora(reserva.horaFinal)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status.label} 
                          color={status.color} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Este professor não possui reservas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default ReservasProfessor;