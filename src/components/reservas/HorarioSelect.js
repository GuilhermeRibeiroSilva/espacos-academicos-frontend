import React from 'react';
import { FormControl, MenuItem, Typography } from '@mui/material';
import { FormLabel, StyledSelect } from './StyledComponents';

const HorarioSelect = ({ 
  name, 
  value, 
  onChange, 
  label, 
  horarios, 
  error, 
  helperText,
  formData,
  verificarHorarioOcupado,
  isEdicao,
  id 
}) => {
  const isHoraFinal = name === 'horaFinal';
  
  const renderMenuItem = (horario) => {
    const ocupado = verificarHorarioOcupado(horario);
    
    const horarioInvalido = isHoraFinal && formData.horaInicial && horario <= formData.horaInicial;
    
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    const dataReserva = formData.data ? formatarDataParaAPI(formData.data) : null;
    
    const horarioPassou = dataReserva === dataHoje && (() => {
      const [hora, minuto] = horario.split(':').map(Number);
      const horarioDate = new Date();
      horarioDate.setHours(hora, minuto, 0);
      return horarioDate <= hoje;
    })();
    
    const finalDisabled = ocupado || horarioInvalido || horarioPassou;
    
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

// Função auxiliar
const formatarDataParaAPI = (data) => {
  if (!data) return null;
  
  const dataLocal = new Date(data);
  const offset = dataLocal.getTimezoneOffset();
  const dataAjustada = new Date(dataLocal.getTime() + (offset * 60 * 1000));
  
  const year = dataAjustada.getFullYear();
  const month = String(dataAjustada.getMonth() + 1).padStart(2, '0');
  const day = String(dataAjustada.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default HorarioSelect;