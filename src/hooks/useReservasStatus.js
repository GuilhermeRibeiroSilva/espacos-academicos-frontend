import { useState, useEffect } from 'react';

export const useReservasStatus = (initialReservas = []) => {
  const [reservas, setReservas] = useState(initialReservas);

  // Ordenação de reservas
  const ordenarReservas = (reservasArray) => {
    return [...reservasArray].sort((a, b) => {
      // Comparar por data primeiro
      const dataA = new Date(a.data);
      const dataB = new Date(b.data);
      if (dataA.getTime() !== dataB.getTime()) {
        return dataA - dataB;
      }
      
      // Se a data for a mesma, comparar por hora inicial
      if (a.horaInicial !== b.horaInicial) {
        return a.horaInicial.localeCompare(b.horaInicial);
      }
      
      // Se a hora inicial for a mesma, ordenar por status
      const ordemStatus = {
        'EM_USO': 1,
        'AGUARDANDO_CONFIRMACAO': 2,
        'PENDENTE': 3,
        'UTILIZADO': 4,
        'CANCELADO': 5
      };
      
      return ordemStatus[a.status] - ordemStatus[b.status];
    });
  };

  // Atualizar as reservas com novos dados
  const atualizarReservas = (novasReservas) => {
    setReservas(ordenarReservas(novasReservas));
  };

  // Atualização em tempo real dos status
  useEffect(() => {
    const atualizarStatusReservasEmTempoReal = () => {
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0];
      const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:00`;
      
      setReservas(prevReservas => 
        prevReservas.map(reserva => {
          // Verificar se é de hoje
          if (reserva.data !== dataHoje) return reserva;
          
          // Clone para não mutar o estado diretamente
          const novaReserva = {...reserva};
          
          // Converter PENDENTE para AGENDADO
          if (novaReserva.status === 'PENDENTE') {
            novaReserva.status = 'AGENDADO';
          }
          
          // Para reservas AGENDADO/PENDENTE: se hora inicial <= hora atual < hora final => EM_USO
          if ((reserva.status === 'PENDENTE' || reserva.status === 'AGENDADO') && 
              reserva.horaInicial <= horaAtual && 
              reserva.horaFinal > horaAtual) {
            novaReserva.status = 'EM_USO';
          }
          
          // Para reservas EM_USO: se hora atual >= hora final => AGUARDANDO_CONFIRMACAO
          else if (reserva.status === 'EM_USO' && 
                  reserva.horaFinal <= horaAtual) {
            novaReserva.status = 'AGUARDANDO_CONFIRMACAO';
          }
          
          return novaReserva;
        })
      );
    };
    
    // Atualizar status a cada segundo
    const statusInterval = setInterval(() => {
      atualizarStatusReservasEmTempoReal();
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  return { reservas, atualizarReservas };
};