import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Container,
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

const FormEspaco = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  const [formData, setFormData] = useState({
    sigla: '',
    nome: '',
    descricao: '',
    capacidadeAlunos: '',
    disponivel: true
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const isEdicao = !!id;

  useEffect(() => {
    if (isEdicao) {
      carregarEspaco();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const carregarEspaco = async () => {
    showLoading('Carregando dados do espaço...');
    try {
      // Corrigido para remover o prefixo /api que está duplicando o caminho
      const response = await api.get(`/espacos/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar espaço:', error);
      showFeedback('Erro ao carregar dados do espaço', 'error');
      navigate('/espacos');
    } finally {
      hideLoading();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacidadeAlunos' ? (value === '' ? '' : parseInt(value)) : value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.sigla || formData.sigla.trim() === '') {
      novosErros.sigla = 'A sigla é obrigatória';
    }
    
    if (!formData.nome || formData.nome.trim() === '') {
      novosErros.nome = 'O nome é obrigatório';
    }
    
    if (!formData.capacidadeAlunos) {
      novosErros.capacidadeAlunos = 'A capacidade é obrigatória';
    } else if (formData.capacidadeAlunos <= 0) {
      novosErros.capacidadeAlunos = 'A capacidade deve ser maior que zero';
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
    
    showLoading(isEdicao ? 'Atualizando espaço...' : 'Cadastrando espaço...');
    try {
      if (isEdicao) {
        await api.put(`/espacos/${id}`, formData);
        setSuccess(true);
        showFeedback('Espaço acadêmico atualizado com sucesso', 'success');
      } else {
        await api.post('/espacos', formData);
        setSuccess(true);
        showFeedback('Espaço acadêmico cadastrado com sucesso', 'success');
      }
      
      // Redirecionar após 2 segundos quando sucesso
      setTimeout(() => {
        navigate('/espacos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar espaço:', error);
      const mensagemErro = error.response?.data?.message || 
                       `Erro ao ${isEdicao ? 'atualizar' : 'cadastrar'} espaço acadêmico`;
      showFeedback(mensagemErro, 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <FormContainer>
      <FeedbackComponent />
      <PageTitle>
        {isEdicao ? 'Editar Espaço Acadêmico' : 'Cadastrar Espaço Acadêmico'}
      </PageTitle>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Espaço acadêmico {isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormLabel>Sigla</FormLabel>
            <StyledField
              fullWidth
              name="sigla"
              value={formData.sigla}
              onChange={handleChange}
              placeholder="Digite a sigla"
              error={!!errors.sigla}
              helperText={errors.sigla}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormLabel>Nome</FormLabel>
            <StyledField
              fullWidth
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
              error={!!errors.nome}
              helperText={errors.nome}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormLabel>Descrição</FormLabel>
            <StyledField
              fullWidth
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Digite a descrição"
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormLabel>Capacidade de Alunos</FormLabel>
            <StyledField
              fullWidth
              name="capacidadeAlunos"
              type="number"
              value={formData.capacidadeAlunos}
              onChange={handleChange}
              placeholder="Digite a capacidade"
              error={!!errors.capacidadeAlunos}
              helperText={errors.capacidadeAlunos}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate('/espacos')}
              >
                Cancelar
              </StyledButton>
              <StyledButton
                type="submit"
                variant="contained"
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

export default FormEspaco;