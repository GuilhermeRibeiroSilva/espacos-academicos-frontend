import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  TableBody, 
  TableRow, 
  Box
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';
import { 
  PageTitle, 
  StyledTableContainer, 
  TableHeader,
  TableHeaderCell, 
  StyledTable, 
  TableCellStyled,
  StatusChip,
  StyledButton,
  ProfessorInfoBox
} from '../common/StyledComponents';
import { formatarData, formatarHora, getStatusLabel } from '../../utils/formatters';
import { useReservasStatus } from '../../hooks/useReservasStatus';

const ReservasProfessor = () => {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  const { reservas, atualizarReservas } = useReservasStatus([]);

  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      const professorResponse = await api.get(`/professores/${id}`);
      setProfessor(professorResponse.data);
      
      const reservasResponse = await api.get(`/professores/${id}/reservas`);
      atualizarReservas(reservasResponse.data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVoltar = () => {
    navigate('/professores');
  };

  return (
    <div>
      <FeedbackComponent />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StyledButton 
          startIcon={<ArrowBackIcon />} 
          onClick={handleVoltar}
        >
          Voltar para Lista de Professores
        </StyledButton>
      </Box>
      
      <PageTitle variant="h4">
        Reservas do Professor
      </PageTitle>
      
      {professor && (
        <ProfessorInfoBox>
          <Typography variant="h5" sx={{ mb: 1, color: '#0F1140', fontWeight: 'bold' }}>
            {professor.nome}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Escola/Disciplina: {professor.escola || 'Não informada'}
          </Typography>
        </ProfessorInfoBox>
      )}
      
      <StyledTableContainer component={Paper}>
        <StyledTable>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Espaço</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell>Horário</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length > 0 ? (
              reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCellStyled>
                    {reserva.espacoAcademico.sigla} - {reserva.espacoAcademico.nome}
                  </TableCellStyled>
                  <TableCellStyled>{formatarData(reserva.data)}</TableCellStyled>
                  <TableCellStyled>
                    {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                  </TableCellStyled>
                  <TableCellStyled>
                    <StatusChip 
                      label={getStatusLabel(reserva.status)} 
                      status={reserva.status}
                      size="small"
                    />
                  </TableCellStyled>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCellStyled colSpan={4} align="center">
                  Este professor não possui reservas
                </TableCellStyled>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </div>
  );
};

export default ReservasProfessor;