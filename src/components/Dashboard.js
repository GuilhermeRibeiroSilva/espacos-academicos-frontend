import React, { useState, useEffect } from 'react';
import { 
    Grid, 
    Paper, 
    Typography, 
    Card, 
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Chip
} from '@mui/material';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEspacos: 0,
        espacosDisponiveis: 0,
        totalProfessores: 0,
        reservasHoje: []
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            // Carregar dados dos espaços
            const espacosResponse = await api.get('/espacos');
            const espacos = espacosResponse.data;
            
            // Carregar dados dos professores
            const professoresResponse = await api.get('/professores');
            
            // Carregar reservas do dia
            const reservasResponse = await api.get('/reservas');
            const hoje = new Date().toISOString().split('T')[0];
            const reservasHoje = reservasResponse.data.filter(
                reserva => reserva.data === hoje
            );

            setStats({
                totalEspacos: espacos.length,
                espacosDisponiveis: espacos.filter(e => e.disponivel).length,
                totalProfessores: professoresResponse.data.length,
                reservasHoje
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const formatarHora = (hora) => {
        return hora.substring(0, 5); // Formato HH:mm
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Cards de Estatísticas */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Espaços Acadêmicos
                            </Typography>
                            <Typography variant="h5">
                                {stats.totalEspacos}
                            </Typography>
                            <Typography color="textSecondary">
                                {stats.espacosDisponiveis} disponíveis
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Professores Cadastrados
                            </Typography>
                            <Typography variant="h5">
                                {stats.totalProfessores}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Reservas Hoje
                            </Typography>
                            <Typography variant="h5">
                                {stats.reservasHoje.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Lista de Reservas do Dia */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Reservas para Hoje
                        </Typography>
                        <List>
                            {stats.reservasHoje.length > 0 ? (
                                stats.reservasHoje.map((reserva, index) => (
                                    <React.Fragment key={reserva.id}>
                                        {index > 0 && <Divider />}
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1">
                                                            {reserva.espacoAcademico.nome}
                                                        </Typography>
                                                        <Chip 
                                                            label={reserva.utilizado ? "Utilizado" : "Pendente"}
                                                            color={reserva.utilizado ? "success" : "warning"}
                                                            size="small"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            Professor: {reserva.professor.nome}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            Horário: {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText 
                                        primary="Não há reservas para hoje"
                                        secondary="Os espaços estão todos disponíveis"
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default Dashboard;