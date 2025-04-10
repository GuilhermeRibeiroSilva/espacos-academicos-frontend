import React from 'react';
import { 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Grid 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componente estilizado para o filtro
const FilterContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const FiltroEspacos = ({ filtroStatus, handleFiltroChange, handleLimparFiltro, totalEspacos }) => {
  return (
    <FilterContainer>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            <FilterAltIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Filtrar por Status:
          </Typography>
        </Grid>
        <Grid item xs={12} sm={5} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="filtro-status-label">Status</InputLabel>
            <Select
              labelId="filtro-status-label"
              id="filtro-status"
              value={filtroStatus}
              label="Status"
              onChange={handleFiltroChange}
            >
              <MenuItem value="TODOS">Todos os Espaços</MenuItem>
              <MenuItem value="DISPONÍVEL">Disponíveis</MenuItem>
              <MenuItem value="EM_USO">Em Uso</MenuItem>
              <MenuItem value="INDISPONÍVEL">Indisponíveis</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleLimparFiltro}
            fullWidth
          >
            Limpar
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            {totalEspacos} espaço(s) encontrado(s)
          </Typography>
        </Grid>
      </Grid>
    </FilterContainer>
  );
};

export default FiltroEspacos;