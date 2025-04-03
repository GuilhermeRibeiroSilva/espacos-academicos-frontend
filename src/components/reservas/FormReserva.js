import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, styled, Grid, Alert, Snackbar, CircularProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
  marginBottom: '8px',
  fontWeight: '500',
  color: '#F2EEFF',
});

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: '#F2EEFF',
  borderRadius: '4px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E0FF',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0F1140',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0F1140',
  },
  '& .MuiSelect-select': {
    color: '#0F1140',
  }
}));

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
  const { auth } = useAuth();
  const isAlteracao = !!id;

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

  // Correções no useEffect para carregar dados
  useEffect(() => {
    const loadInitialData = async () => {
      if (isLoading) return; // Evitar múltiplas chamadas
      
      setIsLoading(true);
      setLoadingMessage('Carregando dados...');
      
      try {
        // Carregar listas de espaços e professores simultaneamente
        const [espacosRes, professoresRes] = await Promise.all([
          api.get('/espacos'),
          api.get('/professores')
        ]);
        
        setEspacos(espacosRes.data);
        setProfessores(professoresRes.data);
        
        // Se for modo de edição, carregar dados da reserva existente
        if (id) {
          console.log('Carregando reserva para edição. ID:', id);
          
          // Verificar se é administrador (apenas admins podem editar)
          if (!auth.isAdmin) {
            showFeedback('Apenas administradores podem alterar reservas', 'error');
            navigate('/reservas');
            return;
          }
          
          // Verificar se a reserva ainda pode ser alterada
          const podeAlterarRes = await api.get(`/reservas/${id}/pode-alterar`);
          if (!podeAlterarRes.data) {
            showFeedback('Esta reserva não pode mais ser alterada', 'warning');
            navigate('/reservas');
            return;
          }
          
          // Carregar dados da reserva
          const reservaRes = await api.get(`/reservas/${id}`);
          const reserva = reservaRes.data;
          
          // Configurar dados do formulário
          setFormData({
            espacoAcademico: reserva.espacoAcademico.id,
            professor: reserva.professor.id,
            data: new Date(reserva.data),
            horaInicial: reserva.horaInicial,
            horaFinal: reserva.horaFinal,
            finalidade: reserva.finalidade || ''
          });
          
          console.log('Dados da reserva carregados:', reserva);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showFeedback('Erro ao carregar dados necessários', 'error');
        // Redirecionar para lista em caso de erro
        setTimeout(() => navigate('/reservas'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [id, navigate, auth.isAdmin]);

  // Função para carregar horários disponíveis
  const carregarHorariosDisponiveis = async () => {
    if (!formData.espacoAcademico || !formData.data) {
      setHorariosDisponiveis({});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Formatar data para API
      const dataFormatada = formatarDataParaAPI(formData.data);
      
      const response = await api.get('/reservas/horarios-disponiveis', {
        params: {
          espacoId: formData.espacoAcademico,
          data: dataFormatada
        }
      });
      
      setHorariosDisponiveis(response.data);
      
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      showFeedback('Erro ao verificar disponibilidade de horários', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar useEffect específico para o carregamento de horários disponíveis
  useEffect(() => {
    // Só verificar horários disponíveis se todos os campos necessários estiverem preenchidos
    if (formData.espacoAcademico && formData.data && formData.professor) {
      carregarHorariosDisponiveis();
    } else {
      // Limpar horários disponíveis se os campos necessários não estiverem preenchidos
      setHorariosDisponiveis({});
    }
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

    // Validações aprimoradas
    if (!formData.espacoAcademico) {
      showFeedback('É necessário selecionar um espaço acadêmico', 'error');
      return;
    }

    if (!formData.professor) {
      showFeedback('É necessário selecionar um professor', 'error');
      return;
    }

    if (!formData.data) {
      showFeedback('É necessário selecionar uma data', 'error');
      return;
    }

    // Verificar se a data é futura
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (formData.data < hoje) {
      showFeedback('Não é possível fazer reservas para datas passadas', 'error');
      return;
    }

    if (!validarHorario(formData.horaInicial, formData.horaFinal)) {
      return;
    }

    // Verificar se os horários selecionados estão disponíveis
    if (horariosDisponiveis[formData.horaInicial] === false) {
      showFeedback('O horário inicial selecionado não está disponível', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage(id ? 'Atualizando reserva...' : 'Criando reserva...');
      
      const dadosReserva = {
        espacoAcademico: { id: formData.espacoAcademico },
        professor: { id: formData.professor },
        data: formatarDataParaAPI(formData.data),
        horaInicial: formData.horaInicial,
        horaFinal: formData.horaFinal,
        finalidade: formData.finalidade || null
      };
      
      // Log para debug
      console.log('Dados enviados para a API:', dadosReserva);
      
      if (id) {
        // Modo de edição - usar PUT
        await api.put(`/reservas/${id}`, dadosReserva);
        showFeedback('Reserva atualizada com sucesso', 'success');
      } else {
        // Modo de criação - usar POST
        await api.post('/reservas', dadosReserva);
        showFeedback('Reserva criada com sucesso', 'success');
      }
      
      // Breve delay para feedback antes de redirecionar
      setTimeout(() => navigate('/reservas'), 1500);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      
      // Tratamento de erro mais específico
      if (error.response?.status === 409) {
        showFeedback('Já existe uma reserva para este espaço neste horário', 'error');
      } else if (error.response?.status === 400) {
        showFeedback(error.response.data.message || 'Dados inválidos para reserva', 'error');
      } else {
        showFeedback('Erro ao salvar reserva', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/reservas');
  };

  // Componente personalizado para seleção de hora com slots de 10 minutos
  const HoraSelect = ({ name, value, onChange, horariosDisponiveis, label }) => {
    // Gerar opções de hora de 7:00 às 23:00 em intervalos de 10 minutos
    const gerarOpcoes = () => {
      const opcoes = [];
      let hora = 7;
      let minuto = 0;
      
      while (hora < 23 || (hora === 23 && minuto === 0)) {
        const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        // Verificar se o horário está disponível no objeto horariosDisponiveis
        const disponivel = !horariosDisponiveis || horariosDisponiveis[horaFormatada] !== false;
        
        opcoes.push({ valor: horaFormatada, disponivel });
        
        // Incrementar 10 minutos
        minuto += 10;
        if (minuto >= 60) {
          hora++;
          minuto = 0;
        }
      }
      
      return opcoes;
    };
    
    const opcoes = gerarOpcoes();
    
    return (
      <FormControl fullWidth>
        <FormLabel>{label}</FormLabel>
        <StyledSelect
          name={name}
          value={value}
          onChange={onChange}
          required
        >
          <MenuItem value="" disabled>Selecione</MenuItem>
          {opcoes.map(({ valor, disponivel }) => (
            <MenuItem 
              key={valor} 
              value={valor} 
              disabled={!disponivel}
              sx={{ 
                opacity: disponivel ? 1 : 0.5,
                backgroundColor: disponivel ? 'inherit' : 'rgba(255, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: disponivel ? 'rgba(229, 224, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                },
                '&::after': disponivel ? {} : {
                  content: '"- Ocupado"',
                  marginLeft: '8px',
                  color: '#d32f2f',
                  fontStyle: 'italic'
                }
              }}
            >
              {valor}
            </MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    );
  };

  if (isLoading) {
    return <LoadingIndicator message={loadingMessage} />;
  }

  return (
    <FormContainer>
      <PageTitle>
        {isAlteracao ? 'Alterar Reserva' : 'Nova Reserva'}
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
                shouldDisableDate={(date) => {
                  // Desabilitar datas passadas
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  return date < hoje;
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    sx={{
                      backgroundColor: '#F2EEFF',  // Fundo claro para contraste
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E5E0FF',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0F1140',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0F1140',
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: '#0F1140',  // Cor do texto para contraste
                      },
                      '& .MuiInputLabel-root': {
                        color: '#0F1140',
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {formData.espacoAcademico && formData.data && Object.keys(horariosDisponiveis).length > 0 && (
            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<InfoIcon />}
              >
                Os horários em vermelho já estão reservados e não podem ser selecionados.
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} md={4}>
            <HoraSelect
              name="horaInicial"
              value={formData.horaInicial}
              onChange={handleChange}
              horariosDisponiveis={horariosDisponiveis}
              label="Hora Inicial"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <HoraSelect
              name="horaFinal"
              value={formData.horaFinal}
              onChange={handleChange}
              horariosDisponiveis={horariosDisponiveis}
              label="Hora Final"
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
              {isAlteracao ? 'Alterar' : 'Salvar'}
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