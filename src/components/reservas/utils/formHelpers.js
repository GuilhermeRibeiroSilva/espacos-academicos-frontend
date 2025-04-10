// Formatar data para API
export const formatarDataParaAPI = (data) => {
  if (!data) return null;
  
  const dataLocal = new Date(data);
  const offset = dataLocal.getTimezoneOffset();
  const dataAjustada = new Date(dataLocal.getTime() + (offset * 60 * 1000));
  
  const year = dataAjustada.getFullYear();
  const month = String(dataAjustada.getMonth() + 1).padStart(2, '0');
  const day = String(dataAjustada.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Validar formulário
export const validarFormulario = (formData) => {
  const errors = {};
  
  // Validar campos obrigatórios
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
      // Se for hoje, verificar se o horário já passou
      const horaAtual = new Date();
      if (formData.horaInicial) {
        const [horaInicialH, horaInicialM] = formData.horaInicial.split(':').map(Number);
        const horaInicialDate = new Date();
        horaInicialDate.setHours(horaInicialH, horaInicialM, 0);
        
        if (horaInicialDate <= horaAtual) {
          errors.horaInicial = 'Não é possível agendar para um horário que já passou';
        }
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
  
  return errors;
};