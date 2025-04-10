// Função para formatar a data corretamente, evitando o problema de timezone
export const formatarData = (dataString) => {
  if (!dataString) return '';
  
  // Garantir que a data seja tratada como UTC para evitar conversões automáticas
  const data = new Date(dataString + 'T12:00:00Z');
  
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  
  return `${dia}/${mes}/${ano}`;
};

// Formatar hora para exibição
export const formatarHora = (horaString) => {
  if (!horaString) return '';
  return horaString.substring(0, 5); // Formato HH:MM
};

// Traduzir status para exibição
export const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDENTE': 
    case 'AGENDADO': return 'Agendado';
    case 'EM_USO': return 'Em uso';
    case 'AGUARDANDO_CONFIRMACAO': return 'Aguardando confirmação';
    case 'UTILIZADO': return 'Utilizado';
    case 'CANCELADO': return 'Cancelado';
    default: return status;
  }
};

// Função para obter apenas o primeiro e último nome do professor
export const formatarNomeProfessor = (nomeCompleto) => {
  if (!nomeCompleto) return '';
  
  const nomes = nomeCompleto.trim().split(' ');
  if (nomes.length === 1) return nomes[0]; // Se for apenas um nome
  
  return `${nomes[0]} ${nomes[nomes.length - 1]}`; // Primeiro e último nome
};