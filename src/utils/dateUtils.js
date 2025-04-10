import { format, isValid, parseISO, parse } from 'date-fns';

// Converte qualquer formato de data em objeto Date
export const parseAnyDate = (dataStr) => {
  if (!dataStr) return null;
  
  // Se já for um objeto Date
  if (dataStr instanceof Date) return dataStr;
  
  // Se for string, tenta diferentes formatos
  if (typeof dataStr === 'string') {
    // Tenta formato ISO YYYY-MM-DD
    if (dataStr.includes('-')) {
      const parsed = parseISO(dataStr);
      if (isValid(parsed)) return parsed;
    }
    
    // Tenta formato DD/MM/YYYY
    if (dataStr.includes('/')) {
      try {
        const parsed = parse(dataStr, 'dd/MM/yyyy', new Date());
        if (isValid(parsed)) return parsed;
      } catch (e) {
        console.warn("Erro ao converter data DD/MM/YYYY:", dataStr);
      }
    }
  }
  
  console.warn("Formato de data não reconhecido:", dataStr);
  return null;
};

// Função para formatar hora
export const formatarHora = (horaString) => {
  if (!horaString) return '';
  
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(horaString)) {
    return horaString.substring(0, 5);
  }
  
  try {
    const data = parseISO(horaString);
    if (isNaN(data.getTime())) return '';
    return format(data, 'HH:mm');
  } catch (error) {
    return '';
  }
};

// Função para formatar a data corretamente
export const formatarData = (dataString) => {
  if (!dataString) return '';
  
  const data = parseAnyDate(dataString);
  if (!data) return '';
  
  return format(data, 'dd/MM/yyyy');
};

// Função para obter apenas o primeiro e último nome do professor
export const formatarNomeProfessor = (nomeCompleto) => {
  if (!nomeCompleto) return '';
  
  const nomes = nomeCompleto.trim().split(' ');
  if (nomes.length === 1) return nomes[0];
  
  return `${nomes[0]} ${nomes[nomes.length - 1]}`;
};