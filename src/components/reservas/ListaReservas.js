import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Button,
    Typography,
    Chip
} from '@mui/material';
import api from '../../services/api';

const ListaReservas = () => {
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        carregarReservas();
    }, []);

    const carregarReservas = async () => {
        try {
            const response = await api.get('/reservas');
            setReservas(response.data);
        } catch (error) {
            console.error('Erro ao carregar reservas:', error);
        }
    };

    const confirmarUtilizacao = async (id) => {
        try {
            await api.patch(`/reservas/${id}/confirmar-utilizacao`);
            carregarReservas(); // Recarrega a lista
            alert('Utilização confirmada com sucesso!');
        } catch (error) {
            console.error('Erro ao confirmar utilização:', error);
            alert('Erro ao confirmar utilização');
        }
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarHora = (hora) => {
        return hora.substring(0, 5); // Formato HH:mm
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Reservas de Espaços Acadêmicos
            </Typography>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Espaço</TableCell>
                            <TableCell>Professor</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Horário</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservas.map((reserva) => (
                            <TableRow key={reserva.id}>
                                <TableCell>{reserva.espacoAcademico.nome}</TableCell>
                                <TableCell>{reserva.professor.nome}</TableCell>
                                <TableCell>{formatarData(reserva.data)}</TableCell>
                                <TableCell>
                                    {formatarHora(reserva.horaInicial)} - {formatarHora(reserva.horaFinal)}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={reserva.utilizado ? "Utilizado" : "Pendente"}
                                        color={reserva.utilizado ? "success" : "warning"}
                                    />
                                </TableCell>
                                <TableCell>
                                    {!reserva.utilizado && (
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            onClick={() => confirmarUtilizacao(reserva.id)}
                                        >
                                            Confirmar Utilização
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ListaReservas;