import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Paper,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';

const FormReserva = () => {
    const [espacos, setEspacos] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [formData, setFormData] = useState({
        espacoAcademico: '',
        professor: '',
        data: null,
        horaInicial: null,
        horaFinal: null
    });

    useEffect(() => {
        carregarEspacos();
        carregarProfessores();
    }, []);

    const carregarEspacos = async () => {
        try {
            const response = await api.get('/espacos');
            setEspacos(response.data.filter(espaco => espaco.disponivel));
        } catch (error) {
            console.error('Erro ao carregar espaços:', error);
        }
    };

    const carregarProfessores = async () => {
        try {
            const response = await api.get('/professores');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reservas', {
                espacoAcademico: { id: formData.espacoAcademico },
                professor: { id: formData.professor },
                data: formData.data.toISOString().split('T')[0],
                horaInicial: formData.horaInicial.toTimeString().slice(0, 8),
                horaFinal: formData.horaFinal.toTimeString().slice(0, 8),
                utilizado: false
            });
            alert('Reserva realizada com sucesso!');
            // Limpar formulário
            setFormData({
                espacoAcademico: '',
                professor: '',
                data: null,
                horaInicial: null,
                horaFinal: null
            });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            alert('Erro ao criar reserva');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Nova Reserva
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Espaço Acadêmico</InputLabel>
                    <Select
                        value={formData.espacoAcademico}
                        label="Espaço Acadêmico"
                        onChange={(e) => setFormData({...formData, espacoAcademico: e.target.value})}
                        required
                    >
                        {espacos.map(espaco => (
                            <MenuItem key={espaco.id} value={espaco.id}>
                                {espaco.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Professor</InputLabel>
                    <Select
                        value={formData.professor}
                        label="Professor"
                        onChange={(e) => setFormData({...formData, professor: e.target.value})}
                        required
                    >
                        {professores.map(professor => (
                            <MenuItem key={professor.id} value={professor.id}>
                                {professor.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <Box sx={{ mt: 2 }}>
                        <DatePicker
                            label="Data"
                            value={formData.data}
                            onChange={(newValue) => setFormData({...formData, data: newValue})}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <TimePicker
                            label="Hora Inicial"
                            value={formData.horaInicial}
                            onChange={(newValue) => setFormData({...formData, horaInicial: newValue})}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <TimePicker
                            label="Hora Final"
                            value={formData.horaFinal}
                            onChange={(newValue) => setFormData({...formData, horaFinal: newValue})}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Box>
                </LocalizationProvider>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Criar Reserva
                </Button>
            </Box>
        </Paper>
    );
};

export default FormReserva;