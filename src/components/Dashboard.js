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
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [espacos, setEspacos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [espacosAtualizados, setEspacosAtualizados] = useState([]);
  const [diasComReserva, setDiasComReserva] = useState({});
  const [professores, setProfessores] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalReservas: 0,
    reservasHoje: 0,
    espacosDisponiveis: 0,
    totalProfessores: 0,
    espacosEmUso: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    carregarDadosIniciais();
    
    // Configurar atualização automática a cada 30 segundos
    const intervalId = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    carregarDadosAtualizados();
  }, [lastUpdate]);

  useEffect(() => {
    atualizarReservasDoDia(selectedDay);
  }, [selectedDay, reservas]);

  useEffect(() => {
    atualizarEstatisticas();
  }, [reservas, espacos, professores, selectedDay, espacosAtualizados]);

  const carregarDadosAtualizados = async () => {
    try {
      // Atualizar reservas para verificar mudanças de status
      const reservasResponse = await api.get('/reservas');
      let reservasData = reservasResponse.data;

      // Filtrar reservas se o usuário for professor (não admin)
      if (!isAdmin() && user) {
        reservasData = reservasData.filter(reserva => 
          reserva.professor && reserva.professor.id === user.id
        );
      }

      // Corrigir o problema de data
      const reservasCorrigidas = reservasData.map(reserva => {
        if (typeof reserva.data === 'string') {
          const [ano, mes, dia] = reserva.data.split('-');
          reserva.dataObj = new Date(ano, mes - 1, dia);
        }
        return reserva;
      });

      setReservas(reservasCorrigidas);
      
      // Atualizar espaços também para verificar disponibilidade
      const espacosResponse = await api.get('/espacos');
      const espacosData = espacosResponse.data;
      setEspacos(espacosData);
      
      atualizarStatusEspacos(reservasCorrigidas, espacosData);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const atualizarEstatisticas = () => {
    const totalReservas = reservas.filter(r => r.status !== 'CANCELADO').length;
    const reservasHoje = calcularReservasHoje(reservas);
    
    // Calcular espaços em uso e disponíveis corretamente
    const espacosEmUso = espacosAtualizados.filter(e => e.emUso).length;
    // Espaços disponíveis são aqueles que estão marcados como disponíveis E não estão em uso no momento
    const espacosDisponiveis = espacosAtualizados.filter(e => e.disponivel && !e.emUso).length;
    
    const totalProfessores = professores.length;

    setEstatisticas({
      totalReservas,
      reservasHoje,
      espacosDisponiveis,
      totalProfessores,
      espacosEmUso
    });
  };

  const carregarDadosIniciais = async () => {
    try {
      // Carregar espaços
      const espacosResponse = await api.get('/espacos');
      const espacosData = espacosResponse.data;
      setEspacos(espacosData);

      // Carregar reservas
      const reservasResponse = await api.get('/reservas');
      let reservasData = reservasResponse.data;

      // Filtrar reservas se o usuário for professor (não admin)
      if (!isAdmin() && user) {
        reservasData = reservasData.filter(reserva => 
          reserva.professor && reserva.professor.id === user.id
        );
      }

      // Corrigir o problema de data
      const reservasCorrigidas = reservasData.map(reserva => {
        if (typeof reserva.data === 'string') {
          const [ano, mes, dia] = reserva.data.split('-');
          reserva.dataObj = new Date(ano, mes - 1, dia);
        }
        return reserva;
      });

      setReservas(reservasCorrigidas);
      atualizarStatusEspacos(reservasCorrigidas, espacosData);

      // Marcar dias com reservas no calendário
      const diasComReservas = {};
      reservasCorrigidas
        .filter(r => r.status !== 'CANCELADO')
        .forEach(r => {
          if (r.data) {
            diasComReservas[r.data] = true;
          }
        });
      setDiasComReserva(diasComReservas);

      // Carregar professores (independente de ser admin ou não)
      const professoresResponse = await api.get('/professores');
      setProfessores(professoresResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const atualizarReservasDoDia = (dia) => {
    const agora = new Date();
    const reservasFiltradas = reservas.filter(reserva => {
      let dataReserva;
      if (reserva.dataObj) {
        dataReserva = reserva.dataObj;
      } else if (typeof reserva.data === 'string') {
        const [ano, mes, diaReserva] = reserva.data.split('-');
        dataReserva = new Date(ano, mes - 1, diaReserva);
      } else {
        return false;
      }
      
      return (
        dataReserva.getDate() === dia.getDate() &&
        dataReserva.getMonth() === dia.getMonth() &&
        dataReserva.getFullYear() === dia.getFullYear()
      );
    }).map(reserva => {
      // Verificar se a reserva está "Em Uso" atualmente
      let dataReserva = reserva.dataObj || new Date(reserva.data);
      const horaInicial = new Date(new Date(dataReserva).setHours(...reserva.horaInicial.split(':'), 0));
      const horaFinal = new Date(new Date(dataReserva).setHours(...reserva.horaFinal.split(':'), 0));
      
      // Adicionar status "Em Uso" se a hora atual estiver dentro do período da reserva e não estiver marcada como utilizada
      const emUso = agora >= horaInicial && agora <= horaFinal && 
                    reserva.status !== 'CANCELADO' && 
                    !reserva.utilizado;
      
      return {
        ...reserva,
        emUso
      };
    });

    setReservasDoDia(reservasFiltradas);
    atualizarStatusEspacos(reservas, espacos); // Atualiza para todas as reservas, não apenas do dia
  };

  const verificarDiaComReserva = (date) => {
    return diasComReserva[format(date, 'yyyy-MM-dd')];
  };

  const atualizarStatusEspacos = (reservas, espacos) => {
    const agora = new Date();
    const espacosAtualizados = espacos.map(espaco => {
      const reservasDoEspaco = reservas.filter(r => r.espacoAcademico.id === espaco.id);
      
      // Verifica se o espaço está em uso neste momento
      const emUso = reservasDoEspaco.some(reserva => {
        const dataReserva = reserva.dataObj || new Date(reserva.data);
        const horaInicial = new Date(new Date(dataReserva).setHours(...reserva.horaInicial.split(':'), 0));
        const horaFinal = new Date(new Date(dataReserva).setHours(...reserva.horaFinal.split(':'), 0));
        
        // Um espaço está em uso se a hora atual estiver no período da reserva, 
        // a reserva não estiver cancelada e não estiver marcada como utilizada
        return agora >= horaInicial && 
               agora <= horaFinal && 
               reserva.status !== 'CANCELADO' && 
               !reserva.utilizado;
      });

      return {
        ...espaco,
        emUso
      };
    });

    setEspacosAtualizados(espacosAtualizados);
  };

  const filtrarReservasPorDia = (dia) => {
    return reservas.filter(reserva => {
      let dataReserva;
      if (reserva.dataObj) {
        dataReserva = reserva.dataObj;
      } else if (typeof reserva.data === 'string') {
        const [ano, mes, diaReserva] = reserva.data.split('-');
        dataReserva = new Date(ano, mes - 1, diaReserva);
      } else {
        return false;
      }

      return (
        dataReserva.getDate() === dia.getDate() &&
        dataReserva.getMonth() === dia.getMonth() &&
        dataReserva.getFullYear() === dia.getFullYear()
      );
    });
  };

  const calcularReservasHoje = (reservas) => {
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();

    return reservas.filter(reserva => {
      let dataReserva;
      if (reserva.dataObj) {
        dataReserva = reserva.dataObj;
      } else if (typeof reserva.data === 'string') {
        const [ano, mes, dia] = reserva.data.split('-');
        dataReserva = new Date(ano, mes - 1, dia);
      } else {
        return false;
      }

      return (
        dataReserva.getDate() === diaHoje &&
        dataReserva.getMonth() === mesHoje &&
        dataReserva.getFullYear() === anoHoje &&
        reserva.status !== 'CANCELADO'
      );
    }).length;
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClick = (day) => {
    setSelectedDay(day);
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
        const hasReservation = verificarDiaComReserva(cloneDay);

        days.push(
          <div
            key={format(cloneDay, 'T')}
            className={`calendar-day ${!isSameMonth(day, monthStart) ? 'disabled' : ''} 
              ${isSameDay(day, selectedDay) ? 'selected' : ''} 
              ${hasReservation ? 'has-reservation' : ''}`}
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

  // Função para determinar o status da reserva para exibição
  const getStatusReserva = (reserva) => {
    if (reserva.utilizado) {
      return { label: "Utilizado", color: "#4caf50" };
    } else if (reserva.emUso) {
      return { label: "Em Uso", color: "#2196f3" };
    } else if (reserva.status === 'CANCELADO') {
      return { label: "Cancelado", color: "#f44336" };
    } else {
      return { label: "Pendente", color: "#ff9800" };
    }
  };

  // Função para forçar a atualização dos dados
  const forcarAtualizacao = () => {
    setLastUpdate(new Date());
  };

  return (
    <div>
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
              {estatisticas.espacosDisponiveis} disponíveis
            </Typography>
            <Typography color="textSecondary">
              {estatisticas.espacosEmUso} em uso
            </Typography>
          </Paper>

          {isAdmin() && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Professores Cadastrados
              </Typography>
              <Typography variant="h3">
                {estatisticas.totalProfessores}
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reservas Hoje
            </Typography>
            <Typography variant="h3">
              {estatisticas.reservasHoje}
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
                {reservasDoDia.map((reserva, index) => {
                  const status = getStatusReserva(reserva);
                  return (
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
                          label={status.label}
                          color={typeof status.color === 'string' ? 'default' : status.color}
                          sx={typeof status.color === 'string' ? { bgcolor: status.color, color: 'white' } : {}}
                        />
                      </Box>
                    </Box>
                  );
                })}
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