import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Grid,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';
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

const FormProfessor = () => {
  const { id } = useParams();
  const isEdicao = !!id;
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  
  const [formData, setFormData] = useState({
    nome: '',
    escola: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEdicao) {
      carregarProfessor();
    }
  }, [id, isEdicao]);
  
  const carregarProfessor = async () => {
    showLoading('Carregando dados do professor...');
    try {
      const response = await api.get(`/professores/${id}`);
      setFormData({
        nome: response.data.nome || '',
        escola: response.data.escola || ''
      });
    } catch (error) {
      console.error('Erro ao carregar professor:', error);
      showFeedback('Erro ao carregar dados do professor', 'error');
      navigate('/professores');
    } finally {
      hideLoading();
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando atualizado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.nome || formData.nome.trim() === '') {
      novosErros.nome = 'O nome é obrigatório';
    }
    
    if (!formData.escola || formData.escola.trim() === '') {
      novosErros.escola = 'A escola é obrigatória';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      showFeedback('Por favor, corrija os erros no formulário', 'error');
      return;
    }
    
    try {
      setLoading(true);
      showLoading(isEdicao ? 'Atualizando professor...' : 'Cadastrando professor...');
      
      if (id) {
        await api.put(`/professores/${id}`, formData);
        setSuccess(true);
        showFeedback('Professor atualizado com sucesso!', 'success');
      } else {
        await api.post('/professores', formData);
        setSuccess(true);
        showFeedback('Professor cadastrado com sucesso!', 'success');
      }
      
      // Redirecionar após 2 segundos quando sucesso
      setTimeout(() => {
        navigate('/professores');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      showFeedback(
        `Erro ao ${id ? 'atualizar' : 'cadastrar'} professor. ${error.response?.data?.message || error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  };
  
  return (
    <FormContainer>
      <FeedbackComponent />
      <PageTitle>
        {isEdicao ? 'Editar Professor' : 'Cadastrar Professor'}
      </PageTitle>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Professor {isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormLabel>Nome</FormLabel>
            <StyledField
              fullWidth
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
              required
              error={!!errors.nome}
              helperText={errors.nome}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormLabel>Escola</FormLabel>
            <StyledField
              fullWidth
              name="escola"
              value={formData.escola}
              onChange={handleChange}
              placeholder="Digite a escola"
              required
              error={!!errors.escola}
              helperText={errors.escola}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate('/professores')}
                disabled={loading}
              >
                Cancelar
              </StyledButton>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {isEdicao ? 'Atualizar' : 'Cadastrar'}
              </StyledButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormContainer>
  );
};

export default FormProfessor;