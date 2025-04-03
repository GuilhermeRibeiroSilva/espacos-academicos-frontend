import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, styled, Grid, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';

// Componentes estilizados para seguir o padrão do site
const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#0F1140',
  borderRadius: '10px',
  padding: '40px',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
}));

const PageTitle = styled(Typography)({
  color: '#FFFFFF',
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
  },
});

const StyledButton = styled(Button)(({ theme, variant }) => ({
  backgroundColor: variant === 'contained' ? '#F2E085' : 'transparent',
  color: variant === 'contained' ? '#0F1140' : '#F2E085',
  border: variant === 'outlined' ? '1px solid #F2E085' : 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#E5E0FF' : 'rgba(242, 238, 255, 0.1)',
  },
}));

// Componente local de loading para substituir o contexto
const LoadingIndicator = ({ message = 'Carregando...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
    }}
  >
    <CircularProgress size={40} />
    <Typography sx={{ mt: 2 }}>{message}</Typography>
  </Box>
);

const FormReserva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = !!id;

  // Usar refs para evitar efeitos colaterais
  const dataFetchedRef = useRef(false);

  // Estados locais em vez de contextos
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Dados do formulário
  const [formData, setFormData] = useState({
    espacoAcademico: '',
    professor: '',
    data: null,
    horaInicial: '',
    horaFinal: '',
  });

  const [espacos, setEspacos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [error, setError] = useState(null);

  // Adicionar estado para horários disponíveis
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({});

  // Função local de feedback
  const showFeedback = (message, severity = 'info') => {
    setFeedback({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseFeedback = () => {
    setFeedback({
      ...feedback,
      open: false,
    });
  };

  // Carregar dados iniciais - COM PROTEÇÃO CONTRA LOOP INFINITO
  useEffect(() => {
    // Esta verificação garante que o efeito só execute uma vez
    if (dataFetchedRef.current) return;

    const fetchData = async () => {
      setIsLoading(true);
      setLoadingMessage('Carregando dados...');

      try {
        console.log('Iniciando carregamento de dados...');

        // Carregar espaços e professores
        const [espacosRes, professoresRes] = await Promise.all([
          api.get('/espacos'),
          api.get('/professores'),
        ]);

        setEspacos(espacosRes.data);
        setProfessores(professoresRes.data);

        // Se for edição, carregar dados da reserva
        if (id) {
          const reservaRes = await api.get(`/reservas/${id}`);
          const reserva = reservaRes.data;

          setFormData({
            espacoAcademico: reserva.espacoAcademico.id,
            professor: reserva.professor.id,
            data: new Date(reserva.data),
            horaInicial: reserva.horaInicial,
            horaFinal: reserva.horaFinal,
          });
        }

        console.log('Dados carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setError('Erro ao carregar dados necessários');

        // Mostrar feedback e redirecionar
        showFeedback('Erro ao carregar dados necessários', 'error');
        // Evitar redirecionamento imediato para permitir que o usuário veja o erro
        setTimeout(() => navigate('/reservas'), 2000);
      } finally {
        setIsLoading(false);
        // Marcar que os dados já foram carregados
        dataFetchedRef.current = true;
      }
    };

    fetchData();

    // Sem dependências para evitar re-execução
  }, []);

  // Adicionar função para carregar horários disponíveis
  const carregarHorariosDisponiveis = async () => {
    if (!formData.espacoAcademico || !formData.data || !formData.professor) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadingMessage('Verificando horários disponíveis...');
      
      const dataFormatada = formatarDataParaAPI(formData.data);
      const response = await api.get('/reservas/horarios-disponiveis', {
        params: {
          espacoId: formData.espacoAcademico,
          data: dataFormatada,
          professorId: formData.professor
        }
      });
      
      setHorariosDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      showFeedback('Erro ao verificar horários disponíveis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar useEffect para chamar a verificação quando campos relevantes mudam
  useEffect(() => {
    carregarHorariosDisponiveis();
  }, [formData.espacoAcademico, formData.data, formData.professor]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      data: date,
    });
  };

  // Validar horário
  const validarHorario = (horaInicial, horaFinal) => {
    if (!horaInicial || !horaFinal) {
      showFeedback('É necessário informar os horários de início e fim', 'error');
      return false;
    }

    const [horaIni, minIni] = horaInicial.split(':').map(Number);
    const [horaFim, minFim] = horaFinal.split(':').map(Number);

    const inicioEmMinutos = horaIni * 60 + minIni;
    const fimEmMinutos = horaFim * 60 + minFim;

    if (inicioEmMinutos >= fimEmMinutos) {
      showFeedback('O horário final deve ser maior que o horário inicial', 'error');
      return false;
    }

    return true;
  };

  // Format date for API
  const formatarDataParaAPI = (data) => {
    if (!data) return null;

    // Usando a data local sem ajuste de timezone
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.data) {
      showFeedback('É necessário selecionar uma data', 'error');
      return;
    }

    if (!validarHorario(formData.horaInicial, formData.horaFinal)) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage(isEdicao ? 'Atualizando reserva...' : 'Criando reserva...');

      const dadosReserva = {
        ...formData,
        data: formatarDataParaAPI(formData.data),
        espacoAcademico: { id: formData.espacoAcademico },
        professor: { id: formData.professor },
      };

      if (isEdicao) {
        await api.put(`/reservas/${id}`, dadosReserva);
        showFeedback('Reserva atualizada com sucesso', 'success');
      } else {
        await api.post('/reservas', dadosReserva);
        showFeedback('Reserva criada com sucesso', 'success');
      }

      // Breve delay para garantir que a mensagem de sucesso seja vista
      setTimeout(() => navigate('/reservas'), 1000);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);

      // Tratamento específico para erro de conflito
      if (error.response?.status === 409) {
        showFeedback('Já existe uma reserva para este espaço neste horário', 'error');
      } else {
        showFeedback(
          error.response?.data?.message || 'Erro ao salvar reserva',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/reservas');
  };

  // Componente personalizado para seleção de hora com slots disponíveis/indisponíveis
  const HoraSelect = ({ name, value, onChange, horariosDisponiveis, minHora, maxHora }) => {
    // Gerar opções de hora de 7:00 às 23:00 em intervalos de 30 minutos
    const gerarOpcoes = () => {
      const opcoes = [];
      let hora = 7;
      let minuto = 0;
      
      while (hora < 23 || (hora === 23 && minuto === 0)) {
        const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        const disponivel = horariosDisponiveis[horaFormatada] !== false;
        
        opcoes.push({ valor: horaFormatada, disponivel });
        
        // Incrementar 30 minutos
        minuto += 30;
        if (minuto >= 60) {
          hora++;
          minuto = 0;
        }
      }
      
      return opcoes;
    };
    
    const opcoes = gerarOpcoes();
    
    return (
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
        required
        displayEmpty
      >
        <MenuItem value="" disabled>Selecione</MenuItem>
        {opcoes.map(({ valor, disponivel }) => (
          <MenuItem 
            key={valor} 
            value={valor} 
            disabled={!disponivel}
            sx={{ opacity: disponivel ? 1 : 0.5 }}
          >
            {valor}
          </MenuItem>
        ))}
      </StyledSelect>
    );
  };

  if (isLoading) {
    return <LoadingIndicator message={loadingMessage} />;
  }

  return (
    <FormContainer>
      <PageTitle>
        {isEdicao ? 'Editar Reserva' : 'Nova Reserva'}
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormLabel>Espaço Acadêmico</FormLabel>
            <FormControl fullWidth>
              <StyledSelect
                name="espacoAcademico"
                value={formData.espacoAcademico}
                onChange={handleChange}
                required
                displayEmpty
              >
                <MenuItem value="" disabled>Selecione um espaço</MenuItem>
                {espacos.map((espaco) => (
                  <MenuItem key={espaco.id} value={espaco.id}>
                    {espaco.nome}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormLabel>Professor</FormLabel>
            <FormControl fullWidth>
              <StyledSelect
                name="professor"
                value={formData.professor}
                onChange={handleChange}
                required
                displayEmpty
              >
                <MenuItem value="" disabled>Selecione um professor</MenuItem>
                {professores.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormLabel>Data</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                value={formData.data}
                onChange={handleDateChange}
                renderInput={(params) => <StyledTextField {...params} fullWidth />}
                disablePast
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormLabel>Hora Inicial</FormLabel>
            <HoraSelect
              name="horaInicial"
              value={formData.horaInicial}
              onChange={handleChange}
              horariosDisponiveis={horariosDisponiveis}
              minHora="07:00"
              maxHora="22:30"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormLabel>Hora Final</FormLabel>
            <HoraSelect
              name="horaFinal"
              value={formData.horaFinal}
              onChange={handleChange}
              horariosDisponiveis={horariosDisponiveis}
              minHora="07:30"
              maxHora="23:00"
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={handleCancel}
            >
              Cancelar
            </StyledButton>
            <StyledButton
              variant="contained"
              type="submit"
            >
              {isEdicao ? 'Atualizar' : 'Salvar'}
            </StyledButton>
          </Grid>
        </Grid>
      </form>

      {/* Manter o Snackbar para feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

export default FormReserva;