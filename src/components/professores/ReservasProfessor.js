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

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      // Carregar dados do professor
      const professorResponse = await api.get(`/professores/${id}`);
      setProfessor(professorResponse.data);
      
      // Carregar reservas do professor
      const reservasResponse = await api.get(`/professores/${id}/reservas`);
      setReservas(reservasResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showFeedback('Erro ao carregar dados do professor e suas reservas', 'error');
      navigate('/professores');
    } finally {
      hideLoading();
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatarHora = (horaString) => {
    return horaString.substring(0, 5); // Formato HH:mm
  };

  const exibirStatus = (reserva) => {
    if (reserva.status === 'CANCELADO') return { label: 'Cancelada', color: 'error' };
    return reserva.utilizado ? 
      { label: 'Utilizada', color: 'success' } : 
      { label: 'Pendente', color: 'primary' };
  };

  const handleVoltar = () => {
    navigate('/professores');
  };

  return (
    <div>
      {FeedbackComponent}
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