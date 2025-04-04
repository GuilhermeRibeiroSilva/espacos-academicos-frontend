import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, MenuItem, Select, 
  FormControl, InputLabel, CircularProgress, Grid, Alert,
  Paper
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { styled } from '@mui/material/styles';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/auth';

// Componentes estilizados
const FormContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  padding: '30px',
  width: '100%',
  maxWidth: '800px',
  margin: '30px auto',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
}));

const PageTitle = styled(Typography)({
  color: '#0F1140',
  marginBottom: '24px',
  fontSize: '24px',
  fontWeight: 'bold',
});

const FormLabel = styled(Typography)({
  marginBottom: '8px',
  fontWeight: '500',
  color: '#0F1140',
});

const StyledButton = styled(Button)(({ variant }) => ({
  backgroundColor: variant === 'contained' ? '#0F1140' : 'transparent',
  color: variant === 'contained' ? 'white' : '#0F1140',
  border: variant === 'outlined' ? '1px solid #0F1140' : 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#1a1b4b' : 'rgba(15, 17, 64, 0.1)',
  },
}));

const StyledField = styled(TextField)({
  marginBottom: '20px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
});

const FormReserva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isEdicao = !!id;

  // Estados para os dados
  const [formData, setFormData] = useState({
    espacoAcademicoId: '',
    professorId: '',
    data: null,
    horaInicial: '',
    horaFinal: '',
    finalidade: '',
  });

  // Estados para as listas
  const [espacos, setEspacos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  // Estados para feedback
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      try {
        // Carregar listas de espaços e professores
        const [espacosRes, professoresRes] = await Promise.all([
          api.get('/api/espacos'),
          api.get('/api/professores')
        ]);

        setEspacos(espacosRes.data);
        setProfessores(professoresRes.data);

        // Se for edição, carregar dados da reserva
        if (isEdicao) {
          // Apenas admin pode editar reservas
          if (!auth.isAdmin) {
            setError('Apenas administradores podem editar reservas');
            setTimeout(() => navigate('/reservas'), 3000);
            return;
          }

          const reservaRes = await api.get(`/api/reservas/${id}`);
          const reserva = reservaRes.data;

          // Verificar se é pendente (só pode editar reservas pendentes)
          if (reserva.status !== 'PENDENTE') {
            setError('Apenas reservas pendentes podem ser editadas');
            setTimeout(() => navigate('/reservas'), 3000);
            return;
          }

          // Formatar data
          const dataReserva = new Date(reserva.data);

          // Preencher formulário
          setFormData({
            espacoAcademicoId: reserva.espacoAcademico.id,
            professorId: reserva.professor.id,
            data: dataReserva,
            horaInicial: reserva.horaInicial,
            horaFinal: reserva.horaFinal,
            finalidade: reserva.finalidade || '',
          });

          // Carregar horários disponíveis
          carregarHorariosDisponiveis(
            reserva.espacoAcademico.id, 
            dataReserva, 
            reserva.id
          );
        } else {
          // Se for professor, pré-selecionar seu ID
          if (!auth.isAdmin && auth.user?.professorId) {
            setFormData(prev => ({
              ...prev,
              professorId: auth.user.professorId
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setError('Erro ao carregar dados necessários. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, [id, isEdicao, navigate, auth.isAdmin, auth.user]);

  // Carregar horários disponíveis quando espaço ou data mudar
  useEffect(() => {
    if (formData.espacoAcademicoId && formData.data) {
      carregarHorariosDisponiveis(
        formData.espacoAcademicoId, 
        formData.data, 
        isEdicao ? parseInt(id) : null
      );
    }
  }, [formData.espacoAcademicoId, formData.data, isEdicao, id]);

  // Função para carregar horários disponíveis
  const carregarHorariosDisponiveis = async (espacoId, data, reservaId = null) => {
    if (!espacoId || !data) return;
    
    try {
      // Formatar data para API
      const dataFormatada = formatarDataParaAPI(data);
      
      const response = await api.get('/api/horarios-disponiveis', {
        params: {
          espacoId,
          data: dataFormatada,
          reservaId,
        }
      });
      
      setHorariosDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      setError('Erro ao verificar disponibilidade de horários');
    }
  };

  // Handler para mudanças em campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando atualizado
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handler para mudança de data
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, data: date }));
    
    // Limpar horários selecionados quando a data muda
    setFormData(prev => ({ 
      ...prev, 
      data: date,
      horaInicial: '',
      horaFinal: ''
    }));
    
    // Limpar erro do campo data
    if (fieldErrors.data) {
      setFieldErrors(prev => ({ ...prev, data: null }));
    }
  };

  // Formatar data para API
  const formatarDataParaAPI = (data) => {
    if (!data) return null;
    
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Validar formulário
  const validarFormulario = () => {
    const errors = {};
    
    if (!formData.espacoAcademicoId) {
      errors.espacoAcademicoId = 'Selecione um espaço acadêmico';
    }
    
    if (!formData.professorId) {
      errors.professorId = 'Selecione um professor';
    }
    
    if (!formData.data) {
      errors.data = 'Selecione uma data';
    } else {
      // Verificar se é data futura
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (formData.data < hoje) {
        errors.data = 'Selecione uma data futura';
      }
    }
    
    if (!formData.horaInicial) {
      errors.horaInicial = 'Selecione uma hora inicial';
    }
    
    if (!formData.horaFinal) {
      errors.horaFinal = 'Selecione uma hora final';
    } else if (formData.horaInicial && formData.horaFinal) {
      // Verificar se hora final é maior que inicial
      if (formData.horaInicial >= formData.horaFinal) {
        errors.horaFinal = 'A hora final deve ser maior que a hora inicial';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler para submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    if (!validarFormulario()) {
      return;
    }
    
    setLoadingSubmit(true);
    setError(null);
    
    try {
      // Preparar dados para envio
      const dadosParaEnvio = {
        espacoAcademicoId: formData.espacoAcademicoId,
        professorId: formData.professorId,
        data: formatarDataParaAPI(formData.data),
        horaInicial: formData.horaInicial,
        horaFinal: formData.horaFinal,
        finalidade: formData.finalidade
      };
      
      // Enviar para API
      if (isEdicao) {
        await api.put(`/api/reservas/${id}`, dadosParaEnvio);
      } else {
        await api.post('/api/reservas', dadosParaEnvio);
      }
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/reservas');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao salvar reserva. Tente novamente mais tarde.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Componente de horários disponíveis
  const HorarioSelect = ({ 
    name, 
    value, 
    onChange, 
    label, 
    horarios, 
    error, 
    helperText 
  }) => (
    <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
      <FormLabel>{label}</FormLabel>
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
        displayEmpty
      >
        <MenuItem value="" disabled>Selecione um horário</MenuItem>
        {horarios.map((horario) => (
          <MenuItem key={horario} value={horario}>
            {horario.substring(0, 5)}
          </MenuItem>
        ))}
      </StyledSelect>
      {error && <Typography color="error" variant="caption">{helperText}</Typography>}
    </FormControl>
  );

  // Se estiver carregando, mostrar indicador
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormContainer>
      <PageTitle>
        {isEdicao ? 'Editar Reserva' : 'Nova Reserva'}
      </PageTitle>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Reserva {isEdicao ? 'atualizada' : 'criada'} com sucesso!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!fieldErrors.espacoAcademicoId} sx={{ mb: 2 }}>
              <FormLabel>Espaço Acadêmico</FormLabel>
              <StyledSelect
                name="espacoAcademicoId"
                value={formData.espacoAcademicoId}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>Selecione um espaço</MenuItem>
                {espacos.map((espaco) => (
                  <MenuItem key={espaco.id} value={espaco.id}>
                    {espaco.nome}
                  </MenuItem>
                ))}
              </StyledSelect>
              {fieldErrors.espacoAcademicoId && (
                <Typography color="error" variant="caption">
                  {fieldErrors.espacoAcademicoId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!fieldErrors.professorId} sx={{ mb: 2 }}>
              <FormLabel>Professor</FormLabel>
              <StyledSelect
                name="professorId"
                value={formData.professorId}
                onChange={handleChange}
                displayEmpty
                disabled={!auth.isAdmin && auth.user?.professorId}
              >
                <MenuItem value="" disabled>Selecione um professor</MenuItem>
                {professores.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </MenuItem>
                ))}
              </StyledSelect>
              {fieldErrors.professorId && (
                <Typography color="error" variant="caption">
                  {fieldErrors.professorId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormLabel>Data</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                value={formData.data}
                onChange={handleDateChange}
                disablePast
                sx={{ width: '100%', mb: 2 }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    error: !!fieldErrors.data,
                    helperText: fieldErrors.data,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* Espaço para alinhar com a data */}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <HorarioSelect
              name="horaInicial"
              value={formData.horaInicial}
              onChange={handleChange}
              label="Hora Inicial"
              horarios={horariosDisponiveis}
              error={!!fieldErrors.horaInicial}
              helperText={fieldErrors.horaInicial}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <HorarioSelect
              name="horaFinal"
              value={formData.horaFinal}
              onChange={handleChange}
              label="Hora Final"
              horarios={horariosDisponiveis}
              error={!!fieldErrors.horaFinal}
              helperText={fieldErrors.horaFinal}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormLabel>Finalidade (opcional)</FormLabel>
            <StyledField
              name="finalidade"
              value={formData.finalidade}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Descreva a finalidade da reserva"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate('/reservas')}
                disabled={loadingSubmit}
              >
                Cancelar
              </StyledButton>
              
              <StyledButton
                variant="contained"
                type="submit"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEdicao ? 'Atualizar' : 'Salvar'}
              </StyledButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormContainer>
  );
};

export default FormReserva;