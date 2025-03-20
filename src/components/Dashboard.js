import React, { useState, useEffect } from 'react';
import { 
  Grid,
  Paper, 
  Typography, 
  Box,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { useFeedback } from './common/Feedback';
import { useNavigate } from 'react-router-dom';

// Estilos do calendário
const CalendarContainer = styled(Box)(({ theme }) => ({
  '.calendar-header': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  '.calendar-days': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: '10px',
  },
  '.calendar-grid': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  '.calendar-day': {
    position: 'relative',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.disabled': {
      color: theme.palette.text.disabled,
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    '&.selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    '&.has-reservation': {
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: '#ff6b00',
      },
    },
  },
}));

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [espacos, setEspacos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservasHoje, setReservasHoje] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [espacosAtualizados, setEspacosAtualizados] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [diasComReserva, setDiasComReserva] = useState({});

  useEffect(() => {
    carregarDadosIniciais();
    atualizarReservasDoDia(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    const interval = setInterval(() => {
      carregarDadosIniciais();
      atualizarReservasDoDia(selectedDay);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDay]);

  const carregarDadosIniciais = async () => {
    try {
      // Carregar espaços
      const espacosResponse = await api.get('/espacos');
      const espacosData = espacosResponse.data;
      setEspacos(espacosData);

      // Carregar reservas
      const reservasResponse = await api.get('/reservas');
      const reservasData = reservasResponse.data;
      setReservas(reservasData);
      
      // Calcular espaços em uso
      const agora = new Date();
      const espacosAtualizados = espacosData.map(espaco => {
        const reservasDoEspaco = reservasData.filter(r => 
          r.espacoAcademico.id === espaco.id &&
          r.status !== 'CANCELADO' &&
          new Date(r.data).toDateString() === agora.toDateString()
        );

        const emUso = reservasDoEspaco.some(reserva => {
          const horaInicial = new Date(`${reserva.data}T${reserva.horaInicial}`);
          const horaFinal = new Date(`${reserva.data}T${reserva.horaFinal}`);
          return agora >= horaInicial && agora <= horaFinal;
        });

        return {
          ...espaco,
          emUso
        };
      });

      setEspacosAtualizados(espacosAtualizados);
      
      // Atualizar dias com reservas
      const diasComReserva = reservasData.reduce((acc, reserva) => {
        const data = new Date(reserva.data);
        const dataFormatada = format(data, 'yyyy-MM-dd');
        acc[dataFormatada] = true;
        return acc;
      }, {});
      
      setDiasComReserva(diasComReserva);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const atualizarReservasDoDia = async (dia) => {
    try {
      const response = await api.get('/reservas');
      const todasReservas = response.data;
      
      const reservasDoDia = todasReservas.filter(reserva => {
        const dataReserva = new Date(reserva.data);
        return dataReserva.toDateString() === dia.toDateString();
      });

      setReservasDoDia(reservasDoDia);
      atualizarStatusEspacos(reservasDoDia, espacos);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
  };

  const atualizarStatusEspacos = (reservas, espacos) => {
    const agora = new Date();
    const espacosAtualizados = espacos.map(espaco => {
      const reservasDoEspaco = reservas.filter(r => r.espacoAcademico.id === espaco.id);
      const emUso = reservasDoEspaco.some(reserva => {
        const dataReserva = new Date(reserva.data);
        const horaInicial = new Date(dataReserva.setHours(...reserva.horaInicial.split(':'), 0));
        const horaFinal = new Date(dataReserva.setHours(...reserva.horaFinal.split(':'), 0));
        return agora >= horaInicial && agora <= horaFinal && reserva.status !== 'CANCELADO';
      });

      return {
        ...espaco,
        status: emUso ? 'EM_USO' : 'DISPONIVEL'
      };
    });

    setEspacosAtualizados(espacosAtualizados);
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

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(cloneDay, 'yyyy-MM-dd');
        const hasReservation = diasComReserva[formattedDate];
        
        days.push(
          <div
            key={format(cloneDay, 'T')}
            className={`calendar-day ${
              !isSameMonth(day, monthStart) ? 'disabled' : ''
            } ${isSameDay(day, selectedDay) ? 'selected' : ''} ${
              hasReservation ? 'has-reservation' : ''
            }`}
            onClick={() => onDateClick(cloneDay)}
          >
            {format(cloneDay, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }
    return rows;
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
            <CalendarContainer>
              <div className="calendar-header">
                <Typography variant="h6">
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
              </div>
              <div className="calendar-days">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <Typography key={day} variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {day}
                  </Typography>
                ))}
              </div>
              <div className="calendar-grid">
                {renderCells().map((week, i) => (
                  <React.Fragment key={i}>{week}</React.Fragment>
                ))}
              </div>
            </CalendarContainer>
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
              {espacos.filter(e => e.disponivel && !espacosAtualizados.find(ea => ea.id === e.id)?.emUso).length} disponíveis
            </Typography>
            <Typography color="textSecondary">
              {espacosAtualizados.filter(e => e.emUso).length} em uso
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