import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { format, isSameDay, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Componente estilizado para células do calendário com reservas (CORRIGIDO)
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: '#0F1140',
    color: 'white',
    minWidth: '16px',
    height: '16px',
    borderRadius: '50%', // Forçar formato circular
    fontSize: '0.65rem',
    zIndex: 1000, // Aumentar zIndex para garantir visibilidade
    pointerEvents: 'none', // Evitar que o badge interfira nos cliques do dia
  },
}));

// Componente para exibir o status como chips coloridos
const StatusChip = styled(Chip)(({ status }) => {
  // Define a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case 'PENDENTE':
      case 'AGENDADO':
        return { bg: '#FFA726', color: '#fff' };
      case 'EM_USO':
        return { bg: '#42A5F5', color: '#fff' };
      case 'AGUARDANDO_CONFIRMACAO':
        return { bg: '#9EA5B5', color: '#fff' };
      case 'UTILIZADO':
        return { bg: '#66BB6A', color: '#fff' };
      case 'CANCELADO':
        return { bg: '#f44336', color: '#fff' };
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

// Estilização da tabela similar ao ListaReservas
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

// Estilo para destacar dias com reserva no calendário
const HighlightedDay = styled('div')(({ isHighlighted, theme }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}));

const Dashboard = () => {
  const { auth } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [professorCount, setProfessorCount] = useState(0);
  const [espacosCount, setEspacosCount] = useState(0);
  const [espacosEmUso, setEspacosEmUso] = useState(0);
  const [reservasHoje, setReservasHoje] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [diasComReserva, setDiasComReserva] = useState({}); // Para mapear dias com reservas

  // Função para formatar hora para exibição
  const formatarHora = (horaString) => {
    if (!horaString) return '';
    
    // Se já for no formato HH:MM:SS ou HH:MM
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(horaString)) {
      return horaString.substring(0, 5); // Formato HH:MM
    }
    
    // Se for uma string ISO
    try {
      const data = parseISO(horaString);
      if (isNaN(data.getTime())) return ''; // Data inválida
      return format(data, 'HH:mm');
    } catch (error) {
      console.error("Erro ao formatar hora:", error);
      return '';
    }
  };

  // Função para formatar a data corretamente
  const formatarData = (dataString) => {
    if (!dataString) return '';
    
    try {
      // Garantir que a data seja tratada como UTC para evitar conversões automáticas
      const data = new Date(dataString + 'T12:00:00Z');
      
      const dia = String(data.getUTCDate()).padStart(2, '0');
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return '';
    }
  };

  // Função para calcular status atual com base na data/hora
  const calcularStatusAtual = (reserva) => {
    try {
      const hoje = new Date();
      
      // Extrair data da reserva
      let dataReserva;
      try {
        dataReserva = parseISO(reserva.data || reserva.dataReserva);
        if (isNaN(dataReserva.getTime())) {
          // Se a data estiver em formato DD/MM/YYYY, converter
          const [dia, mes, ano] = (reserva.data || reserva.dataReserva).split('/');
          dataReserva = new Date(ano, mes - 1, dia);
        }
      } catch (e) {
        console.error("Erro ao parsear data:", e);
        dataReserva = new Date(); // Fallback para data atual
      }
      
      // Se a reserva foi cancelada, mantém cancelada
      if (reserva.status === 'CANCELADO') {
        return 'CANCELADO';
      }
      
      // Converter strings de hora para objetos Date para comparação
      let horaInicio, horaFim;

      if (reserva.horaInicio || reserva.horaInicial) {
        const horaString = reserva.horaInicio || reserva.horaInicial;
        try {
          const [horas, minutos] = horaString.split(':').map(Number);
          horaInicio = new Date(dataReserva);
          horaInicio.setHours(horas || 0, minutos || 0, 0);
        } catch (e) {
          console.error("Erro ao processar hora inicial:", e);
        }
      }

      if (reserva.horaFim || reserva.horaFinal) {
        const horaString = reserva.horaFim || reserva.horaFinal;
        try {
          const [horas, minutos] = horaString.split(':').map(Number);
          horaFim = new Date(dataReserva);
          horaFim.setHours(horas || 0, minutos || 0, 0);
        } catch (e) {
          console.error("Erro ao processar hora final:", e);
        }
      }

      // Se a data da reserva é anterior a hoje
      if (dataReserva.toDateString() !== hoje.toDateString() && dataReserva < hoje) {
        return reserva.status === 'UTILIZADO' ? 'UTILIZADO' : 'AGUARDANDO_CONFIRMACAO';
      }

      // Se a data da reserva é hoje
      if (dataReserva.toDateString() === hoje.toDateString()) {
        // Se passou do horário final
        if (horaFim && hoje > horaFim) {
          return reserva.status === 'UTILIZADO' ? 'UTILIZADO' : 'AGUARDANDO_CONFIRMACAO';
        }
        // Se está entre horário inicial e final
        else if (horaInicio && horaFim && hoje >= horaInicio && hoje <= horaFim) {
          return 'EM_USO';
        }
        // Se ainda não chegou no horário inicial
        else if (horaInicio && hoje < horaInicio) {
          return 'AGENDADO';
        }
      }
      
      // Para datas futuras
      if (dataReserva > hoje) {
        return 'AGENDADO';
      }
      
      // Converter PENDENTE para AGENDADO
      if (reserva.status === 'PENDENTE') {
        return 'AGENDADO';
      }
      
      return reserva.status || 'AGENDADO';
    } catch (error) {
      console.error("Erro ao calcular status:", error);
      return (reserva.status === 'PENDENTE' ? 'AGENDADO' : reserva.status) || 'AGENDADO';
    }
  };
  
  // Busca de dados ao carregar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Buscar todas as reservas
        const reservasResponse = await api.get('/reservas');
        
        // Atualizar status das reservas
        const reservasProcessadas = reservasResponse.data.map(reserva => ({
          ...reserva,
          statusAtual: calcularStatusAtual(reserva)
        }));
        
        setReservas(reservasProcessadas);
        
        // Criar mapa de dias com reservas para melhorar a performance do renderDay
        const diasMap = {};
        
        reservasProcessadas.forEach(reserva => {
          try {
            // Tentar diferentes formatos de data
            let dataReserva;
            const dataStr = reserva.data || reserva.dataReserva;
            
            if (dataStr.includes('-')) { // Formato ISO
              dataReserva = parseISO(dataStr);
            } else if (dataStr.includes('/')) { // Formato DD/MM/YYYY
              const [dia, mes, ano] = dataStr.split('/').map(Number);
              dataReserva = new Date(ano, mes - 1, dia);
            }
            
            if (dataReserva && !isNaN(dataReserva.getTime())) {
              const dateKey = format(dataReserva, 'yyyy-MM-dd');
              
              // Se for professor, verificar se a reserva é dele
              if (!auth.isAdmin && auth.user?.professorId) {
                const professorId = auth.user.professorId;
                if (
                  reserva.professorId === professorId || 
                  reserva.professor?.id === professorId
                ) {
                  diasMap[dateKey] = (diasMap[dateKey] || 0) + 1;
                }
              } else {
                // Se for admin, contar todas as reservas
                diasMap[dateKey] = (diasMap[dateKey] || 0) + 1;
              }
            }
          } catch (e) {
            console.error("Erro ao processar data da reserva:", e);
          }
        });
        
        setDiasComReserva(diasMap);
        
        // Contar reservas de hoje
        const hoje = new Date();
        const reservasDeHoje = reservasProcessadas.filter(reserva => {
          try {
            const dataReserva = parseISO(reserva.data || reserva.dataReserva);
            return isSameDay(dataReserva, hoje);
          } catch (e) {
            return false;
          }
        });
        
        setReservasHoje(reservasDeHoje.length);
        
        // Contar espaços atualmente em uso
        const emUso = reservasDeHoje.filter(reserva => 
          reserva.statusAtual === 'EM_USO'
        ).length;
        
        setEspacosEmUso(emUso);
        
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
    
    // Atualizar o dashboard a cada minuto
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, [auth.isAdmin, auth.user]);
  
  // Atualiza as reservas do dia selecionado
  useEffect(() => {
    const filtrarReservasDoDia = () => {
      // Filtrar reservas pela data selecionada
      const reservasFiltradas = reservas.filter(reserva => {
        try {
          const dataReserva = parseISO(reserva.data || reserva.dataReserva);
          return isSameDay(dataReserva, selectedDate);
        } catch (e) {
          try {
            // Tentar um formato alternativo DD/MM/YYYY
            if (typeof (reserva.data || reserva.dataReserva) === 'string') {
              const [dia, mes, ano] = (reserva.data || reserva.dataReserva).split('/');
              const dataAlternativa = new Date(ano, mes - 1, dia);
              return isSameDay(dataAlternativa, selectedDate);
            }
          } catch (err) {
            // Se ambas as abordagens falharem, ignorar a reserva
          }
          return false;
        }
      });
      
      // Se for professor, filtrar apenas as reservas dele
      if (!auth.isAdmin && auth.user && auth.user.professorId) {
        return reservasFiltradas.filter(r => 
          r.professorId === auth.user.professorId || 
          r.professor?.id === auth.user.professorId
        );
      }
      
      return reservasFiltradas;
    };
    
    setReservasDoDia(filtrarReservasDoDia());
  }, [selectedDate, reservas, auth.isAdmin, auth.user]);
  
  // Função de renderização personalizada para o calendário (CORRIGIDA)
  const renderDayWithReservas = (day, _values, DayComponentProps) => {
    // Verificar se há reservas neste dia usando o mapa pré-calculado
    const dateKey = format(day, 'yyyy-MM-dd');
    const count = diasComReserva[dateKey] || 0;
    
    // Retornar a célula do calendário com o badge
    return (
      <HighlightedDay>
        <StyledBadge
          color="primary"
          badgeContent={count > 0 ? count : null}
          showZero={false}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              display: count > 0 ? 'flex' : 'none',
            }
          }}
        >
          <div {...DayComponentProps} />
        </StyledBadge>
      </HighlightedDay>
    );
  };
  
  // Função para obter apenas o primeiro e último nome do professor
  const formatarNomeProfessor = (nomeCompleto) => {
    if (!nomeCompleto) return '';
    
    const nomes = nomeCompleto.trim().split(' ');
    if (nomes.length === 1) return nomes[0]; // Se for apenas um nome
    
    return `${nomes[0]} ${nomes[nomes.length - 1]}`; // Primeiro e último nome
  };

  // Traduzir status para exibição
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE': 
      case 'AGENDADO': return 'Agendado';
      case 'EM_USO': return 'Em uso';
      case 'AGUARDANDO_CONFIRMACAO': return 'Aguardando confirmação';
      case 'UTILIZADO': return 'Utilizado';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
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
                        width: 34,
                        height: 34,
                        margin: '3px',
                        borderRadius: '50%', // Forma circular para os dias
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Paper>
        </Grid>
        
        {/* Reservas do dia selecionado - Formatado como ListaReservas */}
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