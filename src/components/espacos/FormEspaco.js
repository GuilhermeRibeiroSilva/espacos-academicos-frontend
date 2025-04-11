import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Grid,
  Alert
} from '@mui/material';

import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';

import { useFeedback } from '../common/Feedback';
import { 
  FormContainer, 
  PageTitle, 
  FormLabel, 
  StyledButton, 
  StyledField 
} from './EspacoStyles'; 

const CAMPO_OBRIGATORIO = 'Campo obrigatório';
const INICIAL_FORM_DATA = {
  sigla: '',
  nome: '',
  descricao: '',
  capacidadeAlunos: '',
  disponivel: true
};

const FormEspaco = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  
  const { showFeedback, FeedbackComponent } = useFeedback();
  
  const [formData, setFormData] = useState(INICIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const isEdicao = Boolean(id);

  useEffect(() => {
    if (isEdicao) {
      carregarEspaco();
    }
  }, [isEdicao]);

  const carregarEspaco = async () => {
    showLoading('Carregando dados do espaço...');
    try {
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
    const processedValue = name === 'capacidadeAlunos' 
      ? (value === '' ? '' : parseInt(value, 10))
      : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
    
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.sigla?.trim()) {
      novosErros.sigla = CAMPO_OBRIGATORIO;
    }
    
    if (!formData.nome?.trim()) {
      novosErros.nome = CAMPO_OBRIGATORIO;
    }
    
    if (!formData.capacidadeAlunos) {
      novosErros.capacidadeAlunos = CAMPO_OBRIGATORIO;
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
    
    const actionText = isEdicao ? 'atualizado' : 'cadastrado';
    showLoading(isEdicao ? 'Atualizando espaço...' : 'Cadastrando espaço...');
    
    try {
      if (isEdicao) {
        await api.put(`/espacos/${id}`, formData);
      } else {
        await api.post('/espacos', formData);
      }
      
      setSuccess(true);
      showFeedback(`Espaço acadêmico ${actionText} com sucesso`, 'success');
      
      
      setTimeout(() => navigate('/espacos'), 2000);
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
        {isEdicao ? 'Editar' : 'Cadastrar'} Espaço Acadêmico
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