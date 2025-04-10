import React from 'react';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, addDays, getDay, getDate } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Estilos para o calendário
const CalendarContainer = styled(Box)({
  width: '100%',
  padding: '16px',
  boxSizing: 'border-box',
});

const CalendarHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const CalendarGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px',
});

const DayCell = styled(Box)(({ isCurrentMonth, isSelected, hasReservation }) => ({
  position: 'relative',
  height: '60px',
  border: `1px solid ${isSelected ? '#0F1140' : '#e0e0e0'}`,
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: '4px',
  backgroundColor: 
    isSelected ? 'rgba(15, 17, 64, 0.1)' : 
    !isCurrentMonth ? '#f5f5f5' :
    hasReservation ? 'rgba(66, 165, 245, 0.1)' : 'white',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(15, 17, 64, 0.05)',
  },
}));

const DayNumber = styled(Typography)(({ isCurrentMonth }) => ({
  fontWeight: isCurrentMonth ? 'bold' : 'normal',
  color: isCurrentMonth ? '#000' : '#999',
}));

const ReservationIndicator = styled(Box)(({ reservations }) => {
  const getColor = () => {
    if (!reservations || reservations === 0) return 'transparent';
    if (reservations >= 10) return '#f44336'; // Vermelho (muitas reservas)
    if (reservations >= 5) return '#ff9800';  // Laranja (várias reservas)
    return '#4caf50';  // Verde (poucas reservas)
  };
  
  return {
    position: 'absolute',
    bottom: '4px',
    width: '24px',
    height: '4px',
    backgroundColor: getColor(),
    borderRadius: '2px',
  };
});

const ReservationCount = styled(Typography)({
  fontSize: '10px',
  fontWeight: 'bold',
  position: 'absolute',
  bottom: '8px',
});

const CustomCalendar = ({ 
  currentMonth, 
  selectedDate, 
  diasComReserva, 
  setCurrentMonth, 
  setSelectedDate 
}) => {
  // Obtém os dias do mês atual para exibir
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Inclui dias do mês anterior e próximo para preencher semanas completas
  const startDate = addDays(monthStart, -getDay(monthStart));
  const endDate = addDays(monthEnd, 6 - getDay(monthEnd));
  
  const daysArray = eachDayOfInterval({ start: startDate, end: endDate });
  
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };
  
  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <IconButton onClick={handlePrevMonth} size="small">
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </CalendarHeader>
      
      <CalendarGrid>
        {/* Header com nomes dos dias da semana */}
        {diasDaSemana.map((dia) => (
          <Box 
            key={dia} 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              padding: '8px',
              color: '#0F1140'
            }}
          >
            {dia}
          </Box>
        ))}
        
        {/* Células dos dias */}
        {daysArray.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const reservationCount = diasComReserva[dateKey] || 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <DayCell 
              key={dateKey} 
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              hasReservation={reservationCount > 0}
              onClick={() => handleDateClick(day)}
            >
              <DayNumber 
                variant="body2"
                isCurrentMonth={isCurrentMonth}
              >
                {getDate(day)}
              </DayNumber>
              
              {reservationCount > 0 && (
                <>
                  <ReservationCount>
                    {reservationCount}
                  </ReservationCount>
                  <ReservationIndicator reservations={reservationCount} />
                </>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default CustomCalendar;