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
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

// Componentes estilizados para manter consistência com ListaReservas
const PageTitle = styled(Typography)({
  color: '#0F1140',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
});

const StyledTableContainer = styled(TableContainer)({
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  overflow: 'auto',
  maxWidth: '100%',
});

const TableHeader = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

const TableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  color: '#0F1140',
});

const StyledTable = styled(Table)({
  minWidth: 650,
  tableLayout: 'fixed',
});

const TableCellStyled = styled(TableCell)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// Componente do Chip de Status usando a mesma lógica do ListaReservas
const StatusChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'PENDENTE':
        return { bg: '#FFA726', color: '#fff' };
      case 'EM_USO':
        return { bg: '#42A5F5', color: '#fff' };
      case 'AGUARDANDO_CONFIRMACAO':
        return { bg: '#9EA5B5', color: '#fff' };
      case 'UTILIZADO':
        return { bg: '#66BB6A', color: '#fff' };
      case 'CANCELADO':
        return { bg: '#9E9E9E', color: '#fff' };
      default:
        return { bg: '#9E9E9E', color: '#fff' };
    }
  };

  const colors = getStatusColor();

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

const StyledButton = styled(Button)({
  marginRight: '16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: 'rgba(15, 17, 64, 0.1)',
  },
});

const ProfessorInfoBox = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '24px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
});

const ReservasProfessor = () => {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const [reservas, setReservas] = useState([]);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();

  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      const professorResponse = await api.get(`/professores/${id}`);
      setProfessor(professorResponse.data);
      
      const reservasResponse = await api.get(`/professores/${id}/reservas`);
      
      // Ordenar as reservas da mesma forma que em ListaReservas
      const reservasOrdenadas = reservasResponse.data.sort((a, b) => {
        // Comparar por data primeiro
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        if (dataA.getTime() !== dataB.getTime()) {
          return dataA - dataB;
        }
        
        // Se a data for a mesma, comparar por hora inicial
        if (a.horaInicial !== b.horaInicial) {
          return a.horaInicial.localeCompare(b.horaInicial);
        }
        
        // Se a hora inicial for a mesma, ordenar por status
        const ordemStatus = {
          'EM_USO': 1,
          'AGUARDANDO_CONFIRMACAO': 2,
          'PENDENTE': 3,
          'UTILIZADO': 4,
          'CANCELADO': 5
        };
        
        return ordemStatus[a.status] - ordemStatus[b.status];
      });
      
      setReservas(reservasOrdenadas);
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

  // Atualização em tempo real dos status das reservas
  useEffect(() => {
    // Função para atualizar status em tempo real
    const atualizarStatusReservasEmTempoReal = () => {
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0];
      const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:00`;
      
      setReservas(prevReservas => 
        prevReservas.map(reserva => {
          // Verificar se é de hoje
          if (reserva.data !== dataHoje) return reserva;
          
          // Clone para não mutar o estado diretamente
          const novaReserva = {...reserva};
          
          // Para reservas PENDENTES: se hora inicial <= hora atual < hora final => EM_USO
          if (reserva.status === 'PENDENTE' && 
              reserva.horaInicial <= horaAtual && 
              reserva.horaFinal > horaAtual) {
            novaReserva.status = 'EM_USO';
          }
          
          // Para reservas EM_USO: se hora atual >= hora final => AGUARDANDO_CONFIRMACAO
          else if (reserva.status === 'EM_USO' && 
                   reserva.horaFinal <= horaAtual) {
            novaReserva.status = 'AGUARDANDO_CONFIRMACAO';
          }
          
          return novaReserva;
        })
      );
    };
    
    // Atualizar status em tempo real a cada segundo
    const statusInterval = setInterval(() => {
      atualizarStatusReservasEmTempoReal();
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  // Mesma função formatarData do ListaReservas
  const formatarData = (dataString) => {
    if (!dataString) return '';
    
    // Garantir que a data seja tratada como UTC para evitar conversões automáticas
    const data = new Date(dataString + 'T12:00:00Z');
    
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    
    return `${dia}/${mes}/${ano}`;
  };

  // Mesma função formatarHora do ListaReservas
  const formatarHora = (horaString) => {
    if (!horaString) return '';
    return horaString.substring(0, 5); // Formato HH:MM
  };

  const handleVoltar = () => {
    navigate('/professores');
  };

  // Mesma função de tradução de status do ListaReservas
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_USO': return 'Em uso';
      case 'AGUARDANDO_CONFIRMACAO': return 'Aguardando confirmação';
      case 'UTILIZADO': return 'Utilizado';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  // Função para obter apenas o primeiro e último nome do professor
  const formatarNomeProfessor = (nomeCompleto) => {
    if (!nomeCompleto) return '';
    
    const nomes = nomeCompleto.trim().split(' ');
    if (nomes.length === 1) return nomes[0]; // Se for apenas um nome
    
    return `${nomes[0]} ${nomes[nomes.length - 1]}`; // Primeiro e último nome
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