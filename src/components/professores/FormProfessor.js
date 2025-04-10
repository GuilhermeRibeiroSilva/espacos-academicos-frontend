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

// Constantes para mensagens
const MENSAGENS = {
  ERRO_NOME: 'O nome é obrigatório',
  ERRO_ESCOLA: 'A escola é obrigatória',
  ERRO_FORMULARIO: 'Por favor, corrija os erros no formulário',
  CARREGANDO_PROFESSOR: 'Carregando dados do professor...',
  ERRO_CARREGAR: 'Erro ao carregar dados do professor',
  CADASTRANDO: 'Cadastrando professor...',
  ATUALIZANDO: 'Atualizando professor...',
  SUCESSO_CADASTRO: 'Professor cadastrado com sucesso!',
  SUCESSO_ATUALIZACAO: 'Professor atualizado com sucesso!',
};

const CAMPOS_INICIAIS = {
  nome: '',
  escola: ''
};

const FormProfessor = () => {
  const { id } = useParams();
  const isEdicao = !!id;
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  
  const [formData, setFormData] = useState(CAMPOS_INICIAIS);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEdicao) {
      carregarProfessor();
    }
  }, [id]);
  
  const carregarProfessor = async () => {
    showLoading(MENSAGENS.CARREGANDO_PROFESSOR);
    try {
      const response = await api.get(`/professores/${id}`);
      setFormData({
        nome: response.data.nome || '',
        escola: response.data.escola || ''
      });
    } catch (error) {
      console.error('Erro ao carregar professor:', error);
      showFeedback(MENSAGENS.ERRO_CARREGAR, 'error');
      navigate('/professores');
    } finally {
      hideLoading();
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando atualizado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.nome?.trim()) {
      novosErros.nome = MENSAGENS.ERRO_NOME;
    }
    
    if (!formData.escola?.trim()) {
      novosErros.escola = MENSAGENS.ERRO_ESCOLA;
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      showFeedback(MENSAGENS.ERRO_FORMULARIO, 'error');
      return;
    }
    
    try {
      const mensagem = isEdicao ? MENSAGENS.ATUALIZANDO : MENSAGENS.CADASTRANDO;
      showLoading(mensagem);
      
      if (isEdicao) {
        await api.put(`/professores/${id}`, formData);
        showFeedback(MENSAGENS.SUCESSO_ATUALIZACAO, 'success');
      } else {
        await api.post('/professores', formData);
        showFeedback(MENSAGENS.SUCESSO_CADASTRO, 'success');
      }
      
      // Redirecionar após 2 segundos quando sucesso
      setTimeout(() => navigate('/professores'), 2000);
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      const mensagemErro = error.response?.data?.message || error.message;
      showFeedback(
        `Erro ao ${isEdicao ? 'atualizar' : 'cadastrar'} professor. ${mensagemErro}`,
        'error'
      );
    } finally {
      hideLoading();
    }
  };

  // Components de formulário reutilizáveis
  const CampoFormulario = ({ nome, label, placeholder }) => (
    <Grid item xs={12}>
      <FormLabel>{label}</FormLabel>
      <StyledField
        fullWidth
        name={nome}
        value={formData[nome]}
        onChange={handleChange}
        placeholder={placeholder}
        required
        error={!!errors[nome]}
        helperText={errors[nome]}
      />
    </Grid>
  );
  
  return (
    <FormContainer>
      <FeedbackComponent />
      <PageTitle>
        {isEdicao ? 'Editar Professor' : 'Cadastrar Professor'}
      </PageTitle>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <CampoFormulario 
            nome="nome" 
            label="Nome" 
            placeholder="Digite o nome" 
          />
          
          <CampoFormulario 
            nome="escola" 
            label="Escola/Disciplina" 
            placeholder="Digite a escola/disciplina" 
          />
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <StyledButton
                variant="outlined"
                onClick={() => navigate('/professores')}
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

export default FormProfessor;