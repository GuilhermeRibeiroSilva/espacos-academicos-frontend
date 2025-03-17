import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    MenuItem,
    FormControl,
    Select,
    styled,
    Alert,
    InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

// Componentes estilizados
const FormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#0F1140',
    borderRadius: '10px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
}));

const PageTitle = styled(Typography)({
    color: '#0F1140',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
});

const FormLabel = styled(Typography)({
    color: 'white',
    marginBottom: '8px',
    fontSize: '16px',
});

const StyledSelect = styled(Select)({
    backgroundColor: '#F2EEFF',
    borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    marginBottom: '20px',
});

const StyledDatePicker = styled(DatePicker)({
    '& .MuiInputBase-root': {
        backgroundColor: '#F2EEFF',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#E8E2FF',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    marginBottom: '20px',
});

const StyledTimePicker = styled(TimePicker)({
    '& .MuiInputBase-root': {
        backgroundColor: '#F2EEFF',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#E8E2FF',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    marginBottom: '20px',
});

const StyledTextField = styled(TextField)({
    backgroundColor: '#F2EEFF',
    borderRadius: '8px',
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: 'none',
        },
    },
    marginBottom: '20px',
    '& input': {
        padding: '15px',
    }
});

const ButtonContainer = styled(Box)({
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '30px',
    width: '100%',
});

const ActionButton = styled(Button)(({ variant }) => ({
    flex: 1,
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    backgroundColor: variant === 'contained' ? '#F2EEFF' : 'transparent',
    color: variant === 'contained' ? '#0F1140' : '#F2EEFF',
    border: variant === 'contained' ? 'none' : '1px solid #F2EEFF',
    '&:hover': {
        backgroundColor: variant === 'contained' ? '#E5E0FF' : 'rgba(242, 238, 255, 0.1)',
    },
}));

