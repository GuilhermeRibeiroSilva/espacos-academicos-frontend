import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'; // Adicione esta importação
import { 
  Box, Typography, Grid, Paper, Card, CardContent, 
  CardHeader, Divider, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button 
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';

const Dashboard = () => {
  const { auth, isAdmin } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate(); // Adicione esta linha
  const [reservas, setReservas] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalReservas: 0,
    reservasHoje: 0,
    espacosDisponiveis: 0,
    totalProfessores: 0,
    espacosEmUso: 0
  });

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    showLoading('Carregando dados...');
    try {
      // Carregar espaços
      const espacosResponse = await api.get('/espacos');
      const espacosData = espacosResponse.data;
      setEspacos(espacosData);

      // Carregar reservas
      const reservasResponse = await api.get('/reservas');
      let reservasData = reservasResponse.data;

      // As reservas já vêm filtradas do backend conforme o tipo de usuário
      const reservasCorrigidas = reservasData.map(reserva => {
        reserva.dataObj = normalizarData(reserva.data);
        return reserva;
      });

      setReservas(reservasCorrigidas);
      
      // Carregar professores somente se for admin
      if (auth.isAdmin) {
        const professoresResponse = await api.get('/professores');
        setProfessores(professoresResponse.data);
      } else if (auth.isProfessor) {
        // Se for professor, colocamos apenas ele mesmo na lista
        setProfessores([{
          id: auth.user.professorId,
          nome: auth.user.professorNome
        }]);
      }
      
      atualizarEstatisticas(reservasCorrigidas, espacosData, professores);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      hideLoading();
    }
  };
  
  const normalizarData = (dataString) => {
    if (!dataString) return null;
    try {
      // Garantir formato consistente
      if (typeof dataString === 'string') {
        const [ano, mes, dia] = dataString.split('-');
        return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      }
      return new Date(dataString);
    } catch (e) {
      console.error("Erro ao normalizar data:", e);
      return null;
    }
  };
  
  const atualizarEstatisticas = (reservas, espacos, professores) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const reservasAtivas = reservas.filter(r => r.status !== 'CANCELADO');
    const reservasHoje = reservasAtivas.filter(r => {
      const data = r.dataObj;
      if (!data) return false;
      return data.getTime() === hoje.getTime();
    });
    
    const espacosDisponiveis = espacos.filter(e => e.disponivel).length;
    const espacosEmUso = new Set(
      reservasHoje
        .filter(r => {
          const agora = new Date();
          const horaInicial = r.horaInicial.substring(0, 5);
          const horaFinal = r.horaFinal.substring(0, 5);
          const [horaInicialH, horaInicialM] = horaInicial.split(':').map(Number);
          const [horaFinalH, horaFinalM] = horaFinal.split(':').map(Number);
          
          const inicioReserva = new Date(hoje);
          inicioReserva.setHours(horaInicialH, horaInicialM, 0);
          
          const fimReserva = new Date(hoje);
          fimReserva.setHours(horaFinalH, horaFinalM, 0);
          
          return agora >= inicioReserva && agora <= fimReserva;
        })
        .map(r => r.espacoAcademico.id)
    ).size;
    
    setEstatisticas({
      totalReservas: reservasAtivas.length,
      reservasHoje: reservasHoje.length,
      espacosDisponiveis,
      totalProfessores: professores.length,
      espacosEmUso
    });
  };
  
  // Resto do componente com a interface...

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cards de estatísticas */}
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {estatisticas.totalReservas}
              </Typography>
              <Typography color="text.secondary">
                Reservas Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Outras estatísticas... */}
        
        {/* Conteúdo específico por tipo de usuário */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {auth.isAdmin 
                ? 'Gerenciamento do Sistema' 
                : 'Minhas Reservas Recentes'}
            </Typography>
            
            {auth.isAdmin ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/espacos')}
                  >
                    Gerenciar Espaços
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/professores')}
                  >
                    Gerenciar Professores
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/usuarios')}
                  >
                    Gerenciar Usuários
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Espaço</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Horário</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Exibir reservas do professor logado */}
                    {reservas.slice(0, 5).map((reserva) => (
                      <TableRow key={reserva.id}>
                        <TableCell>
                          {reserva.espacoAcademico.sigla} - {reserva.espacoAcademico.nome}
                        </TableCell>
                        <TableCell>
                          {format(normalizarData(reserva.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {reserva.horaInicial.substring(0, 5)} às {reserva.horaFinal.substring(0, 5)}
                        </TableCell>
                        <TableCell>
                          {reserva.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;