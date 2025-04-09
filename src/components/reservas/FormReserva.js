import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, MenuItem, Select, 
  FormControl, InputLabel, CircularProgress, Grid, Alert,
  Paper, FormHelperText, AlertTitle
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
  });

  // Estados para as listas
  const [espacos, setEspacos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);

  // Estados para feedback
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Função para gerar horários disponíveis localmente (de 10 em 10 minutos)
  const gerarHorariosDisponiveis = () => {
    const horariosTemp = [];
    // Horários de 7h às 23h com intervalos de 10 minutos
    for (let hora = 7; hora <= 23; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 10) {
        horariosTemp.push(
          `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`
        );
      }
    }
    return horariosTemp;
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      try {
        // Carregar listas de espaços e professores
        const [espacosRes, professoresRes] = await Promise.all([
          api.get('/espacos'),
          api.get('/professores')
        ]);

        // Filtrar apenas espaços disponíveis para novas reservas
        const espacosDisponiveis = espacosRes.data.filter(espaco => espaco.disponivel);
        
        setEspacos(espacosDisponiveis);
        setProfessores(professoresRes.data);

        // Se for edição, carregar dados da reserva
        if (isEdicao) {
          // Apenas admin pode editar reservas
          if (!auth.isAdmin) {
            setError('Apenas administradores podem editar reservas');
            setTimeout(() => navigate('/reservas'), 3000);
            return;
          }

          const reservaRes = await api.get(`/reservas/${id}`);
          const reserva = reservaRes.data;

          // Verificar se é agendado (só pode editar reservas agendadas)
          if (reserva.status !== 'PENDENTE' && reserva.status !== 'AGENDADO') {
            setError('Apenas reservas agendadas podem ser editadas');
            setTimeout(() => navigate('/reservas'), 3000);
            return;
          }

          // Formatar data corretamente para evitar problemas de timezone
          // Convertemos explicitamente a data para um objeto Date com a hora do meio-dia para evitar erros de timezone
          const dataString = reserva.data;
          const [ano, mes, dia] = dataString.split('-').map(Number);
          const dataReserva = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

          // Preencher formulário
          setFormData({
            espacoAcademicoId: reserva.espacoAcademico.id,
            professorId: reserva.professor.id,
            data: dataReserva,
            horaInicial: reserva.horaInicial,
            horaFinal: reserva.horaFinal,
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
      
      console.log('Parâmetros enviados para /horarios-disponiveis:', {
        espacoId,
        data: dataFormatada,
        reservaId
      });
      
      try {
        // Primeiro, vamos buscar as reservas existentes para este espaço na data
        const reservasResponse = await api.get('/reservas/buscar-por-espaco-data', {
          params: {
            espacoId,
            data: dataFormatada
          }
        });
        
        // Extrair os horários ocupados, excluindo as reservas canceladas
        const ocupados = reservasResponse.data
          .filter(reserva => reserva.status !== 'CANCELADO') // Ignorar reservas canceladas
          .map(reserva => ({
            inicio: reserva.horaInicial,
            fim: reserva.horaFinal,
            id: reserva.id
          }));
        
        setHorariosOcupados(ocupados);
        
        // Agora, buscar os horários disponíveis
        const response = await api.get('/horarios-disponiveis', {
          params: {
            espacoId,
            data: dataFormatada,
            reservaId,
          }
        });
        
        setHorariosDisponiveis(response.data);
      } catch (apiError) {
        console.error('Erro ao acessar API de horários disponíveis, usando solução alternativa', apiError);
        
        // Gerar horários de 7h às 23h com intervalos de 10 minutos
        const horariosTemp = [];
        for (let hora = 7; hora <= 23; hora++) {
          for (let minuto = 0; minuto < 60; minuto += 10) {
            horariosTemp.push(
              `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`
            );
          }
        }
        setHorariosDisponiveis(horariosTemp);
      }
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      console.error('Detalhes do erro:', error.response?.data || 'Sem detalhes adicionais');
      setError('Erro ao verificar disponibilidade de horários. Por favor, tente novamente.');
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
    if (date) {
      // Normalizar a data para evitar problemas de timezone
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone
      
      setFormData(prev => ({ 
        ...prev, 
        data: normalizedDate,
        horaInicial: '',
        horaFinal: ''
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        data: null,
        horaInicial: '',
        horaFinal: ''
      }));
    }
    
    // Limpar erro do campo data
    if (fieldErrors.data) {
      setFieldErrors(prev => ({ ...prev, data: null }));
    }
  };

  // Formatar data para API
  const formatarDataParaAPI = (data) => {
    if (!data) return null;
    
    // Criar uma nova data usando a data selecionada sem modificar o timezone
    const dataLocal = new Date(data);
    
    // Adicionar timezone offset para compensar qualquer ajuste automático
    const offset = dataLocal.getTimezoneOffset();
    const dataAjustada = new Date(dataLocal.getTime() + (offset * 60 * 1000));
    
    const year = dataAjustada.getFullYear();
    const month = String(dataAjustada.getMonth() + 1).padStart(2, '0');
    const day = String(dataAjustada.getDate()).padStart(2, '0');
    
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
      
      const dataSelecionada = new Date(formData.data);
      dataSelecionada.setHours(0, 0, 0, 0);
      
      if (dataSelecionada < hoje) {
        errors.data = 'Selecione uma data futura';
      } else if (dataSelecionada.getTime() === hoje.getTime()) {
        // Se for o dia atual, verificar se o horário já passou
        const horaAtual = new Date();
        const [horaInicialH, horaInicialM] = formData.horaInicial.split(':').map(Number);
        const horaInicialDate = new Date();
        horaInicialDate.setHours(horaInicialH, horaInicialM, 0);
        
        if (horaInicialDate <= horaAtual) {
          errors.horaInicial = 'Não é possível agendar para um horário que já passou';
        }
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
      // Verificar se a hora inicial é menor que a hora final
      const [horaInicialH, horaInicialM] = formData.horaInicial.split(':').map(Number);
      const [horaFinalH, horaFinalM] = formData.horaFinal.split(':').map(Number);
      
      if (horaInicialH > horaFinalH || (horaInicialH === horaFinalH && horaInicialM >= horaFinalM)) {
        setError('A hora inicial deve ser menor que a hora final');
        setFieldErrors({...fieldErrors, horaFinal: 'A hora final deve ser maior que a hora inicial'});
        setLoadingSubmit(false);
        return;
      }
      
      // Preparar dados para envio
      const dadosParaEnvio = {
        espacoAcademicoId: formData.espacoAcademicoId,
        professorId: formData.professorId,
        data: formatarDataParaAPI(formData.data),
        horaInicial: formData.horaInicial,
        horaFinal: formData.horaFinal,
      };
      
      // Enviar para API
      if (isEdicao) {
        await api.put(`/reservas/${id}`, dadosParaEnvio);
      } else {
        await api.post('/reservas', dadosParaEnvio);
      }
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/reservas');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      
      // Verificar se é erro de conflito de reserva
      if (
        error.response && 
        error.response.data && 
        (
          error.response.data.message?.toLowerCase().includes('conflito') ||
          error.response.data.message?.toLowerCase().includes('já existe uma reserva') ||
          error.response.status === 409 // Conflict HTTP status
        )
      ) {
        setError('Já existe uma reserva para este local neste horário. Por favor, escolha outro horário ou local.');
      } else if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao salvar reserva. Tente novamente mais tarde.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Função para verificar se um horário está em um intervalo ocupado
  const verificarHorarioOcupado = (horario) => {
    if (!horariosOcupados.length) return false;
    
    // Converter o horário para minutos para facilitar comparação
    const [hora, minuto] = horario.split(':').map(Number);
    const horarioEmMinutos = hora * 60 + minuto;
    
    // Verificar se o horário está em algum intervalo ocupado ou é exatamente o horário final
    return horariosOcupados.some(ocupado => {
      // Pular a própria reserva em caso de edição
      if (isEdicao && ocupado.id === parseInt(id)) return false;
      
      const [horaInicio, minutoInicio] = ocupado.inicio.split(':').map(Number);
      const [horaFim, minutoFim] = ocupado.fim.split(':').map(Number);
      
      const inicioEmMinutos = horaInicio * 60 + minutoInicio;
      const fimEmMinutos = horaFim * 60 + minutoFim;
      
      // Agora bloqueamos inclusive o horário final da reserva
      return (horarioEmMinutos >= inicioEmMinutos && horarioEmMinutos <= fimEmMinutos);
    });
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
  }) => {
    const isHoraFinal = name === 'horaFinal';
    
    const renderMenuItem = (horario) => {
      const ocupado = verificarHorarioOcupado(horario);
      
      // Lógica para horário final - deve ser maior que o inicial
      const horarioInvalido = isHoraFinal && formData.horaInicial && horario <= formData.horaInicial;
      
      // Para horário final, não se deve poder selecionar um horário que já está ocupado
      // mesmo que seja o horário final exato de outra reserva
      const disabled = ocupado || horarioInvalido;
      
      // Adicionar informação de hoje para verificar se o horário já passou
      const hoje = new Date();
      const dataHoje = hoje.toISOString().split('T')[0];
      const dataReserva = formData.data ? formatarDataParaAPI(formData.data) : null;
      
      // Verificar se o horário já passou hoje
      const horarioPassou = dataReserva === dataHoje && (() => {
        const [hora, minuto] = horario.split(':').map(Number);
        const horarioDate = new Date();
        horarioDate.setHours(hora, minuto, 0);
        return horarioDate <= hoje;
      })();
      
      // Desabilitar também se o horário já passou
      const finalDisabled = disabled || horarioPassou;
      
      return (
        <MenuItem 
          key={horario} 
          value={horario}
          disabled={finalDisabled}
          sx={{
            color: ocupado ? 'error.main' : (horarioInvalido ? 'text.disabled' : horarioPassou ? 'text.disabled' : 'inherit'),
            '&.Mui-disabled': {
              opacity: 0.6,
              textDecoration: ocupado ? 'line-through' : 'none',
              fontStyle: 'italic'
            }
          }}
        >
          {horario.substring(0, 5)}
          {ocupado && ' (Ocupado)'}
          {!ocupado && horarioInvalido && ' (Anterior à hora inicial)'}
          {!ocupado && !horarioInvalido && horarioPassou && ' (Horário passado)'}
        </MenuItem>
      );
    };

    return (
      <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
        <FormLabel>{label}</FormLabel>
        <StyledSelect
          name={name}
          value={value}
          onChange={onChange}
          displayEmpty
        >
          <MenuItem value="" disabled>Selecione um horário</MenuItem>
          {horarios.map(renderMenuItem)}
        </StyledSelect>
        {error && <Typography color="error" variant="caption">{helperText}</Typography>}
      </FormControl>
    );
  };

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
            {horariosOcupados.length > 0 && (
              <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
                <AlertTitle>Atenção</AlertTitle>
                Existem {horariosOcupados.length} reserva(s) para este espaço nesta data.
                Os horários ocupados estão destacados e não podem ser selecionados.
              </Alert>
            )}
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