import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Tooltip,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { format, isSameDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Componente estilizado para células do calendário com reservas
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Dashboard = () => {
  const { auth } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [professorCount, setProfessorCount] = useState(0);
  const [espacosCount, setEspacosCount] = useState(0);
  const [reservasHoje, setReservasHoje] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);
  
  // Busca de dados ao carregar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Buscar todas as reservas
        const reservasResponse = await api.get('/reservas');
        setReservas(reservasResponse.data);
        
        // Contar reservas de hoje
        const hoje = new Date();
        const reservasDeHoje = reservasResponse.data.filter(reserva => 
          isSameDay(new Date(reserva.dataReserva), hoje)
        );
        setReservasHoje(reservasDeHoje.length);
        
        if (auth.isAdmin) {
          // Dados específicos para admin
          const professoresResponse = await api.get('/professores');
          setProfessorCount(professoresResponse.data.length);
          
          const espacosResponse = await api.get('/espacos');
          setEspacosCount(espacosResponse.data.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };
    
    fetchDashboardData();
  }, [auth.isAdmin]);
  
  // Atualiza as reservas do dia selecionado
  useEffect(() => {
    const filtrarReservasDoDia = () => {
      const reservasFiltradas = reservas.filter(reserva => 
        isSameDay(new Date(reserva.dataReserva), selectedDate)
      );
      
      // Se for professor, filtrar apenas as reservas dele
      if (!auth.isAdmin && auth.user && auth.user.professorId) {
        return reservasFiltradas.filter(r => r.professorId === auth.user.professorId);
      }
      
      return reservasFiltradas;
    };
    
    setReservasDoDia(filtrarReservasDoDia());
  }, [selectedDate, reservas, auth.isAdmin, auth.user]);
  
  // Função de renderização personalizada para o calendário
  const renderDayWithReservas = (day, _values, DayComponentProps) => {
    const reservasNoDia = reservas.filter(reserva => {
      const dataReserva = new Date(reserva.dataReserva);
      return isSameDay(dataReserva, day);
    });
    
    // Filtra apenas as reservas do professor atual se não for admin
    let count = reservasNoDia.length;
    if (!auth.isAdmin && auth.user && auth.user.professorId) {
      count = reservasNoDia.filter(r => r.professorId === auth.user.professorId).length;
    }
    
    return (
      <Tooltip 
        title={count > 0 ? `${count} reserva(s)` : 'Nenhuma reserva'} 
        arrow
      >
        <StyledBadge
          color="primary"
          badgeContent={count > 0 ? count : null}
        >
          <div {...DayComponentProps} />
        </StyledBadge>
      </Tooltip>
    );
  };
  
  // Função para obter apenas o primeiro e último nome do professor
  const formatarNomeProfessor = (nomeCompleto) => {
    if (!nomeCompleto) return '';
    
    const nomes = nomeCompleto.trim().split(' ');
    if (nomes.length === 1) return nomes[0]; // Se for apenas um nome
    
    return `${nomes[0]} ${nomes[nomes.length - 1]}`; // Primeiro e último nome
  };

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
                  Espaços em Uso: {}
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
        
        {/* Calendário */}
        <Grid item xs={12} md={auth.isAdmin ? 8 : 6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Cronograma de Reservas
            </Typography>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              '& .MuiPickersLayout-root': {
                width: '100%', 
                maxWidth: '100%',
                '& .MuiPickersLayout-contentWrapper': {
                  width: '100%',
                  '& .MuiDateCalendar-root': {
                    width: '100%',
                    maxHeight: 'none'
                  }
                }
              },
              '& .MuiDayCalendar-header, .MuiDayCalendar-weekContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiPickersDay-root': {
                fontSize: '0.9rem',
                margin: '2px 0',
                height: 30,
                width: 30
              }
            }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderDay={renderDayWithReservas}
                  slots={{
                    actionBar: () => null // Remove a barra de ações
                  }}
                  slotProps={{
                    day: {
                      sx: { 
                        fontSize: '0.9rem',
                        width: 40,
                        height: 40,
                        margin: '1px'
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Paper>
        </Grid>
        
        {/* Reservas do dia selecionado */}
        <Grid item xs={12} md={auth.isAdmin ? 12 : 6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reservas do dia: {format(selectedDate, 'dd/MM/yyyy')}
            </Typography>
            
            {reservasDoDia.length > 0 ? (
              <Grid container spacing={2} mt={1}>
                {reservasDoDia.map((reserva) => (
                  <Grid item xs={12} sm={6} md={4} key={reserva.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {reserva.espacoAcademico?.sigla || ''} - {reserva.espacoNome || 'Espaço não especificado'}
                        </Typography>
                        <Typography variant="body2">
                          Horário: {format(new Date(reserva.horaInicio), 'HH:mm')} - 
                                  {format(new Date(reserva.horaFim), 'HH:mm')}
                        </Typography>
                        {auth.isAdmin && (
                          <Typography variant="body2">
                            Professor: {formatarNomeProfessor(reserva.professorNome) || 'Não informado'}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          Finalidade: {reserva.finalidade || 'Não informada'}
                        </Typography>
                        <Typography variant="body2">
                          Escola/Disciplina: {reserva.professor?.escola || 'Não informada'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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