const FormReserva = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [espacos, setEspacos] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [formData, setFormData] = useState({
        espacoAcademico: '',
        professor: '',
        data: null,
        horaInicial: null,
        horaFinal: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const logError = (error, message) => {
        console.error(message, error);
        console.log('Detalhes do erro:');
        console.log('Status:', error.response?.status);
        console.log('Mensagem:', error.response?.data?.message || error.message);
        console.log('Dados:', error.response?.data);

        setError(`${message}: ${error.response?.data?.message || error.message}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([carregarEspacos(), carregarProfessores()]);

                if (id) {
                    await carregarReserva(id);
                }
            } catch (error) {
                logError(error, "Erro ao carregar dados iniciais");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const carregarEspacos = async () => {
        try {
            const response = await api.get('/espacos');
            setEspacos(response.data.filter(espaco => espaco.disponivel));
            return response;
        } catch (error) {
            logError(error, 'Erro ao carregar espaços');
            throw error;
        }
    };

    const carregarProfessores = async () => {
        try {
            const response = await api.get('/professores');
            setProfessores(response.data);
            return response;
        } catch (error) {
            logError(error, 'Erro ao carregar professores');
            throw error;
        }
    };

    const carregarReserva = async (reservaId) => {
        try {
            const response = await api.get(`/reservas/${reservaId}`);
            const reserva = response.data;

            // Converter strings para objetos Date
            const dataReserva = new Date(reserva.data);

            // Criar objetos Date para os horários
            const horaInicial = new Date();
            const horaFinal = new Date();

            // Extrair horas e minutos
            const [horaIni, minIni] = reserva.horaInicial.split(':');
            const [horaFim, minFim] = reserva.horaFinal.split(':');

            horaInicial.setHours(parseInt(horaIni), parseInt(minIni), 0);
            horaFinal.setHours(parseInt(horaFim), parseInt(minFim), 0);

            setFormData({
                espacoAcademico: reserva.espacoAcademico.id,
                professor: reserva.professor.id,
                data: dataReserva,
                horaInicial: horaInicial,
                horaFinal: horaFinal
            });

            return response;
        } catch (error) {
            logError(error, 'Erro ao carregar reserva');
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validar dados
            if (!formData.espacoAcademico || !formData.professor || !formData.data ||
                !formData.horaInicial || !formData.horaFinal) {
                throw new Error("Todos os campos são obrigatórios");
            }

            // Formatar dados para envio
            const reservaData = {
                espacoAcademico: { id: parseInt(formData.espacoAcademico) },
                professor: { id: parseInt(formData.professor) },
                data: formData.data.toISOString().split('T')[0],
                horaInicial: formData.horaInicial.toTimeString().slice(0, 5),
                horaFinal: formData.horaFinal.toTimeString().slice(0, 5),
                utilizado: false
            };

            // Enviar para API
            if (id) {
                await api.put(`/reservas/${id}`, reservaData);
            } else {
                await api.post('/reservas', reservaData);
            }

            navigate('/reservas');
        } catch (error) {
            logError(error, 'Erro ao salvar reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/reservas');
    };

    return (
        <Box sx={{ padding: 3 }}>
            <PageTitle>
                {id ? 'Editar Reserva' : 'Cadastrar Reserva'}
            </PageTitle>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        maxWidth: '600px',
                        margin: '0 auto 20px'
                    }}
                >
                    {error}
                </Alert>
            )}

            <FormContainer>
                <form onSubmit={handleSubmit}>
                    <FormLabel>Espaço Acadêmico</FormLabel>
                    <FormControl fullWidth>
                        <StyledSelect
                            value={formData.espacoAcademico}
                            onChange={(e) => setFormData({ ...formData, espacoAcademico: e.target.value })}
                            required
                            disabled={loading}
                            displayEmpty
                            renderValue={(value) => {
                                if (!value) return "Espaço Acadêmico";
                                const espaco = espacos.find(e => e.id === value);
                                return espaco ? espaco.nome : "";
                            }}
                        >
                            {espacos.map(espaco => (
                                <MenuItem key={espaco.id} value={espaco.id}>
                                    {espaco.nome}
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </FormControl>

                    <FormLabel>Professor</FormLabel>
                    <FormControl fullWidth>
                        <StyledSelect
                            value={formData.professor}
                            onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                            required
                            disabled={loading}
                            displayEmpty
                            renderValue={(value) => {
                                if (!value) return "Professor";
                                const professor = professores.find(p => p.id === value);
                                return professor ? professor.nome : "";
                            }}
                        >
                            {professores.map(professor => (
                                <MenuItem key={professor.id} value={professor.id}>
                                    {professor.nome}
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <FormLabel>Data</FormLabel>
                        <StyledDatePicker
                            value={formData.data}
                            onChange={(newValue) => setFormData({ ...formData, data: newValue })}
                            disabled={loading}
                            format="dd/MM/yyyy"
                            minDate={new Date()}
                            sx={{ width: '100%' }}
                            slots={{
                                openPickerIcon: CalendarTodayIcon
                            }}
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    fullWidth: true,
                                    placeholder: "Selecione uma data"
                                }
                            }}
                        />

                        <FormLabel>Horário Inicial</FormLabel>
                        <StyledTimePicker
                            value={formData.horaInicial}
                            onChange={(newValue) => setFormData({ ...formData, horaInicial: newValue })}
                            disabled={loading}
                            ampm={false}
                            minTime={
                                formData.data &&
                                    formData.data.toDateString() === new Date().toDateString() ?
                                    (() => {
                                        const now = new Date();
                                        now.setMinutes(now.getMinutes() + 15);
                                        return now;
                                    })() :
                                    new Date(0, 0, 0, 7)
                            }
                            maxTime={new Date(0, 0, 0, 22)}
                            sx={{ width: '100%' }}
                            slots={{
                                openPickerIcon: AccessTimeIcon
                            }}
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    fullWidth: true,
                                    placeholder: "Selecione o horário inicial"
                                }
                            }}
                        />

                        <FormLabel>Horário Final</FormLabel>
                        <StyledTimePicker
                            value={formData.horaFinal}
                            onChange={(newValue) => setFormData({ ...formData, horaFinal: newValue })}
                            disabled={loading}
                            ampm={false}
                            minTime={formData.horaInicial || new Date(0, 0, 0, 7)}
                            maxTime={new Date(0, 0, 0, 22)}
                            sx={{ width: '100%' }}
                            slots={{
                                openPickerIcon: AccessTimeIcon
                            }}
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    fullWidth: true,
                                    placeholder: "Selecione o horário final"
                                }
                            }}
                        />
                    </LocalizationProvider>

                    <ButtonContainer>
                        <ActionButton
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            variant="outlined"
                        >
                            Cancelar
                        </ActionButton>
                        <ActionButton
                            type="submit"
                            disabled={loading}
                            variant="contained"
                        >
                            {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Cadastrar')}
                        </ActionButton>
                    </ButtonContainer>
                </form>
            </FormContainer>
        </Box>
    );
};

export default FormReserva;