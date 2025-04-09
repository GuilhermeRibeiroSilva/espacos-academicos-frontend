import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { styled } from '@mui/material/styles';

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

const FormUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdicao = !!id;
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ROLE_PROFESSOR',
    professorId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarProfessores();
    if (id) {
      carregarUsuario();
    }
  }, [id]);

  const carregarProfessores = async () => {
    try {
      const response = await api.get('/professores');
      setProfessores(response.data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      setError('Erro ao carregar lista de professores');
    }
  };

  const carregarUsuario = async () => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados do usuário');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar campo de username
    if (!formData.username.includes('@')) {
      setError('O username deve ser um email válido');
      setLoading(false);
      return;
    }

    // Validar campo de senha em caso de novo usuário
    if (!id && (!formData.password || formData.password.length < 6)) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Validar seleção de professor quando role é professor
    if (formData.role === 'ROLE_PROFESSOR' && !formData.professorId) {
      setError('É necessário selecionar um professor');
      setLoading(false);
      return;
    }

    try {
      if (id) {
        await api.put(`/usuarios/${id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      setSuccess(true);
      
      // Redirecionar após 2 segundos quando sucesso
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setError('Erro ao salvar usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <PageTitle>
        {isEdicao ? 'Editar Usuário' : 'Novo Usuário'}
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Usuário {isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormLabel>Username</FormLabel>
            <StyledField
              fullWidth
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite o email do usuário"
              required
              disabled={loading}
            />
          </Grid>

          {!isEdicao && (
            <Grid item xs={12}>
              <FormLabel>Senha</FormLabel>
              <StyledField
                fullWidth
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite a senha"
                required
                disabled={loading}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormLabel>Tipo de Usuário</FormLabel>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <StyledSelect
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
                <MenuItem value="ROLE_PROFESSOR">Professor</MenuItem>
              </StyledSelect>
            </FormControl>
          </Grid>

          {formData.role === 'ROLE_PROFESSOR' && (
            <Grid item xs={12} md={6}>
              <FormLabel>Professor</FormLabel>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <StyledSelect
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  required={formData.role === 'ROLE_PROFESSOR'}
                  disabled={loading}
                >
                  <MenuItem value="" disabled>Selecione um professor</MenuItem>
                  {professores.map(professor => (
                    <MenuItem key={professor.id} value={professor.id}>
                      {professor.nome}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate('/usuarios')}
                disabled={loading}
              >
                Cancelar
              </StyledButton>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </StyledButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormContainer>
  );
};

export default FormUsuario;