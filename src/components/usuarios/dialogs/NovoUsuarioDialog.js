import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';
import { StyledDialogTitle, StyledDialogContent, StyledDialogActions, 
  FormLabel, StyledField, StyledSelect, StyledButton } from '../styles';

const NovoUsuarioDialog = ({ open, onClose, formData, onChange, onSubmit, professoresSemUsuario }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: '10px',
          maxWidth: '600px',
          width: '100%'
        }
      }}
    >
      <StyledDialogTitle>
        Criar Usuário Professor
      </StyledDialogTitle>
      <StyledDialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormLabel>Nome de Usuário (email)</FormLabel>
            <StyledField
              fullWidth
              placeholder="Digite o email"
              name="username"
              type="email"
              value={formData.username}
              onChange={onChange}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormLabel>Senha</FormLabel>
            <StyledField
              fullWidth
              placeholder="Digite a senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormLabel>Professor</FormLabel>
            <FormControl fullWidth>
              <StyledSelect
                name="professorId"
                value={formData.professorId}
                onChange={onChange}
                required
                displayEmpty
                renderValue={(value) => {
                  if (!value) return 'Escolha um professor';
                  const professor = professoresSemUsuario.find(p => p.id === value);
                  return professor ? `${professor.nome} - ${professor.escola ? professor.escola : 'Sem Escola/Disciplina'}` : '';
                }}
              >
                <MenuItem value="" disabled>Selecione um professor</MenuItem>
                {professoresSemUsuario.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.nome} - {professor.escola}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
        </Grid>
      </StyledDialogContent>
      <StyledDialogActions>
        <Box display="flex" justifyContent="space-between" width="100%">
          <StyledButton
            variant="outlined"
            onClick={onClose}
          >
            Cancelar
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={onSubmit}
          >
            Cadastrar
          </StyledButton>
        </Box>
      </StyledDialogActions>
    </Dialog>
  );
};

export default NovoUsuarioDialog;