import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Typography, MenuItem, Select, 
  FormControl, CircularProgress, Grid, Alert,
  AlertTitle
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import HorarioSelect from './HorarioSelect';
import { 
  FormContainer, PageTitle, FormLabel, StyledButton, 
  StyledSelect 
} from './StyledComponents';
import { formatarDataParaAPI, validarFormulario } from './utils/formHelpers';

const FormReserva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isEdicao = !!id;

  // Estados iniciais consolidados
  const [formData, setFormData] = useState({
    espacoAcademicoId: '',
    professorId: '',
    data: null,
    horaInicial: '',
    horaFinal: '',
  });
  const [listas, setListas] = useState({
    espacos: [],
    professores: [],
    horariosDisponiveis: [],
    horariosOcupados: []
  });
  const [uiState, setUiState] = useState({
    loading: false,
    loadingSubmit: false,
    error: null,
    fieldErrors: {},
    success: false
  });

  // Destruturas os estados para facilitar o uso
  const { espacos, professores, horariosDisponiveis, horariosOcupados } = listas;
  const { loading, loadingSubmit, error, fieldErrors, success } = uiState;

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setUiState(prev => ({ ...prev, loading: true }));
      try {
        // Carregar listas de espaços e professores
        const [espacosRes, professoresRes] = await Promise.all([
          api.get('/espacos'),
          api.get('/professores')
        ]);

        // Filtrar apenas espaços disponíveis
        const espacosDisponiveis = espacosRes.data.filter(espaco => espaco.disponivel);
        
        setListas(prev => ({
          ...prev,
          espacos: espacosDisponiveis,
          professores: professoresRes.data
        }));

        // Carregar dados específicos baseados no modo (edição ou criação)
        await carregarDadosModoAtual(espacosDisponiveis, professoresRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setUiState(prev => ({
          ...prev,
          error: 'Erro ao carregar dados necessários. Tente novamente mais tarde.'
        }));
      } finally {
        setUiState(prev => ({ ...prev, loading: false }));
      }
    };

    carregarDadosIniciais();
  }, []);

  // Função auxiliar para carregar dados específicos do modo atual
  const carregarDadosModoAtual = async (espacosDisponiveis, professoresList) => {
    if (isEdicao) {
      if (!auth.isAdmin) {
        setUiState(prev => ({
          ...prev,
          error: 'Apenas administradores podem editar reservas'
        }));
        setTimeout(() => navigate('/reservas'), 3000);
        return;
      }

      try {
        const reservaRes = await api.get(`/reservas/${id}`);
        const reserva = reservaRes.data;

        if (reserva.status !== 'PENDENTE' && reserva.status !== 'AGENDADO') {
          setUiState(prev => ({
            ...prev,
            error: 'Apenas reservas agendadas podem ser editadas'
          }));
          setTimeout(() => navigate('/reservas'), 3000);
          return;
        }

        const dataString = reserva.data;
        const [ano, mes, dia] = dataString.split('-').map(Number);
        const dataReserva = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

        const novoFormData = {
          espacoAcademicoId: reserva.espacoAcademico.id,
          professorId: reserva.professor.id,
          data: dataReserva,
          horaInicial: reserva.horaInicial,
          horaFinal: reserva.horaFinal,
        };
        
        setFormData(novoFormData);

        // Carregar horários disponíveis
        await carregarHorariosDisponiveis(
          reserva.espacoAcademico.id, 
          dataReserva, 
          reserva.id
        );
      } catch (error) {
        console.error('Erro ao carregar reserva:', error);
        setUiState(prev => ({
          ...prev,
          error: 'Erro ao carregar dados da reserva. Tente novamente.'
        }));
      }
    } else {
      // Pré-selecionar professor se não for admin
      if (!auth.isAdmin && auth.user?.professorId) {
        setFormData(prev => ({
          ...prev,
          professorId: auth.user.professorId
        }));
      }
    }
  };

  // Carregar horários disponíveis quando espaço ou data mudar
  useEffect(() => {
    if (formData.espacoAcademicoId && formData.data) {
      carregarHorariosDisponiveis(
        formData.espacoAcademicoId, 
        formData.data, 
        isEdicao ? parseInt(id) : null
      );
    }
  }, [formData.espacoAcademicoId, formData.data]);

  // Função para carregar horários disponíveis
  const carregarHorariosDisponiveis = async (espacoId, data, reservaId = null) => {
    if (!espacoId || !data) return;
    
    try {
      const dataFormatada = formatarDataParaAPI(data);
      
      try {
        // Carregar reservas existentes
        const reservasResponse = await api.get('/reservas/buscar-por-espaco-data', {
          params: {
            espacoId,
            data: dataFormatada
          }
        });
        
        // Extrair horários ocupados, excluindo reservas canceladas
        const ocupados = reservasResponse.data
          .filter(reserva => reserva.status !== 'CANCELADO')
          .map(reserva => ({
            inicio: reserva.horaInicial,
            fim: reserva.horaFinal,
            id: reserva.id
          }));
        
        setListas(prev => ({
          ...prev,
          horariosOcupados: ocupados
        }));
        
        // Buscar horários disponíveis
        const response = await api.get('/horarios-disponiveis', {
          params: {
            espacoId,
            data: dataFormatada,
            reservaId,
          }
        });
        
        setListas(prev => ({
          ...prev,
          horariosDisponiveis: response.data
        }));
      } catch (apiError) {
        console.error('Usando solução alternativa para horários', apiError);
        
        // Gerar horários de 7h às 23h
        const horariosTemp = gerarHorariosDisponiveis();
        setListas(prev => ({
          ...prev,
          horariosDisponiveis: horariosTemp
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setUiState(prev => ({
        ...prev,
        error: 'Erro ao verificar disponibilidade de horários.'
      }));
    }
  };

  // Função para gerar horários disponíveis localmente
  const gerarHorariosDisponiveis = () => {
    const horariosTemp = [];
    for (let hora = 7; hora <= 23; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 10) {
        horariosTemp.push(
          `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`
        );
      }
    }
    return horariosTemp;
  };

  // Handler para mudanças em campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (fieldErrors[name]) {
      setUiState(prev => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, [name]: null }
      }));
    }
  };

  // Handler para mudança de data
  const handleDateChange = (date) => {
    if (date) {
      // Normalizar a data
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0);
      
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
    
    // Limpar erro
    if (fieldErrors.data) {
      setUiState(prev => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, data: null }
      }));
    }
  };

  // Verificar se um horário está ocupado
  const verificarHorarioOcupado = (horario) => {
    if (!horariosOcupados.length) return false;
    
    // Converter para minutos para comparação
    const [hora, minuto] = horario.split(':').map(Number);
    const horarioEmMinutos = hora * 60 + minuto;
    
    return horariosOcupados.some(ocupado => {
      if (isEdicao && ocupado.id === parseInt(id)) return false;
      
      const [horaInicio, minutoInicio] = ocupado.inicio.split(':').map(Number);
      const [horaFim, minutoFim] = ocupado.fim.split(':').map(Number);
      
      const inicioEmMinutos = horaInicio * 60 + minutoInicio;
      const fimEmMinutos = horaFim * 60 + minutoFim;
      
      return (horarioEmMinutos >= inicioEmMinutos && horarioEmMinutos <= fimEmMinutos);
    });
  };

  // Handler para submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const errors = validarFormulario(formData);
    if (Object.keys(errors).length > 0) {
      setUiState(prev => ({
        ...prev,
        fieldErrors: errors
      }));
      return;
    }
    
    setUiState(prev => ({
      ...prev,
      loadingSubmit: true,
      error: null
    }));
    
    try {
      // Verificar hora inicial vs final
      const [horaInicialH, horaInicialM] = formData.horaInicial.split(':').map(Number);
      const [horaFinalH, horaFinalM] = formData.horaFinal.split(':').map(Number);
      
      if (horaInicialH > horaFinalH || (horaInicialH === horaFinalH && horaInicialM >= horaFinalM)) {
        setUiState(prev => ({
          ...prev,
          error: 'A hora inicial deve ser menor que a hora final',
          fieldErrors: {
            ...prev.fieldErrors,
            horaFinal: 'A hora final deve ser maior que a hora inicial'
          }
        }));
        return;
      }
      
      // Dados para envio
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
      
      // Sucesso
      setUiState(prev => ({
        ...prev,
        success: true
      }));
      
      // Redirecionar
      setTimeout(() => {
        navigate('/reservas');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      
      let mensagemErro = 'Erro ao salvar reserva. Tente novamente mais tarde.';
      
      if (error.response?.data?.message) {
        if (error.response.data.message.toLowerCase().includes('conflito') || 
            error.response.data.message.toLowerCase().includes('já existe uma reserva') ||
            error.response.status === 409) {
          mensagemErro = 'Já existe uma reserva para este local neste horário. Por favor, escolha outro horário ou local.';
        } else {
          mensagemErro = error.response.data.message;
        }
      }
      
      setUiState(prev => ({
        ...prev,
        error: mensagemErro
      }));
    } finally {
      setUiState(prev => ({
        ...prev,
        loadingSubmit: false
      }));
    }
  };

  // Renderizar loading
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
          {/* Espaço acadêmico */}
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
          
          {/* Professor */}
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
          
          {/* Data */}
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
                Os horários ocupados estão destacados.
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* Espaço para alinhar com a data */}
          </Grid>
          
          {/* Hora inicial */}
          <Grid item xs={12} md={6}>
            <HorarioSelect
              name="horaInicial"
              value={formData.horaInicial}
              onChange={handleChange}
              label="Hora Inicial"
              horarios={horariosDisponiveis}
              error={!!fieldErrors.horaInicial}
              helperText={fieldErrors.horaInicial}
              formData={formData}
              verificarHorarioOcupado={verificarHorarioOcupado}
              isEdicao={isEdicao}
              id={id}
            />
          </Grid>
          
          {/* Hora final */}
          <Grid item xs={12} md={6}>
            <HorarioSelect
              name="horaFinal"
              value={formData.horaFinal}
              onChange={handleChange}
              label="Hora Final"
              horarios={horariosDisponiveis}
              error={!!fieldErrors.horaFinal}
              helperText={fieldErrors.horaFinal}
              formData={formData}
              verificarHorarioOcupado={verificarHorarioOcupado}
              isEdicao={isEdicao}
              id={id}
            />
          </Grid>
          
          {/* Botões */}
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