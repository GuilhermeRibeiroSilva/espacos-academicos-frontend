import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, isSameDay, addMonths, subMonths } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CustomCalendar from './CustomCalendar';
import StatusChip, { getStatusLabel } from './StatusChip';
import { parseAnyDate, formatarData, formatarHora, formatarNomeProfessor } from '../../utils/dateUtils';

// Estilos para a tabela
const TableHeader = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

const TableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  color: '#0F1140',
});

const StyledTableContainer = styled(TableContainer)({
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  overflow: 'auto',
  maxWidth: '100%',
  marginTop: '16px',
});

const Dashboard = () => {
  const { auth } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [professorCount, setProfessorCount] = useState(0);
  const [espacosCount, setEspacosCount] = useState(0);
  const [espacosIndiponiveisCount, setEspacosIndiponiveisCount] = useState(0);
  const [espacosEmUso, setEspacosEmUso] = useState(0);
  const [reservasHoje, setReservasHoje] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [diasComReserva, setDiasComReserva] = useState({});
  const [loading, setLoading] = useState(true);

  // Função para calcular status atual
  const calcularStatusAtual = useCallback((reserva) => {
    try {
      const hoje = new Date();
      
      // Extrair data da reserva usando a função parseAnyDate
      const dataReserva = parseAnyDate(reserva.data || reserva.dataReserva);
      if (!dataReserva) return reserva.status || 'AGENDADO';
      
      if (reserva.status === 'CANCELADO') return 'CANCELADO';
      
      // Converter strings de hora para objetos Date para comparação
      let horaInicio, horaFim;

      if (reserva.horaInicio || reserva.horaInicial) {
        const horaString = reserva.horaInicio || reserva.horaInicial;
        try {
          const [horas, minutos] = horaString.split(':').map(Number);
          horaInicio = new Date(dataReserva);
          horaInicio.setHours(horas || 0, minutos || 0, 0);
        } catch (e) {}
      }

      if (reserva.horaFim || reserva.horaFinal) {
        const horaString = reserva.horaFim || reserva.horaFinal;
        try {
          const [horas, minutos] = horaString.split(':').map(Number);
          horaFim = new Date(dataReserva);
          horaFim.setHours(horas || 0, minutos || 0, 0);
        } catch (e) {}
      }

      if (dataReserva.toDateString() !== hoje.toDateString() && dataReserva < hoje) {
        return reserva.status === 'UTILIZADO' ? 'UTILIZADO' : 'AGUARDANDO_CONFIRMACAO';
      }

      if (dataReserva.toDateString() === hoje.toDateString()) {
        if (horaFim && hoje > horaFim) {
          return reserva.status === 'UTILIZADO' ? 'UTILIZADO' : 'AGUARDANDO_CONFIRMACAO';
        }
        else if (horaInicio && horaFim && hoje >= horaInicio && hoje <= horaFim) {
          return 'EM_USO';
        }
        else if (horaInicio && hoje < horaInicio) {
          return 'AGENDADO';
        }
      }
      
      if (dataReserva > hoje) {
        return 'AGENDADO';
      }
      
      if (reserva.status === 'PENDENTE') {
        return 'AGENDADO';
      }
      
      return reserva.status || 'AGENDADO';
    } catch (error) {
      console.error("Erro ao calcular status:", error);
      return (reserva.status === 'PENDENTE' ? 'AGENDADO' : reserva.status) || 'AGENDADO';
    }
  }, []);
  
  // Busca de dados ao carregar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Buscar todas as reservas
        const reservasResponse = await api.get('/reservas');
        
        const reservasProcessadas = reservasResponse.data.map(reserva => {
          try {
            const dataObj = parseAnyDate(reserva.data || reserva.dataReserva);
            return {
              ...reserva,
              statusAtual: calcularStatusAtual(reserva),
              dataObj: dataObj
            };
          } catch (e) {
            console.error("Erro ao processar reserva:", e);
            return {
              ...reserva,
              statusAtual: reserva.status || 'AGENDADO'
            };
          }
        }).filter(r => r.dataObj);
        
        setReservas(reservasProcessadas);
        
        // Mapa de dias com reservas
        const map = {};
        let countHoje = 0;
        let countEmUso = 0;
        const hoje = new Date();
        
        reservasProcessadas.forEach(reserva => {
          if (!reserva.dataObj) return;
          
          // Verifica permissões
          let deveIncluir = true;
          if (!auth.isAdmin && auth.user?.professorId) {
            const professorId = auth.user.professorId;
            deveIncluir = reserva.professorId === professorId || reserva.professor?.id === professorId;
          }
          
          if (!deveIncluir) return;
          
          const dateKey = format(reserva.dataObj, 'yyyy-MM-dd');
          map[dateKey] = (map[dateKey] || 0) + 1;
          
          // Conta reservas de hoje
          if (isSameDay(reserva.dataObj, hoje)) {
            countHoje++;
            if (reserva.statusAtual === 'EM_USO') {
              countEmUso++;
            }
          }
        });
        
        setDiasComReserva(map);
        setReservasHoje(countHoje);
        setEspacosEmUso(countEmUso);
        
        if (auth.isAdmin) {
          // Dados específicos para admin
          const professoresResponse = await api.get('/professores');
          setProfessorCount(professoresResponse.data.length);
          
          const espacosResponse = await api.get('/espacos');
          
          const espacosTotais = espacosResponse.data;
          const espacosDisponiveis = espacosTotais.filter(espaco => espaco.disponivel !== false);
          const espacosIndisponiveis = espacosTotais.filter(espaco => espaco.disponivel === false);
          
          setEspacosCount(espacosDisponiveis.length);
          setEspacosIndiponiveisCount(espacosIndisponiveis.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, [auth.isAdmin, auth.user, calcularStatusAtual]);
  
  // Atualiza as reservas do dia selecionado
  useEffect(() => {
    const reservasFiltradas = reservas.filter(reserva => 
      reserva.dataObj && isSameDay(reserva.dataObj, selectedDate)
    );
    
    // Filtra por professor se necessário
    if (!auth.isAdmin && auth.user?.professorId) {
      const professorId = auth.user.professorId;
      setReservasDoDia(reservasFiltradas.filter(r => 
        r.professorId === professorId || r.professor?.id === professorId
      ));
    } else {
      setReservasDoDia(reservasFiltradas);
    }
  }, [selectedDate, reservas, auth.isAdmin, auth.user]);
  
  // Renderização condicional para carregamento
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meu Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {/* Estatísticas apenas para Admin */}
        {auth.isAdmin && (
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6">
                  Professores Cadastrados: {professorCount}
                </Typography>
              </CardContent>
              <Divider />
              <CardContent>
                <Typography variant="h6">
                  Espaços Disponíveis: {espacosCount}
                </Typography>
              </CardContent>
              <Divider />
              <CardContent>
                <Typography variant="h6">
                  Espaços Indisponíveis: {espacosIndiponiveisCount}
                </Typography>
              </CardContent>
              <Divider />
              <CardContent>
                <Typography variant="h6">
                  Espaços em Uso: {espacosEmUso}
                </Typography>
              </CardContent>
              <Divider />
              <CardContent>
                <Typography variant="h6">
                  Reservas Hoje: {reservasHoje}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Calendário personalizado */}
        <Grid item xs={12} md={auth.isAdmin ? 8 : 6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Cronograma de Reservas
            </Typography>
            <CustomCalendar 
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              diasComReserva={diasComReserva}
              setCurrentMonth={setCurrentMonth}
              setSelectedDate={setSelectedDate}
            />
          </Paper>
        </Grid>
        
        {/* Reservas do dia selecionado */}
        <Grid item xs={12} md={auth.isAdmin ? 12 : 6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reservas do dia: {format(selectedDate, 'dd/MM/yyyy')}
            </Typography>
            
            {reservasDoDia.length > 0 ? (
              <StyledTableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Espaço</TableHeaderCell>
                      <TableHeaderCell>Professor</TableHeaderCell>
                      <TableHeaderCell>Data</TableHeaderCell>
                      <TableHeaderCell>Horário</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasDoDia.map((reserva) => (
                      <TableRow key={reserva.id}>
                        <TableCell>
                          {reserva.espacoAcademico?.sigla || ''}
                        </TableCell>
                        <TableCell>
                          {formatarNomeProfessor(reserva.professorNome || reserva.professor?.nome)}
                        </TableCell>
                        <TableCell>
                          {formatarData(reserva.data || reserva.dataReserva)}
                        </TableCell>
                        <TableCell>
                          {formatarHora(reserva.horaInicial || reserva.horaInicio)} - {formatarHora(reserva.horaFinal || reserva.horaFim)}
                        </TableCell>
                        <TableCell>
                          <StatusChip 
                            label={getStatusLabel(reserva.statusAtual || reserva.status)} 
                            status={reserva.statusAtual || reserva.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Não há reservas para esta data.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;