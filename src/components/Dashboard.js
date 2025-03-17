import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Divider
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { useFeedback } from '../components/common/Feedback';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [espacos, setEspacos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservasHoje, setReservasHoje] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Quando as reservas mudam, atualize o mapa de reservas por dia
    const reservaMap = {};
    reservas.forEach(reserva => {
      const dataKey = reserva.data;
      if (!reservaMap[dataKey]) {
        reservaMap[dataKey] = [];
      }
      reservaMap[dataKey].push(reserva);
    });
    setReservasPorDia(reservaMap);
    
    // Atualiza as reservas do dia selecionado
    atualizarReservasDoDia(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservas, selectedDay]);

  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      
      // Carregar espaços
      const espacosResponse = await api.get('/espacos');
      setEspacos(espacosResponse.data);
      
      // Carregar todas as reservas
      const reservasResponse = await api.get('/reservas');
      const todasReservas = reservasResponse.data;
      setReservas(todasReservas);
      
      // Filtrar reservas de hoje
      const reservasDeHoje = todasReservas.filter(
        reserva => reserva.data === hoje
      );
      setReservasHoje(reservasDeHoje);
      
      // Inicializar reservas do dia selecionado
      atualizarReservasDoDia(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showFeedback('Erro ao carregar dados do dashboard', 'error');
    } finally {
      hideLoading();
    }
  };

  const atualizarReservasDoDia = (dia) => {
    const dataFormatada = format(dia, 'yyyy-MM-dd');
    const reservasDia = reservasPorDia[dataFormatada] || [];
    
    // Se for admin, mostra todas as reservas do dia
    // Se for professor, filtra apenas as reservas dele
    const reservasFiltradas = isAdmin() 
      ? reservasDia 
      : reservasDia.filter(r => r.professor.id === user.professorId);
    
    setReservasDoDia(reservasFiltradas);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClick = (day) => {
    setSelectedDay(day);
    atualizarReservasDoDia(day);
  };

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </Typography>
        <Box>
          <IconButton onClick={prevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={nextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderDays = () => {
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <Grid container>
        {diasDaSemana.map(dia => (
          <Grid item xs key={dia} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {dia}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = 'd';
    const rows = [];

    let days = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    // Preencher com dias vazios até o primeiro dia da semana
    const firstDayOfMonth = startDate.getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
      days = [new Date(startDate.getFullYear(), startDate.getMonth(), -i), ...days];
    }

    // Preencher com dias vazios após o último dia do mês
    const lastDayOfMonth = endDate.getDay();
    for (let i = 1; i < 7 - lastDayOfMonth; i++) {
      days = [...days, new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + i)];
    }

    const salasEmUso = espacos.filter(espaco => {
      // Verifica se há alguma reserva ativa para este espaço
      return reservas.some(reserva => {
          if (reserva.status === 'CANCELADO') return false;
          
          const agora = new Date();
          const dataReserva = new Date(reserva.data);
          const horaInicial = new Date(`${reserva.data}T${reserva.horaInicial}`);
          const horaFinal = new Date(`${reserva.data}T${reserva.horaFinal}`);
          
          // Mesma data e horário atual entre inicial e final
          return reserva.espacoAcademico.id === espaco.id && 
                 dataReserva.toDateString() === agora.toDateString() &&
                 agora >= horaInicial && agora <= horaFinal;
      });
  });
  
  // Salas disponíveis são as que não estão em uso
  const salasDisponiveis = espacos.filter(espaco => 
      espaco.disponivel && !salasEmUso.some(s => s.id === espaco.id)
  );

    // Dividir os dias em semanas
    let daysInWeek = [];
    for (let i = 0; i < days.length; i++) {
      daysInWeek.push(days[i]);
      
      if (daysInWeek.length === 7) {
        rows.push(daysInWeek);
        daysInWeek = [];
      }
    }

    return (
      <Box>
        {rows.map((week, weekIndex) => (
          <Grid container key={weekIndex}>
            {week.map((day, dayIndex) => {
              const formattedDate = format(day, dateFormat);
              const dataFormatada = format(day, 'yyyy-MM-dd');
              const reservasDoDia = reservasPorDia[dataFormatada] || [];
              const temReserva = reservasDoDia.length > 0;
              
              // Se for professor, verifica se tem reserva dele neste dia
              const temReservaProfessor = isAdmin() 
                ? temReserva 
                : reservasDoDia.some(r => r.professor.id === user.professorId);
              
              return (
                <Grid item xs key={dayIndex}>
                  <Box
                    onClick={() => onDateClick(day)}
                    sx={{
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: '50%',
                      m: '4px',
                      backgroundColor: isSameDay(day, selectedDay) 
                        ? '#14104a' 
                        : 'transparent',
                      color: isSameDay(day, selectedDay)
                        ? 'white'
                        : !isSameMonth(day, monthStart)
                          ? '#ccc'
                          : 'inherit',
                      '&:hover': {
                        backgroundColor: isSameDay(day, selectedDay) 
                          ? '#14104a' 
                          : '#f5f5f5',
                      }
                    }}
                  >
                    {formattedDate}
                    {temReservaProfessor && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '2px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#ff6b00',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  const formatarHora = (hora) => {
    return hora.substring(0, 5); // Formato HH:mm
  };

  return (
    <div>
      {FeedbackComponent}
      <Typography variant="h4" gutterBottom>
        Meu Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Calendário */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </Paper>
        </Grid>

        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Espaços Acadêmicos
            </Typography>
            <Typography variant="h3">
              {espacos.length}
            </Typography>
            <Typography color="textSecondary">
              {espacos.filter(e => e.disponivel).length} disponíveis
            </Typography>
          </Paper>

          {isAdmin() && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Professores Cadastrados
              </Typography>
              <Typography variant="h3">
                {/* Número de professores virá da API */}
                {/* Placeholder por enquanto */}
                1
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reservas Hoje
            </Typography>
            <Typography variant="h3">
              {isAdmin() 
                ? reservasHoje.length 
                : reservasHoje.filter(r => r.professor.id === user.professorId).length}
            </Typography>
          </Paper>
        </Grid>

        {/* Reservas do Dia Selecionado */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reservas para {format(selectedDay, 'dd/MM/yyyy')}
            </Typography>
            
            {reservasDoDia.length > 0 ? (
              <Box>
                {reservasDoDia.map((reserva, index) => (
                  <Box key={reserva.id} sx={{ mb: 2 }}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {reserva.espacoAcademico.nome}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Horário: {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Professor: {reserva.professor.nome}
                        </Typography>
                      </Box>
                      <Chip 
                        label={reserva.utilizado ? "Utilizado" : "Pendente"}
                        color={reserva.utilizado ? "success" : "warning"}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Não há reservas para este dia.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;